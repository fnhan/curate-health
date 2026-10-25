/**
 * Two photograph corrections on the Tai Chi page, Frank 2026-10-24.
 *
 *   node scripts/fix-tai-chi-photos.js
 *   node scripts/fix-tai-chi-photos.js --apply
 *
 * THE CALL TO ACTION PHOTOGRAPH IS RECENTRED ON HIS FACE
 *
 * "center the center of his face to the exact center of the page". The first
 * crop was centred on the frame rather than on him, and he stands left of
 * centre in it.
 *
 * His face was measured rather than guessed, and the first measurement was
 * wrong: read off a percentage grid over the full frame it came out at 52.5%
 * across and 28% down, and a trial crop with crosshairs on it showed the real
 * position is 47.65% and 33.6%. A grid is harder to read against a busy
 * photograph than a crosshair on the thing itself. The crop is the tallest
 * one that keeps that point at the centre, and object-cover crops
 * symmetrically, so a subject centred in the file stays centred in the band
 * at every viewport size.
 *
 * THE PALM PHOTOGRAPH GOES BACK WHOLE, WITH THE CROP IN THE STUDIO
 *
 * "revert back to the original pony tail palm photo and leave it uncropped,
 * and instead have it hotspot for the area that you have cropped". So the
 * full 5184x2920 frame is uploaded and the framing moves into Sanity, where
 * he can drag it. The crop rectangle and hotspot below are the exact region
 * the baked crop used, so the page looks the same until he moves it.
 *
 * This works on the section image because TREATMENT_BY_SLUG_QUERY projects
 * imageSource with crop and hotspot and AlternatingSections runs it through
 * SanityImage. It would NOT work on the hero, which is still plain
 * next/image, which is why the hero stays baked.
 */
const fs = require("fs");
const path = require("path");

const { query, mutate, uploadImage } = require("./lib/sanity-cli");

const APPLY = process.argv.includes("--apply");

const PHOTOS = process.env.TAI_CHI_PHOTOS;
if (!PHOTOS) {
  console.error("Set TAI_CHI_PHOTOS to the folder holding the files.");
  process.exit(1);
}

const SLUG = "tai-chi";

/**
 * The region the baked crop took, as Sanity expresses it: the fraction of the
 * frame trimmed off each edge, and a hotspot at the centre of what is left.
 *
 *   source  5184 x 2920
 *   region  x 1440 to 4032, y 346 to 2189
 */
const PALM_CROP = {
  _type: "sanity.imageCrop",
  top: 346 / 2920,
  bottom: (2920 - 2189) / 2920,
  left: 1440 / 5184,
  right: (5184 - 4032) / 5184,
};

const PALM_HOTSPOT = {
  _type: "sanity.imageHotspot",
  x: (1440 + 2592 / 2) / 5184,
  y: (346 + 1843 / 2) / 2920,
  width: 2592 / 5184,
  height: 1843 / 2920,
};

const PALM_ALT =
  "Dr. David Gabriele's hands held open in a Tai Chi posture, with a potted palm behind them.";

const CTA_ALT =
  "Dr. David Gabriele standing with his arms crossed at his chest, eyes closed, at the end of a Tai Chi movement.";

const round = (n) => Math.round(n * 10000) / 10000;

(async () => {
  const treatment = await query(
    `*[_type == "treatments" && treatmentSlug.current == $slug][0]{
      _id, _rev,
      "sectionAsset": additionalSections[0].sectionImage.image.asset->{_id, originalFilename, "w": metadata.dimensions.width, "h": metadata.dimensions.height},
      "sectionCrop": additionalSections[0].sectionImage.image.crop,
      "ctaAsset": cta.ctaBg.asset->{_id, originalFilename, "w": metadata.dimensions.width, "h": metadata.dimensions.height},
      additionalSections, cta
    }`,
    { slug: SLUG }
  );

  if (!treatment) throw new Error("no Tai Chi treatment, run apply-tai-chi-page.js first");

  const whole = path.join(PHOTOS, "photo1.jpg");
  const cta = path.join(PHOTOS, "taichi-cta.jpg");
  for (const f of [whole, cta]) {
    if (!fs.existsSync(f)) throw new Error(`missing ${f}`);
  }

  console.log();
  console.log("  THE PALM PHOTOGRAPH");
  console.log(
    `    was  ${treatment.sectionAsset?.originalFilename} at ${treatment.sectionAsset?.w}x${treatment.sectionAsset?.h}, cropped before upload`
  );
  console.log(
    `    now  the whole frame at 5184x2920, cropped in the Studio where he can move it`
  );
  console.log(
    `    crop  top ${round(PALM_CROP.top)}  bottom ${round(PALM_CROP.bottom)}  left ${round(PALM_CROP.left)}  right ${round(PALM_CROP.right)}`
  );
  console.log(
    `    hotspot  x ${round(PALM_HOTSPOT.x)}  y ${round(PALM_HOTSPOT.y)}`
  );
  console.log();
  console.log("  THE CALL TO ACTION PHOTOGRAPH");
  console.log(
    `    was  centred on the frame, so he sits left of centre`
  );
  console.log(
    `    now  centred on his face, measured at 47.65% across and 33.6% down`
  );
  console.log(
    `    crop  x 1112 to 3829, y 0 to 1962 of 5184x2920, drawn at 1440x1040`
  );
  console.log();

  if (!APPLY) {
    console.log("  Dry run. Nothing written. Re-run with --apply.");
    return;
  }

  const wholeAsset = await uploadImage(
    fs.readFileSync(whole),
    "tai-chi-hands-whole-frame.jpg",
    "image/jpeg"
  );
  console.log(`  uploaded ${wholeAsset._id}`);

  const ctaAsset = await uploadImage(
    fs.readFileSync(cta),
    "tai-chi-closing-posture-centred.jpg",
    "image/jpeg"
  );
  console.log(`  uploaded ${ctaAsset._id}`);

  /*
   * additionalSections is written whole rather than by index, per the CH-028
   * note: an indexed patch alongside an array write in one transaction is
   * applied first and then overwritten, and the script reports success.
   */
  const sections = treatment.additionalSections.map((s, i) =>
    i === 0
      ? {
          ...s,
          sectionImage: {
            ...s.sectionImage,
            alt: PALM_ALT,
            image: {
              _type: "image",
              asset: { _type: "reference", _ref: wholeAsset._id },
              crop: PALM_CROP,
              hotspot: PALM_HOTSPOT,
            },
          },
        }
      : s
  );

  const result = await mutate([
    {
      patch: {
        id: treatment._id,
        ifRevisionID: treatment._rev,
        set: {
          additionalSections: sections,
          "cta.ctaBg": {
            _type: "image",
            asset: { _type: "reference", _ref: ctaAsset._id },
          },
          "cta.ctaBgAlt": CTA_ALT,
        },
      },
    },
  ]);

  console.log(`\n  Applied. Transaction ${result.transactionId}.`);
  console.log("  The two superseded crops stay in the library, per CH-117.");
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
