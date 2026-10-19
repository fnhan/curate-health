/**
 * Put the TENS machine Curate actually sells on the product.
 *
 * Frank, 2026-10-18: "switch out the TENS machine photo with a photo of our
 * actual TENS machine that we sell, which is the HiDow XPD12", with the
 * background taken out and the shadows gone, to match the other product
 * photographs.
 *
 * The photograph he sent is on a white sheet with soft shadows. It was cut
 * out on a canvas in the browser, as the B Corp composite and the Outdoor
 * Pilates crops were, because this project has no image library. The
 * background was flood filled from the frame edges rather than thresholded
 * globally, so the grey print on the electrode pads and the lit screen, which
 * are as bright as parts of the shadow, could not be punched through; the
 * patch of sheet enclosed by the loop of cable is seeded separately and
 * flooded by the same rule. The partly transparent rim has the white unmixed
 * out of it, so there is no pale fringe on a dark background.
 *
 * This script only uploads the finished file and repoints the product. It
 * does not generate it.
 */
const fs = require("fs");
const path = require("path");
const { createClient } = require("next-sanity");

const APPLY = process.argv.includes("--apply");
const FILE = path.join(__dirname, ".tens-upload.png");
const SLUG = "tens-machines";

/*
 * Written from the photograph, which was opened and looked at, per the
 * CH-028 note. The old alt described a generic stimulator with "multiple
 * electrode pads"; this one is the device on the page.
 */
const ALT =
  "A HiDow XPD12 TENS unit with its screen lit on the program icons, beside two large electrode pads on their lead wires.";

const client = createClient({
  projectId: "rwc5kyvy",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

(async () => {
  const doc = await client.fetch(
    `*[_type == "product" && slug.current == $slug][0]{_id, _rev, title, image{alt, asset->{_id, originalFilename, metadata{dimensions}}}}`,
    { slug: SLUG }
  );
  if (!doc) throw new Error("no product with slug " + SLUG);

  const before = doc.image?.asset;
  console.log("product:   ", doc.title, doc._id);
  console.log("current:   ", before?.originalFilename,
    before?.metadata?.dimensions &&
      `${before.metadata.dimensions.width}x${before.metadata.dimensions.height}`);
  console.log("current alt:", JSON.stringify(doc.image?.alt));
  console.log("replacing with:", path.basename(FILE), (fs.statSync(FILE).size / 1024).toFixed(0) + "KB");
  console.log("new alt:   ", JSON.stringify(ALT));
  console.log("alt length:", ALT.length);

  if (!APPLY) {
    console.log("\nDry run. Nothing written. Re-run with --apply.");
    return;
  }
  if (!process.env.SANITY_WRITE_TOKEN) throw new Error("SANITY_WRITE_TOKEN is not set");

  const asset = await client.assets.upload("image", fs.createReadStream(FILE), {
    filename: "hidow-xpd12-tens-machine.png",
    contentType: "image/png",
  });
  console.log("uploaded:  ", asset._id, asset.metadata?.dimensions?.width + "x" + asset.metadata?.dimensions?.height,
    "opaque=" + asset.metadata?.isOpaque);

  /*
   * ifRevisionID, so an edit somebody has open in the Studio fails the
   * mutation rather than being overwritten.
   */
  const res = await client
    .patch(doc._id, { ifRevisionID: doc._rev })
    .set({ "image.asset": { _type: "reference", _ref: asset._id }, "image.alt": ALT })
    .commit();

  console.log("patched:   ", res._id, "rev", res._rev);
  console.log("\nThe old asset stays in the library, unreferenced. CH-117: unreferenced photographs stay.");
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
