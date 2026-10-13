/**
 * Take the unsourced statistic out of the Curate Lifestyle medication FAQ.
 *
 *   node scripts/soften-outcome-claim.js            # dry run
 *   node scripts/soften-outcome-claim.js --apply
 *
 * The answer to "Can this help me reduce medications?" opened "Absolutely" and
 * then quoted "Over 80% of participants". Two problems in one sentence: a
 * fabricated statistic, which the content rules forbid outright, and a
 * guarantee about a clinical outcome on a page selling the programme.
 *
 * Frank wrote the replacement on 2026-10-12. It keeps the same four
 * biomarkers and the "under medical supervision" qualifier, drops the number,
 * and turns the guarantee into a possibility.
 *
 * ONE EDIT TO HIS WORDING, AND IT IS SMALL
 *
 * He wrote "Many participants often see". "Many" and "often" are the same
 * hedge twice and read as nervousness rather than care, which is the opposite
 * of what the sentence is for. "Often" is dropped.
 *
 * THIS IS STILL A CLINICAL CLAIM
 *
 * It is about medication reduction, which belongs to Dr. Leong, whose
 * programme this is, rather than to the site. Frank approved the wording as the
 * owner and a practitioner. If Dr. Leong wants it narrower, this is the field.
 */

const { query, mutate } = require("./lib/sanity-cli");

const BEFORE =
  "Absolutely. Over 80% of participants see improvements in blood pressure, glucose levels, cholesterol, or fatty liver biomarkers, often allowing them to reduce or eliminate medications under medical supervision.";

const AFTER =
  "Many participants see improvements in blood pressure, glucose levels, cholesterol, or fatty liver biomarkers, which may allow them to reduce or eliminate medications under medical supervision.";

async function main() {
  const apply = process.argv.includes("--apply");
  const docs = await query(`*[_type == "serviceLifestyle"]{_id, _rev, faq}`);

  const mutations = [];
  for (const d of docs) {
    let found = false;
    (d.faq || []).forEach((q, qi) => {
      (q.description || []).forEach((b, bi) => {
        (b.children || []).forEach((c, ci) => {
          if (c.text !== BEFORE) return;
          found = true;
          const path = `faq[${qi}].description[${bi}].children[${ci}].text`;
          console.log(`${d._id}${d._id.startsWith("drafts.") ? "  [DRAFT]" : ""}`);
          console.log(`  ${path}   "${q.title}"`);
          console.log(`  before: ${BEFORE}`);
          console.log(`  after:  ${AFTER}\n`);
          mutations.push({
            patch: { id: d._id, ifRevisionID: d._rev, set: { [path]: AFTER } },
          });
        });
      });
    });
    if (!found) console.log(`${d._id}: nothing to change`);
  }

  if (!mutations.length) return console.log("Nothing to write.");
  if (!apply) return console.log(`${mutations.length} patches. Dry run.`);
  const r = await mutate(mutations);
  console.log(`Applied. Transaction ${r.transactionId || "(none)"}`);
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
