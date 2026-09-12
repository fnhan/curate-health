/**
 * "Bring Your Own Cup" becomes "Bring Your Own Vessel".
 *
 *   node scripts/rename-byo-initiative.js           # dry run, writes nothing
 *   node scripts/rename-byo-initiative.js --apply
 *
 * Frank on 2026-09-12: a vessel can hold food as well as a drink, and the
 * initiative is meant to cover both.
 *
 * SCOPED TO THE INITIATIVE NAME, NOT TO THE WORD
 *
 * "cup" appears three other times on this page, all of it ordinary prose:
 * "every cup, every plate", "every cup and plate is made to order", "sharing a
 * cup". None of those are the initiative and none should change. So this
 * targets one portable text span by its key, the bolded one that holds exactly
 * the initiative name, rather than running a replace across the document.
 *
 * Patches carry ifRevisionID, so a concurrent Studio edit fails the mutation
 * rather than being overwritten. Re-runnable: it reports and exits if the name
 * is already changed.
 */

const { mutate, query } = require("./lib/sanity-cli");

const APPLY = process.argv.includes("--apply");

const BLOCK_KEY = "13a25328bb87";
const SPAN_KEY = "a1c576ce98fe1";
const FROM = "Bring Your Own Cup";
const TO = "Bring Your Own Vessel";

const SURVEY = `*[_type == "cafePage"][0]{
  _id, _rev,
  "span": additionalSections[].sectionParagraph[_key == "${BLOCK_KEY}"][0].children[_key == "${SPAN_KEY}"][0]{_key, text, marks}
}`;

async function main() {
  const doc = await query(SURVEY);
  if (!doc) throw new Error("No cafePage document found.");

  const span = Array.isArray(doc.span) ? doc.span.find(Boolean) : doc.span;

  if (!span) {
    console.error(
      `Could not find span ${SPAN_KEY} in block ${BLOCK_KEY}. The copy has been\n` +
        "edited since this script was written. Find the initiative name in the\n" +
        "Studio and update the keys above rather than widening the match."
    );
    process.exitCode = 2;
    return;
  }

  console.log(`cafePage ${doc._id} rev ${doc._rev}\n`);
  console.log(`  current: ${JSON.stringify(span.text)}`);

  if (span.text === TO) {
    console.log("\nAlready renamed. Nothing to do.");
    return;
  }

  if (span.text !== FROM) {
    console.error(
      `\nExpected ${JSON.stringify(FROM)}. Refusing to overwrite copy that is\n` +
        "neither the old name nor the new one."
    );
    process.exitCode = 2;
    return;
  }

  console.log(`  becomes: ${JSON.stringify(TO)}`);

  const mutations = [
    {
      patch: {
        id: doc._id,
        ifRevisionID: doc._rev,
        set: {
          [`additionalSections[1].sectionParagraph[_key=="${BLOCK_KEY}"].children[_key=="${SPAN_KEY}"].text`]:
            TO,
        },
      },
    },
  ];

  if (!APPLY) {
    console.log("\nDry run. Re-run with --apply to write.");
    return;
  }

  const result = await mutate(mutations);
  console.log(`\nApplied. Transaction ${result.transactionId}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 2;
});
