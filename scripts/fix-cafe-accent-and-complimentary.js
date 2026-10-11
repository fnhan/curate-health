/**
 * Two copy fixes Frank asked for on 2026-10-11.
 *
 *   node scripts/fix-cafe-accent-and-complimentary.js           # dry run
 *   node scripts/fix-cafe-accent-and-complimentary.js --apply
 *
 * ONE: the accented cafe on /cafe
 *
 * `cafePage.menuDownloadSection.description` reads "our Health Café". The house
 * spelling is "cafe", no accent, anywhere Curate produces, which Frank ruled on
 * 2026-09-12. This was the only accented spelling live in the dataset.
 *
 * TWO: "complimentary" on /our-programs
 *
 * Three uses across two fields, all of them about what a Curate Lifestyle
 * Program member receives. The word is no longer banned, cleared on 2026-10-11,
 * so this is not a rule fix. Frank asked for it out of the Flowpresso lines
 * specifically, and it is redundant in all three: the table column is already
 * headed as extras, and the FAQ question already asks about bonus perks.
 *
 * The FAQ answer also opened with an em dash, which is the one rule Frank
 * reaffirmed as hard in the same conversation. It is a full stop now. That is
 * one of 47 dashes on the site; the rest belong to the copy review rather than
 * here, and this one is only fixed because the sentence was being rewritten
 * anyway.
 *
 * "1 complimentary access to recovery amenities" does not survive deleting the
 * word, since "1 access to" is not English. It reads "1 session in" now.
 *
 * Both arrays are written whole rather than by index, per the CH-028 note: an
 * indexed patch to an array rewritten in the same transaction is silently lost.
 * Patches carry ifRevisionID, so a Studio edit landing mid-run fails the
 * mutation instead of being overwritten.
 */

const { query, mutate } = require("./lib/sanity-cli");

const CAFE_ID = "8a5abd5e-c23c-4023-b8b2-a23574871ab5";
const PROGRAMS_ID = "f30ba541-92a4-4ce6-9e5a-42c75b3ef4f3";

const FAQ_INDEX = 3;
const FAQ_NEW =
  "Yes. Curate Lifestyle Program members receive 1 Flowpresso session and " +
  "1 session in the recovery amenities (e.g., sauna, cold plunge) during the " +
  "program, which can be used up to 1 month after graduating.";

const RULE = "=".repeat(78);

function show(label, before, after) {
  console.log(`\n${label}`);
  console.log(`  before: ${JSON.stringify(before)}`);
  console.log(`  after:  ${JSON.stringify(after)}`);
}

async function main() {
  const apply = process.argv.includes("--apply");

  const [cafe] = await query(`*[_id == $id]`, { id: CAFE_ID });
  const [programs] = await query(`*[_id == $id]`, { id: PROGRAMS_ID });
  if (!cafe || !programs) {
    console.error("One of the documents was not found. Stopping.");
    process.exit(2);
  }

  console.log(RULE);
  console.log("Accented cafe, and complimentary on /our-programs");
  console.log(RULE);

  // --- one: the accent ---
  const cafeBefore = cafe.menuDownloadSection?.description || "";
  const cafeAfter = cafeBefore.replace(/Café/g, "Cafe");
  const cafeChanged = cafeAfter !== cafeBefore;
  show("cafePage.menuDownloadSection.description", cafeBefore, cafeAfter);

  // --- two: the table row ---
  const extras = programs.threePaths?.tableContent?.extras?.curateLifestyle || [];
  const extrasAfter = extras.map((v) =>
    typeof v === "string" ? v.replace(/^Complimentary\s+/i, "") : v
  );
  const extrasChanged = JSON.stringify(extras) !== JSON.stringify(extrasAfter);
  show("threePaths.tableContent.extras.curateLifestyle", extras, extrasAfter);

  // --- three: the FAQ answer ---
  const faq = programs.faq || [];
  const item = faq[FAQ_INDEX];
  const faqBefore = (item?.description?.[0]?.children || [])
    .map((c) => c.text)
    .join("");
  show(`faq[${FAQ_INDEX}] "${item?.title || ""}"`, faqBefore, FAQ_NEW);

  // One span carries the whole answer, so the rewrite replaces its text and
  // leaves every key, mark and block type alone.
  const faqAfter = faq.map((f, i) => {
    if (i !== FAQ_INDEX) return f;
    return {
      ...f,
      description: f.description.map((block, bi) =>
        bi !== 0
          ? block
          : {
              ...block,
              children: block.children.map((child, ci) =>
                ci !== 0 ? child : { ...child, text: FAQ_NEW }
              ),
            }
      ),
    };
  });
  const faqChanged = faqBefore !== FAQ_NEW;

  if (item?.description?.[0]?.children?.length !== 1) {
    console.error(
      `\nRefusing: faq[${FAQ_INDEX}] block 0 has ` +
        `${item?.description?.[0]?.children?.length} spans, not 1. ` +
        `Rewriting only the first would drop the rest.`
    );
    process.exit(2);
  }

  if (!cafeChanged && !extrasChanged && !faqChanged) {
    console.log("\nNothing to change. Already applied.");
    return;
  }

  if (!apply) {
    console.log("\nDry run. Nothing written. Re-run with --apply.");
    return;
  }

  const mutations = [];
  if (cafeChanged) {
    mutations.push({
      patch: {
        id: CAFE_ID,
        ifRevisionID: cafe._rev,
        set: { "menuDownloadSection.description": cafeAfter },
      },
    });
  }
  if (extrasChanged || faqChanged) {
    const set = {};
    if (extrasChanged) {
      set["threePaths.tableContent.extras.curateLifestyle"] = extrasAfter;
    }
    if (faqChanged) set.faq = faqAfter;
    mutations.push({
      patch: { id: PROGRAMS_ID, ifRevisionID: programs._rev, set },
    });
  }

  const result = await mutate(mutations);
  console.log(
    `\nApplied. Transaction ${result.transactionId || "(none returned)"}`
  );
  console.log("Check: node scripts/audit-cafe-accent.js");
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
