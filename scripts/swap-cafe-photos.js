/**
 * Three new photographs on /cafe. CH-108.
 *
 *   node scripts/swap-cafe-photos.js           # dry run
 *   node scripts/swap-cafe-photos.js --apply
 *
 * Frank sent these on 2026-10-18 to replace three section images: the matcha
 * latte, the energy bars in place of a bowl of energy balls, and a better chia
 * pudding.
 *
 * THEY GO UP WHOLE, UNCROPPED
 *
 * A first run uploaded them cropped to the slot, 1506x2000 down to 1506x1189,
 * because AlternatingSections paints 704x556 and `object-cover` would
 * centre-crop them. Frank asked on 2026-10-18 for the originals instead: "leave
 * them whole on Sanity and I will go in and crop it myself."
 *
 * **That needed a code change to mean anything.** The query behind that
 * component selected a bare url, so the crop and hotspot an editor drags in the
 * Studio were never read. CAFE_PAGE_QUERY now projects the image object and the
 * component runs it through `urlForSectionImage`, so his crop decides the frame.
 * Without that, cropping in the Studio would have been a silent no-op, the same
 * class of trap as the blog alt in CH-028.
 *
 * Until he crops one, Sanity centres it, which is what the browser did before.
 * * THE ARRAY IS WRITTEN WHOLE
 *
 * Per the CH-028 note: an indexed patch into an array that is also being
 * rewritten in the same transaction is silently lost. This reads
 * `additionalSections`, swaps three entries, and writes the array back.
 *
 * The three photographs being replaced stay in the media library, unreferenced,
 * per Frank's CH-117 decision that the library is worth keeping.
 */

const fs = require("fs");
const path = require("path");

const { query, mutate, uploadImage } = require("./lib/sanity-cli");

const PHOTOS = path.join(
  process.env.LOCALAPPDATA || process.env.HOME || "",
  "Temp",
  "claude",
  "C--Users-Chiro1-projects-curatehealth",
  "32965cdf-5391-4e2a-98af-6a36417013eb",
  "images"
);

/**
 * Keyed by the section's title, because `_key` is opaque and the title is what
 * a reader can check against the page. Alt text describes the photograph, which
 * is what alt is for, and each one was looked at rather than guessed. CH-028.
 */
const SWAPS = [
  {
    section: "We Invite You To Slow Down And Savour",
    file: "8.jpg",
    upload: "cafe-matcha-latte.jpg",
    alt: "A hand holding a glass of iced matcha latte, the matcha settling in green ribbons through the milk, in front of the cafe's frosted glass door.",
    replaces: "a 384x512 photograph, by far the smallest asset on the page",
  },
  {
    section: "Food Is Medicine",
    file: "10.jpg",
    upload: "cafe-energy-bars.jpg",
    alt: "Two chocolate hazelnut bars cut to show the filling, on a white plate with hazelnut crumble and whole hazelnuts.",
    replaces: "three energy balls in a black bowl, which are not on the menu",
  },
  {
    section: "Where Every Bite Matters",
    file: "9.jpg",
    upload: "cafe-chia-pudding.jpg",
    alt: "A glass of chia pudding layered with dark berry compote and topped with hojicha nut granola.",
    replaces: "an older chia pudding photograph on a wooden board",
  },
];

async function main() {
  const apply = process.argv.includes("--apply");

  for (const swap of SWAPS) {
    const file = path.join(PHOTOS, swap.file);
    if (!fs.existsSync(file)) {
      throw new Error(`missing ${file}. Run photo/crop.html first.`);
    }
    swap.bytes = fs.readFileSync(file);
  }

  const [page] = await query(
    `*[_type == "cafePage" && pageActive == true][0...1]{
      _id, _rev,
      "sections": additionalSections[]{
        _key, sectionTitle,
        "file": sectionImage.image.asset->originalFilename,
        "alt": sectionImage.alt
      }
    }`
  );
  if (!page) throw new Error("no active cafePage");

  console.log(`cafePage ${page._id}, rev ${page._rev}\n`);

  for (const swap of SWAPS) {
    const found = page.sections.find(
      (s) => s.sectionTitle?.trim() === swap.section
    );
    if (!found) {
      throw new Error(`no section titled "${swap.section}"`);
    }
    swap._key = found._key;
    console.log(swap.section);
    console.log(`  was:  ${found.file}`);
    console.log(`        ${found.alt}`);
    console.log(
      `  now:  ${swap.upload}  ${(swap.bytes.length / 1024).toFixed(0)} KB, whole`
    );
    console.log(`        ${swap.alt}`);
    console.log(`  why:  replaces ${swap.replaces}\n`);
  }

  if (!apply) {
    console.log("Dry run. Nothing uploaded and nothing written.");
    return;
  }

  for (const swap of SWAPS) {
    const asset = await uploadImage(swap.bytes, swap.upload, "image/jpeg");
    swap.assetId = asset._id;
    console.log(`uploaded ${swap.upload} -> ${asset._id}`);
  }

  // Read the array whole, swap in place, write it back whole.
  const [full] = await query(`*[_id == $id][0...1]{_rev, additionalSections}`, {
    id: page._id,
  });

  const sections = (full.additionalSections || []).map((section) => {
    const swap = SWAPS.find((s) => s._key === section._key);
    if (!swap) return section;
    return {
      ...section,
      sectionImage: {
        ...(section.sectionImage || {}),
        _type: section.sectionImage?._type || "object",
        alt: swap.alt,
        image: {
          _type: "image",
          asset: { _type: "reference", _ref: swap.assetId },
        },
      },
    };
  });

  const result = await mutate([
    {
      patch: {
        id: page._id,
        ifRevisionID: full._rev,
        set: { additionalSections: sections },
      },
    },
  ]);

  console.log(`\nApplied. Transaction ${result.transactionId || "(none)"}`);
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
