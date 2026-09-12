/**
 * Finds "café" with the accent, anywhere in the dataset, and reports every
 * testimonial or quote that renders on the site.
 *
 *   node scripts/audit-cafe-accent.js
 *
 * Exits 1 if any accented spelling is live, 0 when clean.
 *
 * THE HOUSE SPELLING IS "cafe", NEVER "café"
 *
 * Frank's ruling on 2026-09-12, and it covers everything Curate produces:
 * the site, marketing, design. The accent is not a stylistic choice per
 * surface, it is wrong everywhere.
 *
 * Worth knowing why this needs a sweep rather than a grep: the accented form
 * appears inside portable text spans, so it hides in nested arrays that a
 * casual search of the Studio will not surface. It also survives in draft
 * documents, which republish the old spelling the next time somebody publishes.
 */

const { query, walkStrings } = require("./lib/sanity-cli");

const ACCENTED = /caf[\u00e9\u00c9]/g;

/** Fields whose content is somebody's words rather than Curate's. */
const QUOTE_FIELDS = ["quoteText", "testimonials", "quote", "testimonial"];

const ALL = `*[!(_id in path("sanity.**"))]{...}`;

const isDraft = (id) => id.startsWith("drafts.");

async function main() {
  const docs = await query(ALL);

  const hits = [];
  const quotes = [];

  for (const doc of docs) {
    // walkStrings RETURNS the pairs, it does not take a callback. Passing one
    // as the second argument makes it the path prefix, so the body never runs
    // and the audit reports a clean dataset it never looked at. That is how
    // the first version of this script missed every hit.
    for (const [path, value] of walkStrings(doc)) {
      if (typeof value !== "string") continue;

      if (ACCENTED.test(value)) {
        hits.push({
          id: doc._id,
          type: doc._type,
          path,
          draft: isDraft(doc._id),
          text: value.length > 110 ? value.slice(0, 107) + "..." : value,
        });
      }
      ACCENTED.lastIndex = 0;

      if (
        QUOTE_FIELDS.some((f) => path.includes(f)) &&
        value.trim().length > 25
      ) {
        quotes.push({
          id: doc._id,
          type: doc._type,
          path,
          draft: isDraft(doc._id),
          text: value.length > 140 ? value.slice(0, 137) + "..." : value,
        });
      }
    }
  }

  console.log(`Scanned ${docs.length} documents.\n`);

  console.log(`=== "café" with an accent: ${hits.length}`);
  for (const h of hits) {
    console.log(`  ${h.type}${h.draft ? " (DRAFT)" : ""}  ${h.path}`);
    console.log(`     ${h.text}`);
  }
  if (!hits.length) console.log("  none");

  console.log(`\n=== testimonials and quotes: ${quotes.length}`);
  for (const q of quotes) {
    console.log(`  ${q.type}${q.draft ? " (DRAFT)" : ""}  ${q.path}`);
    console.log(`     ${q.text}`);
  }
  if (!quotes.length) console.log("  none");

  if (hits.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 2;
});
