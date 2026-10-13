/**
 * Claire's photograph, and the class shot back to the plain crop.
 *
 *   node scripts/set-claire-photo-and-revert-class-shot.js            # dry run
 *   node scripts/set-claire-photo-and-revert-class-shot.js --apply
 *
 * THE CLASS SHOT GOES BACK
 *
 * Frank, 2026-10-13: "the photoshop class photo is terrible without the shoes.
 * revert back to what you had before." So the page points at the plain y=330
 * crop again, the one that keeps the loose shoes out of frame rather than
 * painting over them, and the reframed y=700 version with five paving patches
 * is abandoned.
 *
 * Worth keeping the reason. Patching five holes in a paving grid leaves five
 * patches of repeated texture, and a slab pattern makes that obvious even when
 * each seam is feathered. A crop that excludes the clutter beats a retouch that
 * covers it, which is the opposite of what it felt like while doing it.
 *
 * Both assets are still in the library, so this is a pointer change, not an
 * upload. The retouched one becomes a CH-117 candidate.
 *
 * CLAIRE'S PHOTOGRAPH
 *
 * A studio portrait Frank sent as a placeholder, "until I get a better one".
 * It fills the last gap on her record, so the only thing left before she can be
 * switched on is the Our Team entry, which is CH-030.
 *
 * **The share hotspot is y 0.52, not the house 0.3.** The other six are standing
 * portraits with the face about a third down, and 0.3 puts the 1200x630 band
 * across it. Hers is a seated side stretch and her face sits at about 0.54, so
 * 0.3 would band her shoulder. The rule was always "put the band on the face",
 * and 0.3 was what that meant for the other six rather than a number to copy.
 *
 * The horizontal part of the hotspot does nothing here either way: the source is
 * 1331x2000, narrower than both the 4:5 page crop and the 1200x630 share, so
 * every crop takes the full width and trims height only.
 */

const fs = require("fs");
const { query, mutate, uploadImage } = require("./lib/sanity-cli");
const { findBanned, findAmerican } = require("./lib/content-rules");

/** The crop before the retouch, already in the library. */
const PLAIN_CLASS_ASSET =
  "image-400a9886ccea2dac37de11a00bec9948c87596a3-1125x889-jpg";

const CLASS_ALT =
  "An Outdoor Pilates class on mats under the pergola, holding cork blocks overhead, with the sauna cabin and the planted beds behind them.";

const CLAIRE_PHOTO_ALT =
  "Claire Kim in a seated side stretch on a mat, one arm reaching overhead, in a bright studio with daylight through vertical blinds.";

const HOTSPOT = {
  _type: "sanity.imageHotspot",
  x: 0.5,
  y: 0.52,
  width: 1,
  height: 0.6,
};
const CROP = {
  _type: "sanity.imageCrop",
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};

function ruleCheck(label, text) {
  const problems = [];
  for (const h of findBanned(text)) problems.push(`banned: ${h.rule}`);
  for (const h of findAmerican(text)) problems.push(`american: ${h.rule}`);
  if (/[–—]/.test(text)) problems.push("dash");
  if (text.includes("!")) problems.push("exclamation mark");
  if (/last (?:reviewed|updated|modified)/i.test(text)) {
    problems.push("update stamp");
  }
  if (text !== text.trim()) problems.push("leading or trailing whitespace");
  if (problems.length) {
    console.error(`  ${label}: ${problems.join(", ")}`);
    return false;
  }
  return true;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const fileArg = process.argv.find((a) => a.startsWith("--photo="));
  if (!fileArg) {
    console.error("Pass --photo=<path to Claire's photograph>");
    process.exit(2);
  }
  const photoPath = fileArg.slice("--photo=".length);
  if (!fs.existsSync(photoPath)) {
    console.error(`No such file: ${photoPath}`);
    process.exit(2);
  }

  console.log("Content rules\n");
  let clean = true;
  clean = ruleCheck("class alt", CLASS_ALT) && clean;
  clean = ruleCheck("Claire photo alt", CLAIRE_PHOTO_ALT) && clean;
  if (!clean) {
    console.error("\nRefusing to write.");
    process.exit(1);
  }
  console.log("  all pass");

  // --- the class shot
  const [t] = await query(
    `*[_type == "treatments" && treatmentSlug.current == "outdoor-pilates"]{_id,_rev,additionalSections}`
  );
  if (!t) throw new Error("no outdoor-pilates treatment");
  const current = t.additionalSections[1]?.sectionImage?.image?.asset?._ref;
  console.log(`\nClass shot, on "${t.additionalSections[1]?.sectionTitle}"`);
  console.log(`  now:  ${current}`);
  console.log(`  back: ${PLAIN_CLASS_ASSET}`);
  if (current === PLAIN_CLASS_ASSET) console.log("  already reverted");

  // --- Claire
  const [claire] = await query(
    `*[_type == "practitioner" && name == "Claire Kim"]{_id,_rev,isActive,"photo":photo.asset._ref}`
  );
  if (!claire) throw new Error("no Claire Kim record");
  const bytes = fs.readFileSync(photoPath);
  console.log(
    `\nClaire Kim${claire.isActive === false ? "  [switched off]" : ""}`
  );
  console.log(`  photo now: ${claire.photo || "(none)"}`);
  console.log(
    `  uploading: ${photoPath}, ${(bytes.length / 1024).toFixed(0)} KB`
  );
  console.log(`  alt:       ${CLAIRE_PHOTO_ALT}`);
  console.log(`  hotspot:   y ${HOTSPOT.y}, where her face is`);

  if (!apply) {
    console.log("\nDry run. Nothing uploaded, nothing written.");
    return;
  }

  const asset = await uploadImage(bytes, "claire-kim.jpg", "image/jpeg");
  console.log(`\nuploaded -> ${asset._id}`);

  const shareImage = {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
    crop: CROP,
    hotspot: HOTSPOT,
    alt: CLAIRE_PHOTO_ALT,
  };

  const sections = t.additionalSections.map((s, i) =>
    i === 1
      ? {
          ...s,
          sectionImage: {
            _type: "object",
            image: {
              _type: "image",
              asset: { _type: "reference", _ref: PLAIN_CLASS_ASSET },
            },
            alt: CLASS_ALT,
          },
        }
      : s
  );

  const r = await mutate([
    {
      patch: {
        id: t._id,
        ifRevisionID: t._rev,
        set: { additionalSections: sections },
      },
    },
    {
      patch: {
        id: claire._id,
        ifRevisionID: claire._rev,
        set: {
          photo: {
            _type: "image",
            asset: { _type: "reference", _ref: asset._id },
            hotspot: HOTSPOT,
            alt: CLAIRE_PHOTO_ALT,
          },
          "seo.socialMeta.ogImage": shareImage,
          "seo.socialMeta.twitterImage": shareImage,
        },
      },
    },
  ]);
  console.log(
    `\nApplied 2 patches. Transaction ${r.transactionId || "(none)"}`
  );
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
