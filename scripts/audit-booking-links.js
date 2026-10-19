/**
 * Every booking link in the dataset, and which host it points at.
 *
 * Frank, 2026-10-18: the consult buttons still go to Embodia, which Curate
 * stopped using. Booking is Jane.
 *
 * It walks every document and every string rather than asking for the fields
 * anyone remembers, because these links are spread across treatment CTAs,
 * product CTAs, portable text and site settings, and a field list written
 * from memory is exactly how one gets missed. Read-only.
 */
const { createClient } = require("next-sanity");

const client = createClient({
  projectId: "rwc5kyvy",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

const URL_RE = /https?:\/\/[^\s"'<>)\]]+/gi;

function walk(node, path, out) {
  if (node == null) return;
  if (typeof node === "string") {
    for (const m of node.match(URL_RE) || []) out.push({ path, url: m });
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((v, i) => walk(v, `${path}[${i}]`, out));
    return;
  }
  if (typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith("_") && k !== "_key") continue;
      walk(v, path ? `${path}.${k}` : k, out);
    }
  }
}

const hostOf = (u) => { try { return new URL(u).host.replace(/^www\./, ""); } catch { return "?"; } };

(async () => {
  const docs = await client.fetch(`*[!(_id in path("sanity.**"))]`);
  const rows = [];
  for (const doc of docs) {
    const found = [];
    walk(doc, "", found);
    for (const f of found) rows.push({ type: doc._type, id: doc._id, ...f, host: hostOf(f.url) });
  }

  const byHost = {};
  for (const r of rows) (byHost[r.host] ||= []).push(r);

  console.log(`${docs.length} documents, ${rows.length} URLs\n`);
  console.log("Hosts:");
  for (const [h, rs] of Object.entries(byHost).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${String(rs.length).padStart(3)}  ${h}`);
  }

  const embodia = rows.filter((r) => /embodia/i.test(r.url));
  console.log(`\n${"=".repeat(78)}\nEmbodia: ${embodia.length}\n${"=".repeat(78)}`);
  for (const r of embodia) {
    console.log(`\n  ${r.type}  ${r.id}`);
    console.log(`  ${r.path}`);
    console.log(`  ${r.url}`);
  }
  if (!embodia.length) console.log("\n  none");

  process.exitCode = embodia.length ? 1 : 0;
})().catch((e) => { console.error("FAILED:", e.message); process.exit(2); });
