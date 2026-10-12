/**
 * Two corrections Frank asked for on 2026-10-12.
 *
 *   node scripts/fix-byline-logo-and-fda.js            # dry run
 *   node scripts/fix-byline-logo-and-fda.js --apply
 *
 * 1. THE BLOG BYLINE MARK IS THE WHITE ASSET, NOT A BLACK ONE INVERTED
 *
 * Both author records pointed at `logo-black.png`, pure black on transparency,
 * and the byline painted it white with `brightness-0 invert`. The rendered
 * pixels were right, which is why every check passed, and the record itself was
 * still the black logo: anyone opening it in the Studio saw a black mark on a
 * document whose only job is the white one.
 *
 * `CurateHealth_logo_symbol_white.png` was already in the library, 1723x1726,
 * 80.5% transparent, average opaque luminance 254.9, so it is genuinely white
 * on transparency rather than white on a white box. The records point at it and
 * the filter comes out of the component in the same change. The two have to
 * move together: the filter over a white mark would render it black.
 *
 * 2. FLOWPRESSO IS FDA CLEARED, NOT FDA APPROVED
 *
 * The benefit subtitle claimed "FDA Approved". Those are different FDA
 * pathways, not synonyms. Approval means premarket approval, PMA, for high risk
 * Class III devices. Clearance means a 510(k), a finding of substantial
 * equivalence to a device already on the market. The FDA treats "FDA approved"
 * on a cleared device as misbranding.
 *
 * Flowpresso holds 510(k) clearance K223729, granted to Medella Health Limited,
 * Class II, product codes IRP and IRT under 21 CFR 890.5650, substantially
 * equivalent to the Therm-X heat and compression device. Flowpresso's own site
 * calls it "an FDA-cleared Class II medical device".
 *
 * Two other things went with it in the same sentence. "Proven to deliver
 * effective treatment" is an efficacy claim with nothing behind it, and
 * "cutting-edge" is hype against the tone rule.
 */

const { query, mutate } = require("./lib/sanity-cli");

const WHITE_MARK = "image-3e1c966a4693583e8efb7425b293404d2481516f-1723x1726-png";

const FDA_BEFORE =
  "Flowpresso® Therapy is FDA Approved cutting-edge technology that's been proven to deliver effective, non-invasive treatment.";
const FDA_AFTER =
  "Flowpresso® Therapy is an FDA cleared Class II medical device, delivering non-invasive compression and heat therapy under a practitioner's supervision.";

async function main() {
  const apply = process.argv.includes("--apply");
  const mutations = [];

  // --- the byline mark ---
  const authors = await query(
    `*[_type == "author"]{_id, _rev, "assetRef": image.asset._ref,
      "file": image.asset->originalFilename}`
  );
  for (const a of authors) {
    if (a.assetRef === WHITE_MARK) {
      console.log(`${a._id}: already the white mark`);
      continue;
    }
    console.log(`${a._id}  image.asset`);
    console.log(`  before: ${a.file}  (${a.assetRef})`);
    console.log(`  after:  CurateHealth_logo_symbol_white.png  (${WHITE_MARK})`);
    mutations.push({
      patch: {
        id: a._id,
        ifRevisionID: a._rev,
        set: { "image.asset": { _type: "reference", _ref: WHITE_MARK } },
      },
    });
  }

  // --- the FDA claim ---
  const treatments = await query(
    `*[_type == "treatments" && defined(benefits.benefitsList)]{_id, _rev, benefits}`
  );
  for (const t of treatments) {
    const i = (t.benefits.benefitsList || []).findIndex(
      (b) => b.subtitle === FDA_BEFORE
    );
    if (i < 0) continue;
    const path = `benefits.benefitsList[${i}].subtitle`;
    console.log(`\n${t._id}  ${path}`);
    console.log(`  before: ${FDA_BEFORE}`);
    console.log(`  after:  ${FDA_AFTER}`);
    mutations.push({
      patch: { id: t._id, ifRevisionID: t._rev, set: { [path]: FDA_AFTER } },
    });
  }

  if (!mutations.length) return console.log("\nNothing to write.");
  if (!apply) return console.log(`\n${mutations.length} patches. Dry run.`);
  const r = await mutate(mutations);
  console.log(`\nApplied ${mutations.length}. Transaction ${r.transactionId || "(none)"}`);
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
