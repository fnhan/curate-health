/**
 * Canadian spelling across the dataset.
 *
 *   node scripts/fix-canadian-spelling.js           # dry run
 *   node scripts/fix-canadian-spelling.js --apply
 *
 * Canadian spelling has been in the content rules from the start and was never
 * enforced by anything, so American forms accumulated in copy written in 2024
 * and in copy approved since. Frank made it a hard rule on 2026-10-11 and asked
 * that it hold even against his own later instruction, so it is checked now
 * rather than trusted.
 *
 * WHAT IS AND IS NOT AMERICAN
 *
 * Canadian English is not British English. It keeps -our and -re, takes -ce on
 * the noun where the verb is -se, and doubles the l before a suffix. It also
 * keeps several American forms, and those are deliberately absent here:
 *
 *   program      correct in Canadian English, not "programme"
 *   organize     -ize is standard in Canadian English, not an Americanism
 *   analyze      same
 *   practice     correct as the noun; "practise" is the verb, and telling them
 *                apart needs a reader, so neither is touched
 *   license      same noun and verb split, same reason
 *
 * Getting those wrong would be a worse error than the one being fixed, which is
 * why this list is short and explicit rather than a general rule.
 */

const { query, mutate } = require("./lib/sanity-cli");

/** American form to Canadian. Order matters: longer forms first. */
const SPELLINGS = [
  ["savored", "savoured"],
  ["savoring", "savouring"],
  ["savors", "savours"],
  ["savor", "savour"],
  ["honored", "honoured"],
  ["honoring", "honouring"],
  ["honorable", "honourable"],
  ["honors", "honours"],
  ["honor", "honour"],
  ["colorful", "colourful"],
  ["colorless", "colourless"],
  ["coloring", "colouring"],
  ["colored", "coloured"],
  ["colors", "colours"],
  ["color", "colour"],
  ["flavorful", "flavourful"],
  ["flavored", "flavoured"],
  ["flavors", "flavours"],
  ["flavor", "flavour"],
  ["behavioral", "behavioural"],
  ["behaviors", "behaviours"],
  ["behavior", "behaviour"],
  ["neighborhood", "neighbourhood"],
  ["neighbors", "neighbours"],
  ["neighbor", "neighbour"],
  ["centered", "centred"],
  ["centering", "centring"],
  ["centers", "centres"],
  ["center", "centre"],
  ["fibers", "fibres"],
  ["fiber", "fibre"],
  ["defense", "defence"],
  ["offense", "offence"],
  ["fulfillment", "fulfilment"],
  ["fulfilled", "fulfilled"],
  ["counseling", "counselling"],
  ["counselor", "counsellor"],
  ["traveled", "travelled"],
  ["traveling", "travelling"],
  ["modeling", "modelling"],
  ["labeled", "labelled"],
  ["labeling", "labelling"],
].filter(([a, b]) => a !== b);

/** Keep the original's capitalisation. */
function matchCase(source, replacement) {
  if (source === source.toUpperCase()) return replacement.toUpperCase();
  if (source[0] === source[0].toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

function canadianise(value) {
  let out = value;
  const changes = [];
  for (const [us, ca] of SPELLINGS) {
    const re = new RegExp(`\\b${us}\\b`, "gi");
    out = out.replace(re, (m) => {
      changes.push(`${m} -> ${matchCase(m, ca)}`);
      return matchCase(m, ca);
    });
  }
  return { text: out, changes };
}

const walk = (n, p, o) => {
  if (n && typeof n === "object") {
    if (Array.isArray(n)) n.forEach((v, i) => walk(v, `${p}[${i}]`, o));
    else
      for (const [k, v] of Object.entries(n)) walk(v, p ? `${p}.${k}` : k, o);
  } else if (typeof n === "string") o.push([p, n]);
};

const RULE = "=".repeat(78);

async function main() {
  const apply = process.argv.includes("--apply");
  const docs = await query(`*[!(_type match "sanity.*")]`);

  const edits = [];
  for (const d of docs) {
    const fields = [];
    walk(d, "", fields);
    for (const [path, value] of fields) {
      const { text, changes } = canadianise(value);
      if (changes.length) {
        edits.push({
          id: d._id,
          type: d._type,
          rev: d._rev,
          path,
          before: value,
          after: text,
          changes,
        });
      }
    }
  }

  console.log(RULE);
  console.log("Canadian spelling");
  console.log(RULE);

  if (!edits.length) {
    console.log("Nothing to change.");
    return;
  }

  for (const e of edits) {
    const i = e.before.search(new RegExp(e.changes[0].split(" -> ")[0], "i"));
    console.log(
      `\n${e.type}  ${e.path}${e.id.startsWith("drafts.") ? "  [DRAFT]" : ""}`
    );
    console.log(`  ${e.changes.join(", ")}`);
    console.log(
      `  ...${e.before.slice(Math.max(0, i - 45), i + 55).replace(/\s+/g, " ")}...`
    );
  }

  const total = edits.reduce((s, e) => s + e.changes.length, 0);
  console.log(
    `\n${total} spellings across ${edits.length} fields in ${new Set(edits.map((e) => e.id)).size} documents`
  );

  if (!apply) {
    console.log("\nDry run. Nothing written. Re-run with --apply.");
    return;
  }

  const byDoc = new Map();
  for (const e of edits) {
    if (!byDoc.has(e.id)) byDoc.set(e.id, { rev: e.rev, set: {} });
    byDoc.get(e.id).set[e.path] = e.after;
  }
  const mutations = [...byDoc.entries()].map(([id, { rev, set }]) => ({
    patch: { id, ifRevisionID: rev, set },
  }));

  const result = await mutate(mutations);
  console.log(
    `\nApplied to ${byDoc.size} documents. Transaction ${result.transactionId || "(none)"}`
  );
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
