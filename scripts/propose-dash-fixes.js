/**
 * Propose a replacement for every em and en dash in the dataset.
 *
 *   node scripts/propose-dash-fixes.js                 # writes the review file
 *   node scripts/propose-dash-fixes.js --apply         # writes to Sanity
 *
 * Em and en dashes as punctuation are the one hard content rule Frank
 * reaffirmed on 2026-10-11, after clearing every banned word. They are what is
 * left of the content-rule failures, and they are the whole of the remaining
 * copy sweep.
 *
 * WHY THIS IS NOT A FIND AND REPLACE
 *
 * A dash stands in for four different marks and the right one depends on the
 * sentence. Replacing all of them with a comma produces comma splices in a
 * third of the cases, which trades one rule break for a worse one. So each
 * dash is classified and the proposal is written per category:
 *
 *   range        "(6-15 people)"            an en dash between digits, becomes "to"
 *   paired       "needles-often felt-are"   a parenthetical, becomes two commas
 *   list         "team-Physicians, Naths"   introduces a list, becomes a colon
 *   clause       "you don't rest-you build" two independent clauses, becomes a full stop
 *   trailing     "more stamina-starting"    an afterthought, becomes a comma
 *
 * The classifier is a guess and is meant to be read, not trusted. Every
 * proposal goes into the review file with the rule it used, so a wrong call is
 * visible next to the sentence it would change. **Frank approves the file
 * before --apply runs**, per the content rule about not inventing copy.
 *
 * Nothing here touches hyphens. "evidence-based" is correct and stays.
 */

const fs = require("fs");
const path = require("path");
const { query, mutate } = require("./lib/sanity-cli");

const DASH = /[–—]/;
const REVIEW = path.join(__dirname, "..", "dash-review.md");

/** Second half starts a clause that could stand alone. */
const INDEPENDENT =
  /^\s*(it|they|we|you|he|she|that|this|there|i)\b\s*(’|')?\w*\s/i;

/**
 * An afterthought rather than a list, however many commas follow it. A
 * participle or a preposition after the dash continues the sentence it is in,
 * so a colon there is wrong: "approach: using strategies" does not parse,
 * while "approach, using strategies" does.
 */
const CONTINUATION =
  /^(?:\w+ing\b|such as\b|from\b|like\b|so\b|but\b|then\b|not\b|never\b|all\b|often\b|whether\b|one\b|chosen\b|and\b|or\b|to\b|with\b|for\b|without\b)/i;

function classify(before, after, ch) {
  if (/\d\s*$/.test(before) && /^\s*\d/.test(after)) return "range";
  if (/^\s*(yes|no)\s*$/i.test(before.trim())) return "clause";

  const head = after.replace(/^\s+/, "").slice(0, 140);
  if (CONTINUATION.test(head)) return "trailing";

  // a list follows: several commas and a final "and"
  if ((head.match(/,/g) || []).length >= 2 && /\band\b/.test(head)) return "list";
  if (INDEPENDENT.test(after)) return "clause";
  return "trailing";
}

function applyOne(value) {
  const notes = [];
  let out = "";
  let i = 0;

  // paired dashes inside one sentence become a pair of commas
  const paired = [];
  const positions = [...value.matchAll(/[–—]/g)].map((m) => m.index);
  for (let k = 0; k + 1 < positions.length; k++) {
    const between = value.slice(positions[k] + 1, positions[k + 1]);
    if (between.length <= 60 && !/[.!?]/.test(between)) {
      paired.push(positions[k], positions[k + 1]);
      k++;
    }
  }

  while (i < value.length) {
    const ch = value[i];
    if (!DASH.test(ch)) {
      out += ch;
      i++;
      continue;
    }

    const before = value.slice(0, i);
    const after = value.slice(i + 1);
    const rule = paired.includes(i) ? "paired" : classify(before, after, ch);

    // eat the spaces either side so spacing is decided here, not inherited
    out = out.replace(/\s+$/, "");
    let rest = after.replace(/^\s+/, "");

    if (rule === "range") {
      out += " to ";
    } else if (rule === "list") {
      out += ": ";
    } else if (rule === "clause") {
      out += ". ";
      rest = rest.charAt(0).toUpperCase() + rest.slice(1);
    } else {
      out += ", ";
    }

    notes.push(rule);
    value = out + rest;
    i = out.length;
    out = "";
    // restart the scan over the rebuilt string
    const next = value.slice(i);
    out = value.slice(0, i);
    if (!DASH.test(next)) {
      out += next;
      break;
    }
  }
  return { text: value, notes };
}

/**
 * Keep the original's apostrophe, straight or curly, when the replacement
 * differs only in which one it used.
 *
 * The dataset is mixed: roughly 72 curly to 50 straight across the fields in
 * this sweep, but individual paragraphs are usually consistent with
 * themselves. Copy pasted through a chat window comes back with whichever the
 * client preferred, and silently flipping every apostrophe in a paragraph is a
 * change nobody asked for that shows up in the diff of every future edit.
 *
 * So: if the original used one kind throughout, the replacement is made to
 * match. If the original was already mixed, the replacement is left alone,
 * because there is nothing to match.
 */
function reconcileApostrophes(before, after) {
  const curly = (before.match(/’/g) || []).length;
  const straight = (before.match(/'/g) || []).length;
  if (curly > 0 && straight === 0) return after.replace(/'/g, "’");
  if (straight > 0 && curly === 0) return after.replace(/’/g, "'");
  return after;
}

const walk = (n, p, o) => {
  if (n && typeof n === "object") {
    if (Array.isArray(n)) n.forEach((v, i) => walk(v, `${p}[${i}]`, o));
    else for (const [k, v] of Object.entries(n)) walk(v, p ? `${p}.${k}` : k, o);
  } else if (typeof n === "string") o.push([p, n]);
};

async function main() {
  const apply = process.argv.includes("--apply");
  const docs = await query(`*[!(_type match "sanity.*")]`);

  const proposals = [];
  for (const d of docs) {
    const fields = [];
    walk(d, "", fields);
    for (const [fieldPath, value] of fields) {
      if (!DASH.test(value)) continue;
      const { text, notes } = applyOne(value);
      proposals.push({
        id: d._id,
        type: d._type,
        path: fieldPath,
        before: value,
        after: text,
        rules: notes,
      });
    }
  }

  // --- Frank's own wording, for the items he ruled on ---
  //
  // Matched on the source text, not on the item number. The item numbers come
  // from the order Sanity returns documents in, which is not promised to be
  // stable, so keying overrides by number would eventually write one person's
  // paragraph into another's field. Each override carries the "before" it was
  // written against and is refused if that text is no longer there.
  const ovPath = path.join(__dirname, "dash-overrides.json");
  const exPath = path.join(__dirname, "dash-overrides-expect.json");
  let applied = 0;
  const refused = [];
  if (fs.existsSync(ovPath) && fs.existsSync(exPath)) {
    const ov = JSON.parse(fs.readFileSync(ovPath, "utf8"));
    const ex = JSON.parse(fs.readFileSync(exPath, "utf8"));
    for (const key of Object.keys(ov)) {
      if (key.startsWith("_")) continue;
      const want = ex[key];
      if (!want) {
        refused.push(`${key}: no expectation recorded`);
        continue;
      }
      const flat = (s) => s.replace(/\s+/g, " ").trim();
      const matches = proposals.filter((p) => flat(p.before) === flat(want.before));
      if (matches.length === 0) {
        refused.push(`${key}: source text not found, ${want.field}`);
        continue;
      }
      // Several fields legitimately hold the same sentence, a published
      // document and its draft among them. Frank's ruling applies to each.
      for (const m of matches) {
        m.after = reconcileApostrophes(m.before, ov[key]);
        m.rules = ["frank"];
        applied++;
      }
    }
  }
  if (refused.length) {
    console.error("\nRefused overrides:");
    for (const r of refused) console.error("  " + r);
    console.error("\nThe dataset has moved under the review file. Regenerate it.");
    process.exit(2);
  }

  const counts = {};
  for (const p of proposals) for (const r of p.rules) counts[r] = (counts[r] || 0) + 1;

  const lines = [
    "# Dash sweep, for review",
    "",
    `${proposals.length} fields, ${Object.values(counts).reduce((a, b) => a + b, 0)} dashes.`,
    "",
    "Rule used per dash, so a wrong call is visible beside the sentence:",
    "",
    ...Object.entries(counts).map(([k, v]) => `- **${k}** ${v}`),
    "",
    "`range` becomes \"to\", `paired` becomes two commas, `list` becomes a colon,",
    "`clause` becomes a full stop with the next word capitalised, `trailing`",
    "becomes a comma.",
    "",
    "---",
    "",
  ];

  let n = 0;
  for (const p of proposals) {
    n++;
    lines.push(`### ${n}. \`${p.type}\` · \`${p.path}\``);
    lines.push(`rules: ${p.rules.join(", ")}`);
    lines.push("");
    lines.push("**before**");
    lines.push("");
    lines.push("> " + p.before.replace(/\n+/g, " ").trim());
    lines.push("");
    lines.push("**after**");
    lines.push("");
    lines.push("> " + p.after.replace(/\n+/g, " ").trim());
    lines.push("");
  }

  fs.writeFileSync(REVIEW, lines.join("\n"));
  console.log(`${proposals.length} fields, ${Object.values(counts).reduce((a, b) => a + b, 0)} dashes`);
  for (const [k, v] of Object.entries(counts)) console.log(`  ${String(v).padStart(3)}  ${k}`);
  console.log(`\nReview file: dash-review.md`);

  if (!apply) {
    console.log("\nNot applied. Frank approves the file first, then --apply.");
    return;
  }

  // group by document so each is one patch carrying its own revision
  const byDoc = new Map();
  for (const p of proposals) {
    if (!byDoc.has(p.id)) byDoc.set(p.id, []);
    byDoc.get(p.id).push(p);
  }

  const mutations = [];
  for (const [id, items] of byDoc) {
    const doc = docs.find((d) => d._id === id);
    const set = {};
    for (const it of items) set[it.path] = it.after;
    mutations.push({ patch: { id, ifRevisionID: doc._rev, set } });
  }

  const result = await mutate(mutations);
  console.log(`\nApplied to ${byDoc.size} documents. Transaction ${result.transactionId || "(none)"}`);
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
