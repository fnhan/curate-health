/**
 * The Professional Grade Supplements banner photograph. Frank, 2026-10-25.
 *
 *   node scripts/swap-supplements-hero.js
 *   node scripts/swap-supplements-hero.js --apply
 *
 * He sent a flat-lay of capsules, herbs, garlic, ginger and flowers on
 * marble, and asked for it as the hero in place of the hand holding a
 * capsule. The hand stays where he likes it, on the share card.
 *
 * WHAT IS ON THAT PAGE AFTER THIS
 *
 *   banner   the flat-lay, full width at the top of the page
 *   image    his Photoshop cutout of the hand, further down, unchanged
 *   share    the Unsplash original of the same hand, unchanged
 *
 * 2600px, the cap CH-029 set, because nothing on the site paints wider than
 * 1920. His file was 6240x4160 at 4 MB; this is the same picture at a size
 * the page can use.
 *
 * THE CROP IS IN THE STUDIO, NOT BAKED IN
 *
 * The banner is a 2.6:1 band and the photograph is 1.5:1, so most of its
 * height has to go. Left to `object-cover` that would be a centre crop,
 * which cuts the ginger and the bowls off the bottom and keeps empty marble
 * at the top.
 *
 * So the whole frame goes up and the framing is a crop and hotspot he can
 * drag. This works here because the product query projects the image object
 * and the banner renders through SanityImage. It would NOT work on a
 * treatment hero, which is still plain next/image.
 */
const fs = require("fs");
const path = require("path");

const { query, mutate, uploadImage } = require("./lib/sanity-cli");

const APPLY = process.argv.includes("--apply");

const PHOTO = process.env.SUPPLEMENTS_PHOTO;
if (!PHOTO) {
  console.error("Set SUPPLEMENTS_PHOTO to the resized file.");
  process.exit(1);
}

const PRODUCT = "81a65c70-7d47-435b-9715-bc145bbf7bb7";

/**
 * The band the banner shows: the lower two thirds, where the herbs, garlic,
 * ginger and capsules are, with a little marble left above them for air.
 * Everything above that is empty marble.
 */
const CROP = {
  _type: "sanity.imageCrop",
  top: 0.3,
  bottom: 0.12,
  left: 0,
  right: 0,
};

const HOTSPOT = {
  _type: "sanity.imageHotspot",
  x: 0.5,
  y: 0.59,
  width: 1,
  height: 0.58,
};

/** Written from the photograph, per CH-028, not from the page. */
const ALT =
  "Capsules and tablets scattered across white marble among mint, parsley, garlic, ginger and white flowers.";

(async () => {
  const file = path.resolve(PHOTO);
  if (!fs.existsSync(file)) throw new Error(`missing ${file}`);

  const product = await query(
    `*[_id == $id][0]{_id, _rev, title, "banner": banner{alt, "a": asset->{originalFilename, size, "d": metadata.dimensions}}}`,
    { id: PRODUCT }
  );
  if (!product) throw new Error("the supplements product is missing");

  const size = fs.statSync(file).size;

  console.log();
  console.log(`  ${product.title}, banner photograph`);
  console.log(
    `    WAS  ${product.banner?.a?.originalFilename} at ${product.banner?.a?.d?.width}x${product.banner?.a?.d?.height}, ${Math.round(product.banner.a.size / 1024)} KB`
  );
  console.log(`         alt: ${product.banner?.alt?.trim()}`);
  console.log(
    `    NOW  ${path.basename(file)}, ${Math.round(size / 1024)} KB, cropped in the Studio`
  );
  console.log(`         alt: ${ALT}`);
  console.log(
    `    crop  top ${CROP.top}  bottom ${CROP.bottom}, so the band is the lower two thirds`
  );
  console.log();
  console.log("  Unchanged: the hand cutout further down the page, and the share card.");
  console.log();

  if (!APPLY) {
    console.log("  Dry run. Nothing written. Re-run with --apply.");
    return;
  }

  const asset = await uploadImage(
    fs.readFileSync(file),
    "supplements-flat-lay-marble.jpg",
    "image/jpeg"
  );
  console.log(`  uploaded ${asset._id}`);

  const result = await mutate([
    {
      patch: {
        id: product._id,
        ifRevisionID: product._rev,
        set: {
          banner: {
            _type: "image",
            asset: { _type: "reference", _ref: asset._id },
            crop: CROP,
            hotspot: HOTSPOT,
            alt: ALT,
          },
        },
      },
    },
  ]);

  console.log(`  Applied. Transaction ${result.transactionId}.`);

  const after = await query(
    `*[_id == $id][0].banner{alt, "f": asset->originalFilename, "crop": crop.top}`,
    { id: PRODUCT }
  );
  console.log(`  Reading back: ${after.f}, crop top ${after.crop}`);
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
