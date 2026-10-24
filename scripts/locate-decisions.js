/**
 * Where does each of Frank's 48 decisions actually live in Sanity?
 *
 * Read-only. It walks every string in every published document and, for each
 * decision, reports the field whose current value is closest to the text he
 * chose. That is the same reasoning as audit-booking-links.js: a list of field
 * names written from memory is how one gets missed, and these span treatment
 * intros, benefit subtitles, FAQ answers, portable text, alt text and seo
 * objects across a dozen document types.
 *
 * It prints three groups:
 *
 *   LIVE       the field already reads exactly what he chose, nothing to do
 *   FOUND      a field is clearly the one, and its text differs from his
 *   NOT FOUND  nothing close enough; needs a human to say where it goes
 *
 *   node scripts/locate-decisions.js
 *   node scripts/locate-decisions.js c46      # one decision, with the diff
 */
const fs = require("fs");
const path = require("path");

const { query } = require("./lib/sanity-cli");

const DECISIONS_DIR = process.env.DECISIONS_DIR;

if (!DECISIONS_DIR) {
  console.error("Set DECISIONS_DIR to the folder holding the decision JSON.");
  process.exit(1);
}

const only = process.argv[2];

/** Comparable form: no case, no punctuation, single spaces. */
function norm(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * How much of one text appears verbatim in the other, by shared runs of
 * consecutive words.
 *
 * A plain shared-word count was the first attempt and it was useless: it
 * divided by the shorter string, so a two-letter field like the province code
 * "ON" scored 1.00 against a whole paragraph and won. Runs fix that, because
 * a run of five consecutive words only appears in genuinely related text.
 *
 * Short decisions, such as a line of alt text, use runs of three.
 */
function shingles(words, n) {
  const out = new Set();
  for (let i = 0; i + n <= words.length; i++) out.add(words.slice(i, i + n).join(" "));
  return out;
}

function similarity(wanted, candidate) {
  const a = norm(wanted).split(" ").filter(Boolean);
  const b = norm(candidate).split(" ").filter(Boolean);

  // A field far shorter than the text cannot be the field it belongs in.
  if (b.length < 5 || b.length < a.length * 0.3) return 0;

  const n = a.length < 14 ? 3 : 5;
  if (a.length < n || b.length < n) return 0;

  const x = shingles(a, n);
  const y = shingles(b, n);
  let shared = 0;
  for (const s of x) if (y.has(s)) shared++;
  return shared / Math.min(x.size, y.size);
}

/** Every string in a document, with the path that reaches it. */
function* strings(node, trail = []) {
  if (typeof node === "string") {
    yield { path: trail.join("."), value: node };
    return;
  }
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) yield* strings(node[i], [...trail, i]);
    return;
  }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith("_") && k !== "_key") continue;
      yield* strings(v, [...trail, k]);
    }
  }
}

/**
 * Portable text read as one string per block array, as well as per span.
 *
 * Several decisions are a whole paragraph that is stored as spans, so a
 * per-span walk alone would only ever match a fragment of one.
 */
function* portableText(node, trail = []) {
  if (Array.isArray(node) && node.some((b) => b && b._type === "block")) {
    const text = node
      .filter((b) => b._type === "block")
      .map((b) => (b.children ?? []).map((c) => c.text ?? "").join(""))
      .join("\n");
    if (text.trim()) yield { path: trail.join("."), value: text, pt: true };
  }
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++)
      yield* portableText(node[i], [...trail, i]);
    return;
  }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith("_") && k !== "_key") continue;
      yield* portableText(v, [...trail, k]);
    }
  }
}

(async () => {
  const decisions = fs
    .readdirSync(DECISIONS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({
      id: path.basename(f, ".json"),
      ...JSON.parse(fs.readFileSync(path.join(DECISIONS_DIR, f), "utf8")),
    }))
    .filter((d) => (only ? d.id === only : true))
    .sort((a, b) => a.id.localeCompare(b.id));

  // By _type, not by id: an image asset has an id like image-abc..., so the
  // path filter alone let every thumbHash and palette string into the corpus.
  const docs = await query(
    `*[!(_type match "sanity.*") && !(_id in path("drafts.**"))]`
  );

  const fields = [];
  for (const doc of docs) {
    for (const s of strings(doc)) {
      fields.push({ id: doc._id, type: doc._type, ...s });
    }
    for (const s of portableText(doc)) {
      fields.push({ id: doc._id, type: doc._type, ...s });
    }
  }

  console.log(
    `\n  ${docs.length} documents, ${fields.length} strings, ${decisions.length} decisions\n`
  );

  const live = [];
  const found = [];
  const missing = [];

  for (const d of decisions) {
    const wanted = (d.text ?? "").trim();

    if (!wanted) {
      missing.push({ d, why: "the decision has no text" });
      continue;
    }

    let best = null;
    for (const f of fields) {
      const score = similarity(wanted, f.value);
      if (!best || score > best.score) best = { ...f, score };
    }

    if (!best || best.score < 0.45) {
      missing.push({ d, why: `nothing above 0.45 (best ${best?.score.toFixed(2)})` });
      continue;
    }

    if (norm(best.value) === norm(wanted)) live.push({ d, best });
    else found.push({ d, best });
  }

  const line = (x) =>
    `  ${x.d.id}  ${x.d.page} >> ${x.d.where}\n      ${x.best.type}/${x.best.id}\n      ${x.best.path}${x.best.pt ? "  (portable text)" : ""}   match ${x.best.score.toFixed(2)}`;

  console.log(`LIVE ALREADY (${live.length})`);
  for (const x of live) console.log(line(x));

  console.log(`\nTO APPLY (${found.length})`);
  for (const x of found) {
    console.log(line(x));
    if (only) {
      console.log(`\n      NOW: ${x.best.value}\n`);
      console.log(`      HIS: ${x.d.text.trim()}\n`);
    }
  }

  console.log(`\nNOT LOCATED (${missing.length})`);
  for (const x of missing) console.log(`  ${x.d.id}  ${x.d.page} >> ${x.d.where}\n      ${x.why}`);
  console.log();
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
