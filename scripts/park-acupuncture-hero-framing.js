/**
 * Keep the Acupuncture hero looking exactly as it does today.
 *
 *   node scripts/park-acupuncture-hero-framing.js
 *   node scripts/park-acupuncture-hero-framing.js --apply
 *   node scripts/park-acupuncture-hero-framing.js --restore --apply
 *
 * Frank, 2026-10-25, asking for the hero fix: "make sure that none of the
 * current hero images are altered from what it is currently."
 *
 * Of the 21 heroes on the site, exactly one had a crop and a hotspot stored
 * and ignored: Acupuncture. Somebody framed it in the Studio at some point
 * and the page never read it, because the hero rendered through plain
 * next/image. Wiring the Studio's framing up would therefore have moved that
 * one page, which is the thing he asked not to happen.
 *
 * So its framing is parked rather than honoured. Nothing moves today, and
 * every hero including this one can be cropped from now on.
 *
 * THE VALUES ARE HERE, NOT ONLY IN A BACKUP
 *
 * --restore puts them back exactly. The crop takes 12.3% off the top at full
 * width, which shifts the visible band down by roughly 6% of the frame; the
 * hotspot sits a little below centre. If Frank looks at the comparison and
 * prefers it, that is one command.
 */
const { query, mutate } = require("./lib/sanity-cli");

const APPLY = process.argv.includes("--apply");
const RESTORE = process.argv.includes("--restore");

const SLUG = "acupuncture";

/** Read off the document on 2026-10-25, before parking it. */
const PARKED = {
  crop: {
    _type: "sanity.imageCrop",
    top: 0.12283861879859312,
    bottom: 0.00035151268563082816,
    left: 0,
    right: 0,
  },
  hotspot: {
    _type: "sanity.imageHotspot",
    x: 0.4980334974315069,
    y: 0.5920913020254845,
    width: 0.9902209974315065,
    height: 0.8151143705777694,
  },
};

(async () => {
  const t = await query(
    `*[_type == "treatments" && treatmentSlug.current == $slug][0]{
      _id, _rev, title,
      "crop": heroImage.crop, "hotspot": heroImage.hotspot,
      "d": heroImage.asset->metadata.dimensions
    }`,
    { slug: SLUG }
  );
  if (!t) throw new Error("no acupuncture treatment");

  const has = Boolean(t.crop || t.hotspot);

  console.log();
  console.log(`  ${t.title}, hero framing`);
  console.log(`  source ${t.d?.width}x${t.d?.height}`);
  console.log(`  stored now: ${has ? "a crop and hotspot" : "none"}`);

  if (RESTORE) {
    if (has) {
      console.log("\n  Already framed. Nothing to restore.");
      return;
    }
    console.log("\n  WOULD RESTORE the crop and hotspot recorded in this script.");
    console.log("  The hero band then shifts down about 6% of the frame.");
  } else {
    if (!has) {
      console.log("\n  Already parked. Nothing to do.");
      return;
    }
    const { crop } = t;
    console.log(
      `\n  WOULD PARK: crop takes ${(crop.top * 100).toFixed(1)}% off the top, ` +
        `${(crop.bottom * 100).toFixed(2)}% off the bottom, full width.`
    );
    console.log("  The page then renders exactly as it does today.");
    console.log("  Put it back with --restore --apply.");
  }

  if (!APPLY) {
    console.log("\n  Dry run. Nothing written. Add --apply.");
    return;
  }

  const result = await mutate([
    RESTORE
      ? {
          patch: {
            id: t._id,
            ifRevisionID: t._rev,
            set: { "heroImage.crop": PARKED.crop, "heroImage.hotspot": PARKED.hotspot },
          },
        }
      : {
          patch: {
            id: t._id,
            ifRevisionID: t._rev,
            unset: ["heroImage.crop", "heroImage.hotspot"],
          },
        },
  ]);

  console.log(`\n  Applied. Transaction ${result.transactionId}.`);

  const after = await query(
    `*[_type == "treatments" && treatmentSlug.current == $slug][0]{
      "crop": heroImage.crop, "hotspot": heroImage.hotspot}`,
    { slug: SLUG }
  );
  console.log(
    `  Reading back: ${after.crop || after.hotspot ? "framed" : "no crop, no hotspot"}`
  );
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
