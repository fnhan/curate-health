/**
 * Corrects "counseling" to the Canadian "counselling" everywhere in Sanity.
 *
 *   node scripts/fix-counselling-spelling.js            dry run
 *   node scripts/fix-counselling-spelling.js --apply    writes
 *
 * Frank, 2026-09-11: "Make sure all versions of counseling is changed to
 * counselling throughout entire website." The content rules already require
 * Canadian spelling throughout; this is the one word that kept surviving
 * because every earlier pass looked at a particular field rather than at
 * everything.
 *
 * WHAT IT CHANGES
 *
 * Every string in every published document, page copy included, in whatever
 * case it was written:
 *
 *   counseling  -> counselling      counselor  -> counsellor
 *   Counseling  -> Counselling      Counselor  -> Counsellor
 *   COUNSELING  -> COUNSELLING      counselors -> counsellors
 *
 * "Counselor" is included on purpose. It is a different word governed by the
 * same rule, and leaving it would mean a page saying "counselling with a
 * counselor".
 *
 * WHAT IT WILL NOT TOUCH, AND WHY
 *
 * Slugs, URLs and links. An address containing the old spelling is either a
 * redirect that has to keep working, such as
 * /services/lifestyle-medicine/nutritional-counseling, or a record nothing
 * reads. Rewriting one changes an address, which is a routing decision with
 * its own redirect, not a spelling fix. The nutritional counselling page
 * itself already lives at the correct address.
 *
 * Image filenames. originalFilename never reaches the page, and editing it
 * does not change what the CDN serves.
 *
 * Draft documents. A draft is someone's unpublished work in the Studio, and
 * patching the published document is what changes the site.
 *
 * Every patch carries ifRevisionID, so a document edited in the Studio between
 * this read and the write fails loudly instead of being overwritten.
 */

const { mutate, query } = require("./lib/sanity-cli");

const RULE = "=".repeat(78);

const PATTERN = /\b(counsel)(ing|or|ors)\b/gi;

/** Paths that hold addresses or file names rather than words. */
const SKIP_PATH =
  /(^|\.)(slug|treatmentSlug|current|href|url|link|mapLink|mapURL|originalFilename|path|_ref|_key|_type|_id|_rev)(\.|\[|$)/i;

/** Values that are an address even when the field name does not say so. */
const LOOKS_LIKE_ADDRESS = /^(https?:\/\/|\/)[^\s]*$/;

function fix(value) {
  return value.replace(PATTERN, (whole, stem, ending) => {
    const doubled =
      ending.toLowerCase() === "ing"
        ? "ling"
        : ending.toLowerCase() === "or"
          ? "lor"
          : "lors";
    const out = stem + doubled;

    if (whole === whole.toUpperCase()) return out.toUpperCase();
    if (whole[0] === whole[0].toUpperCase())
      return out[0].toUpperCase() + out.slice(1).toLowerCase();

    return out.toLowerCase();
  });
}

/** Every string on a document, with the patch path that reaches it. */
function* walk(node, trail = "") {
  if (typeof node === "string") {
    yield [trail, node];
    return;
  }
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++)
      yield* walk(node[i], `${trail}[${i}]`);
    return;
  }
  if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith("_")) continue;
      yield* walk(value, trail ? `${trail}.${key}` : key);
    }
  }
}

async function main() {
  const apply = process.argv.includes("--apply");

  console.log(RULE);
  console.log("counseling -> counselling");
  console.log(RULE);

  const docs = await query(
    `*[!(_id in path("drafts.**")) && !(_id in path("sanity.**"))]`
  );

  const mutations = [];
  const skipped = [];
  let fields = 0;

  for (const doc of docs) {
    const set = {};

    for (const [path, value] of walk(doc)) {
      PATTERN.lastIndex = 0;
      if (!PATTERN.test(value)) continue;
      PATTERN.lastIndex = 0;

      if (SKIP_PATH.test(path) || LOOKS_LIKE_ADDRESS.test(value.trim())) {
        skipped.push(
          `  ${doc._type}  ${path}\n      ${JSON.stringify(value.slice(0, 90))}`
        );
        continue;
      }

      const fixed = fix(value);
      set[path] = fixed;
      fields++;

      const at = value.search(PATTERN);
      PATTERN.lastIndex = 0;
      const from = Math.max(0, at - 40);

      console.log(`\n  ${doc._type}  ${doc.title || doc.name || ""}`.trimEnd());
      console.log(`    ${path}`);
      console.log(`    was: ...${value.slice(from, at + 60)}...`);
      console.log(`    now: ...${fixed.slice(from, at + 61)}...`);
    }

    if (Object.keys(set).length) {
      mutations.push({ patch: { id: doc._id, ifRevisionID: doc._rev, set } });
    }
  }

  console.log(`\n${RULE}`);
  console.log("LEFT ALONE, THESE ARE ADDRESSES OR FILE NAMES");
  console.log(skipped.length ? skipped.join("\n") : "  none");

  console.log(`\n${RULE}`);
  console.log(
    `${fields} field(s) across ${mutations.length} document(s) to change.`
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
