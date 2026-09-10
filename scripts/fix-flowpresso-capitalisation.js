/**
 * Corrects FLOWpresso to Flowpresso everywhere it appears.
 *
 *   node scripts/fix-flowpresso-capitalisation.js            dry run
 *   node scripts/fix-flowpresso-capitalisation.js --apply    writes
 *
 * "It's Flowpresso, never FLOWpresso." Frank, 2026-09-10.
 *
 * THIS OVERRIDES CH-023
 *
 * That ticket specified the title "FLOWpresso Therapy Toronto | Curate Health"
 * and scripts/fix-flowpresso-spelling.js applied it. The all-caps FLOW came
 * from the manufacturer's own styling, which is not how Curate writes it.
 * CLAUDE.md has been corrected so the old form does not come back the next
 * time someone reads the ticket.
 *
 * The registered symbol is left exactly where it already is. Nine of the ten
 * occurrences are body copy that already reads FLOWpresso(R) and stays
 * Flowpresso(R); the tenth is seo.pageTitle, which has never carried it and
 * does not gain it here. A title is the string Google truncates hardest, and
 * the trademark is asserted in the body where it belongs.
 *
 * NOT FIXED HERE, BUT FOUND WHILE LOOKING
 *
 * Three things on this same page need a decision rather than a find and
 * replace, so they are reported at the end and left alone:
 *
 *   A grammatical slip in benefits.title, "Curate Health's for FLOWpresso".
 *   "transformative" in cta.ctaText, which the content rules ban.
 *   "One of the few clinics", which uses the word Frank asked to avoid.
 *
 * The "FDA Approved" claim on this page is correct. Frank confirmed it on
 * 2026-09-10. Noted here so it does not get raised again by the next reader.
 */

const { mutate, query } = require("./lib/sanity-cli");

const RULE = "=".repeat(78);

/** Only the all-caps form. Anything already correct is left alone. */
const WRONG = /FLOWpresso/g;
const RIGHT = "Flowpresso";

/** Needs a human, not a replace. Reported, never patched. */
const REVIEW = [
  ["benefits.title", 'reads "Curate Health\'s for", a grammatical slip'],
  ["cta.ctaText", 'uses "transformative", which the content rules ban'],
  [
    "benefits.benefitsList[0].subtitle",
    'says "clinics", the word Frank asked to avoid',
  ],
];

function readPath(doc, path) {
  return path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .reduce((node, key) => (node ? node[key] : undefined), doc);
}

/** Every string on a document, with the path that reaches it. */
function* walk(node, trail = []) {
  if (typeof node === "string") {
    yield [trail.join("."), node];
    return;
  }
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) yield* walk(node[i], [...trail, i]);
    return;
  }
  if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith("_")) continue;
      yield* walk(value, [...trail, key]);
    }
  }
}

/** "a.0.b" back into the "a[0].b" form a Sanity patch wants. */
const toPatchPath = (p) => p.replace(/\.(\d+)(?=\.|$)/g, "[$1]");

async function main() {
  const apply = process.argv.includes("--apply");

  console.log(RULE);
  console.log("Flowpresso, not FLOWpresso");
  console.log(RULE);

  const docs = await query(
    `*[!(_id in path("drafts.**")) && !(_id in path("sanity.**"))]{
      ..., "slug": coalesce(slug.current, treatmentSlug.current)
    }`
  );

  const mutations = [];
  let fields = 0;

  for (const doc of docs) {
    const set = {};

    for (const [path, value] of walk(doc)) {
      if (!WRONG.test(value)) {
        WRONG.lastIndex = 0;
        continue;
      }
      WRONG.lastIndex = 0;

      const fixed = value.replace(WRONG, RIGHT);
      set[toPatchPath(path)] = fixed;
      fields++;

      console.log(`\n  ${doc._type} ${doc.slug || ""}`);
      console.log(`    ${toPatchPath(path)}`);
      console.log(`    was: ${JSON.stringify(value.slice(0, 100))}`);
      console.log(`    now: ${JSON.stringify(fixed.slice(0, 100))}`);
    }

    if (Object.keys(set).length) {
      mutations.push({ patch: { id: doc._id, set } });
    }
  }

  console.log(`\n${RULE}`);
  console.log("LEFT ALONE, NEEDS A DECISION");

  const page = docs.find(
    (d) => d._type === "treatments" && d.slug === "flowpresso-therapy"
  );

  if (page) {
    for (const [path, why] of REVIEW) {
      const value = readPath(page, path);
      if (typeof value !== "string") continue;
      console.log(`\n  ${path}`);
      console.log(`    ${why}`);
      console.log(`    ${JSON.stringify(value.slice(0, 120))}`);
    }
  }

  console.log(`\n${RULE}`);
  console.log(
    `${fields} field(s) across ${mutations.length} document(s) say FLOWpresso.`
  );

  if (!mutations.length) {
    console.log("Nothing to change.");
    return;
  }

  if (!apply) {
    console.log("Dry run. Nothing written.");
    return;
  }

  const result = await mutate(mutations);
  console.log(`Applied. Transaction ${result.transactionId}`);
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  process.exit(1);
});
