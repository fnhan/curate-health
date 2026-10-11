/**
 * Replace the B Corp section's photograph on /about/sustainability.
 *
 *   node scripts/swap-bcorp-section-image.js            # dry run
 *   node scripts/swap-bcorp-section-image.js --apply
 *
 * WHAT WAS WRONG WITH THE OLD ONE
 *
 * The section shipped on 2026-10-10 carrying a stock photograph of a tea
 * plantation with the B Corp mark burned into it, 1920x1280 and 5.76 MB. Frank
 * called it blurry and he was right: the slot paints 704x556 and crops with
 * object-cover, so a soft composite got softer, and nothing about a tea estate
 * says anything about a clinic in Midtown Toronto.
 *
 * THE REPLACEMENT
 *
 * Built from `FrontPage_Eighth_Section.jpg`, already in the library at
 * 5575x3717 and referenced by nothing, so it is greenery Curate owns that has
 * never appeared on the site. The mark is composited over it in white, which is
 * one of the two colours B Lab permits, with a soft radial scrim behind it so
 * the mark holds against the leaves.
 *
 * Output is 1600x1267. That ratio is 1.263 against the slot's 1.266, so
 * object-cover crops essentially nothing and the mark stays centred and whole.
 * B Lab does not allow the mark to be cropped, which is why the ratio was
 * matched to the slot rather than left to chance.
 *
 * The mark is drawn from its ink rather than its canvas. The asset carries
 * transparent margins, 14.6% and 14.7% at the sides and 9.9% and 8.6% top and
 * bottom, so sizing by the file would have made the visible mark smaller than
 * intended and sat it off centre.
 *
 * HOW IT WAS MADE, SINCE IT IS NOT REPRODUCIBLE FROM THIS FILE ALONE
 *
 * Composited on a canvas in the browser, because there is no image library in
 * this project and a native dependency was not worth adding for one picture.
 * To redo it, see the B Corp notes in CLAUDE.md. The finished file is uploaded
 * here so the result is in Sanity rather than in the repository.
 */

const fs = require("fs");
const path = require("path");
const { query, mutate, uploadImage } = require("./lib/sanity-cli");

const PUBLISHED_ID = "c0ca5697-0672-4e6b-80c2-8c9c898de6e7";
const SECTION_KEY = "bcorp-certification";
const SOURCE = path.join(
  process.env.USERPROFILE || process.env.HOME,
  "Downloads",
  "bcorp-foliage-1600x1267.jpg"
);

const RULE = "=".repeat(78);

async function main() {
  const apply = process.argv.includes("--apply");

  if (!fs.existsSync(SOURCE)) {
    console.error(`Composite not found at ${SOURCE}`);
    process.exit(2);
  }
  const buffer = fs.readFileSync(SOURCE);

  const [doc] = await query(`*[_id == $id]`, { id: PUBLISHED_ID });
  if (!doc) {
    console.error("Published sustainability document not found.");
    process.exit(2);
  }

  const sections = doc.additionalSections || [];
  const index = sections.findIndex((s) => s._key === SECTION_KEY);
  if (index === -1) {
    console.error(`No section with _key "${SECTION_KEY}".`);
    process.exit(2);
  }

  const current = sections[index].sectionImage?.image?.asset?._ref;

  console.log(RULE);
  console.log("Swap the B Corp section photograph");
  console.log(RULE);
  console.log(`file:       ${path.basename(SOURCE)}  ${(buffer.length / 1024).toFixed(0)} KB`);
  console.log(`section:    [${index}] ${sections[index].sectionTitle}`);
  console.log(`current:    ${current}`);
  console.log(`alt stays:  ${JSON.stringify(sections[index].sectionImage?.alt)}`);

  if (!apply) {
    console.log("\nDry run. Nothing uploaded, nothing written.");
    return;
  }

  const asset = await uploadImage(
    buffer,
    "bcorp-certification-foliage.jpg",
    "image/jpeg"
  );
  const assetId = asset._id || asset.document?._id;
  if (!assetId) throw new Error("Upload returned no asset id");
  console.log(`\nuploaded:   ${assetId}`);

  // The array is written whole. An indexed patch to an array rewritten in the
  // same transaction is silently lost, per the CH-028 note.
  const next = sections.map((s, i) =>
    i !== index
      ? s
      : {
          ...s,
          sectionImage: {
            ...s.sectionImage,
            image: {
              _type: "image",
              asset: { _ref: assetId, _type: "reference" },
            },
          },
        }
  );

  const result = await mutate([
    {
      patch: {
        id: PUBLISHED_ID,
        ifRevisionID: doc._rev,
        set: { additionalSections: next },
      },
    },
  ]);
  console.log(`patched:    transaction ${result.transactionId || "(none returned)"}`);
  console.log("\nThe old tea-plantation asset is left in the library, unreferenced.");
  console.log("It is a candidate for CH-117 rather than something to delete here.");
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
