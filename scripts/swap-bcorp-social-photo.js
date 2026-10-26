/**
 * The photograph on "Why we became one". Frank, 2026-10-25.
 *
 *   node scripts/swap-bcorp-social-photo.js
 *   node scripts/swap-bcorp-social-photo.js --apply
 *
 * He sent this one to replace the gym conversation shot that had itself
 * replaced a stock yoga class. Two men seated in profile in warm light, the
 * nearer one in glasses with a hand against his chin, both looking the same
 * way. It is the right picture for a section about health being social:
 * attention pointed at the same thing, rather than two people photographed
 * near each other.
 *
 * IT IS A TALL PORTRAIT IN A LANDSCAPE SLOT, SO THE CROP IS THE WHOLE JOB
 *
 * 2920x5184, a ratio of 0.563. AlternatingSections paints 704x556, a ratio of
 * 1.266. Left to `object-cover` the browser takes a band from the middle,
 * which here is the hand and the lower half of a face: both heads are in the
 * top 45% of the frame and a centre crop loses them.
 *
 * So the crop is anchored to the top and stored in Sanity rather than baked
 * into the file. `BCORP_PAGE_QUERY` projects the image object and
 * `AlternatingSections` runs it through `SanityImage`, so the Studio's own
 * crop tool decides the frame from here and Frank can drag it himself. Storing
 * the file whole is also what the standing rule from 2026-10-18 asks for.
 *
 * The bottom fraction is the only one that does any work: 2920 wide at 1.266
 * needs 2306 of height, so 2878 of 5184 comes off the bottom. That keeps both
 * heads whole and cuts through the wrist, which reads as an ordinary crop. The
 * alternative, dropping far enough to keep the whole hand, takes the top off
 * the nearer man's head, which does not.
 */
const fs = require("fs");
const path = require("path");

const { mutate, query, uploadImage } = require("./lib/sanity-cli");

const APPLY = process.argv.includes("--apply");

const PHOTO = process.env.BCORP_SOCIAL_PHOTO;
if (!PHOTO) {
  console.error("Set BCORP_SOCIAL_PHOTO to the downloaded file.");
  process.exit(1);
}

const DOC_ID = "bcorpPage";
const SECTION_KEY = "why-we-did-it";

/** Source height needed for the slot's 1.266, at the full 2920 width. */
const SOURCE = { width: 2920, height: 5184 };
const KEEP = Math.round(SOURCE.width / (704 / 556));

const CROP = {
  _type: "sanity.imageCrop",
  top: 0,
  bottom: Number(((SOURCE.height - KEEP) / SOURCE.height).toFixed(4)),
  left: 0,
  right: 0,
};

/**
 * On the faces rather than centred. It does nothing while the crop already
 * matches the slot, and it is what decides the framing the moment anybody
 * changes either one, so it is stored rather than left out.
 */
const HOTSPOT = {
  _type: "sanity.imageHotspot",
  x: 0.5,
  y: 0.22,
  width: 1,
  height: 0.44,
};

/** Written from the photograph, per CH-028, not from the section it sits in. */
const ALT =
  "Two men seated in profile in warm daylight, the nearer one in glasses resting a hand against his chin, both looking the same way.";

(async () => {
  const file = path.resolve(PHOTO);
  if (!fs.existsSync(file)) throw new Error(`missing ${file}`);

  const doc = await query(
    `*[_id == $id][0]{
      _id, _rev,
      "sections": additionalSections[]{
        _key, sectionTitle,
        "alt": sectionImage.alt,
        "file": sectionImage.image.asset->originalFilename,
        "d": sectionImage.image.asset->metadata.dimensions{width, height}
      }
    }`,
    { id: DOC_ID }
  );
  if (!doc) throw new Error("the B Corp page document is missing");

  const index = (doc.sections ?? []).findIndex((s) => s._key === SECTION_KEY);
  if (index < 0) {
    throw new Error(
      `no section keyed ${SECTION_KEY}. Run apply-bcorp-page.js first.`
    );
  }
  const section = doc.sections[index];

  console.log();
  console.log(`  ${section.sectionTitle}, section photograph`);
  console.log(
    `    WAS  ${section.file} at ${section.d?.width}x${section.d?.height}`
  );
  console.log(`         alt: ${section.alt}`);
  console.log(
    `    NOW  ${path.basename(file)} at ${SOURCE.width}x${SOURCE.height}, ${Math.round(fs.statSync(file).size / 1024)} KB`
  );
  console.log(`         alt: ${ALT}`);
  console.log(
    `    crop  bottom ${CROP.bottom}, so the frame is the top ${KEEP} of ${SOURCE.height}`
  );
  console.log("          stored whole, so the Studio's crop tool can move it");
  console.log();

  if (!APPLY) {
    console.log("  Dry run. Nothing written. Re-run with --apply.");
    return;
  }

  const asset = await uploadImage(
    fs.readFileSync(file),
    "bcorp-listening.jpg",
    "image/jpeg"
  );
  console.log(`  uploaded ${asset._id}`);

  /*
   * Patched by index on the one field, not by rewriting additionalSections.
   * The array write that CH-028 warns about is only a hazard when indexed
   * patches and a whole-array write share a transaction; here there is one
   * patch and no array write, so indexes are safe and nothing else on the
   * section is touched.
   */
  const result = await mutate([
    {
      patch: {
        id: doc._id,
        ifRevisionID: doc._rev,
        set: {
          [`additionalSections[${index}].sectionImage`]: {
            image: {
              _type: "image",
              asset: { _type: "reference", _ref: asset._id },
              crop: CROP,
              hotspot: HOTSPOT,
            },
            alt: ALT,
          },
        },
      },
    },
  ]);

  console.log(`  Applied. Transaction ${result.transactionId}.`);

  const after = await query(
    `*[_id == $id][0].additionalSections[_key == $key][0].sectionImage{
      alt, "f": image.asset->originalFilename, "crop": image.crop.bottom
    }`,
    { id: DOC_ID, key: SECTION_KEY }
  );
  console.log(`  Reading back: ${after.f}, crop bottom ${after.crop}`);
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
