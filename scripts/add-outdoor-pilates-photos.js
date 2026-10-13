/**
 * Two real photographs on the Outdoor Pilates page, and the practical copy
 * split onto the second one.
 *
 *   node scripts/add-outdoor-pilates-photos.js            # dry run
 *   node scripts/add-outdoor-pilates-photos.js --apply
 *
 * Frank sent two photographs of a real class on 2026-10-13 and asked for the
 * page to carry both, staggered on opposite sides with the text beside each,
 * the way the other pages read. `AlternatingSections` already does the
 * staggering off the array index, so this only has to produce two sections with
 * an image each.
 *
 * WHY THE PRACTICAL COPY WAS CROWDED INTO ONE SECTION BEFORE
 *
 * A section with no photograph publishes a bare `<img>` with an empty source,
 * the CH-028 defect, and the library had nothing usable. These two photographs
 * are what unblocks it, so "In a class", "What to bring" and the one-on-one
 * sessions now have a section and a picture of their own.
 *
 * THE PHOTOGRAPHS WERE EDITED, AND ONLY IN WAYS A CROP OR A CURVE CAN DO
 *
 * Both are 1125x2000 portrait and the slot paints 704x556 landscape, so both
 * had to be cropped whatever else happened: 1125 / 1.266 = 889.
 *
 *   warmup   Backlit under the pergola, the whole row in shadow. Lifted with a
 *            gamma curve that fades out towards the highlights, so the sky and
 *            the lit paving do not blow out, at Frank's request. Cropped from
 *            y=750, which takes the planting and the full row of people.
 *   class    Already well lit, so untouched apart from the crop. Cropped from
 *            y=330 to drop the loose shoes along the bottom, which is what
 *            Frank asked for, keeping the pergola, the sauna cabin, the
 *            instructor and the first row of mats.
 *
 * **One pair of trainers remains**, on the ground beside the instructor. A crop
 * cannot reach it without losing her, and painting it out is retouching the
 * contents of a real photograph rather than framing it, which is Frank's call
 * rather than mine.
 *
 * The editing was done on a canvas in the browser, as the B Corp composite was,
 * because this project has no image library and a native dependency is not
 * worth adding. This script uploads the finished files and writes the sections;
 * it does not generate them. The page that produced them is kept in the
 * session scratchpad, not here, since it is throwaway.
 *
 * Alt text was written from the photographs, which were opened and looked at,
 * per the CH-028 note.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { query, mutate, uploadImage } = require("./lib/sanity-cli");
const { findBanned, findAmerican } = require("./lib/content-rules");

const key = () => crypto.randomBytes(6).toString("hex");

const block = (text) => ({
  _key: key(),
  _type: "block",
  style: "normal",
  markDefs: [],
  children: [{ _key: key(), _type: "span", marks: [], text }],
});

const lead = (boldText, rest) => ({
  _key: key(),
  _type: "block",
  style: "normal",
  markDefs: [],
  children: [
    { _key: key(), _type: "span", marks: ["strong"], text: boldText },
    { _key: key(), _type: "span", marks: [], text: rest },
  ],
});

/** Where the edited files were written. Passed with --dir to move them. */
const DEFAULT_DIR = path.join(
  process.env.TEMP || process.env.TMP || ".",
  "claude",
  "C--Users-Chiro1-projects-curatehealth",
  "32965cdf-5391-4e2a-98af-6a36417013eb",
  "scratchpad",
  "photo"
);

const PHOTOS = [
  {
    file: "outdoor-pilates-warmup.jpg",
    alt: "An Outdoor Pilates class under the pergola in the Recovery Sanctuary, hands behind their heads, facing the planted beds and the street beyond.",
  },
  {
    file: "outdoor-pilates-class.jpg",
    alt: "An Outdoor Pilates class on mats under the pergola, holding cork blocks overhead, with the sauna cabin and the planted beds behind them.",
  },
];

const SECOND_SECTION_TITLE = "What a Class Looks Like";

/** Frank's facts, 2026-10-13. Nothing here is guessed. */
const PRACTICAL = [
  lead(
    "In a class: ",
    "Sessions run 50 minutes, in groups of up to 12, so you are seen rather than lost in a room. The Recovery Sanctuary sits under a pergola that closes when it rains, and when the weather is against us altogether the class moves indoors to our gym space."
  ),
  lead(
    "What to bring: ",
    "Workout clothes, and layers you can add or peel off to suit the weather that day. Mats are here, and you are welcome to bring your own to use or to layer."
  ),
  lead(
    "One-on-one sessions: ",
    "Claire also teaches privately, built around what you are working on rather than a class plan. That suits anyone returning to movement, working around a condition, or wanting the detail a group cannot give."
  ),
];

function ruleCheck(label, text) {
  const problems = [];
  for (const h of findBanned(text)) problems.push(`banned: ${h.rule}`);
  for (const h of findAmerican(text)) problems.push(`american: ${h.rule}`);
  if (/[–—]/.test(text)) problems.push("dash");
  if (text.includes("!")) problems.push("exclamation mark");
  if (/last (?:reviewed|updated|modified)/i.test(text)) {
    problems.push("update stamp");
  }
  for (const m of text.matchAll(/\p{Cf}/gu)) problems.push(`Cf at ${m.index}`);
  if (text !== text.trim()) problems.push("leading or trailing whitespace");
  if (problems.length) {
    console.error(`  ${label}: ${problems.join(", ")}`);
    return false;
  }
  return true;
}

const flatten = (blocks) =>
  blocks.map((b) => b.children.map((c) => c.text).join("")).join("\n");

async function main() {
  const apply = process.argv.includes("--apply");
  const dirArg = process.argv.find((a) => a.startsWith("--dir="));
  const dir = dirArg ? dirArg.slice("--dir=".length) : DEFAULT_DIR;

  console.log("Content rules\n");
  let clean = true;
  clean = ruleCheck("practical copy", flatten(PRACTICAL)) && clean;
  clean = ruleCheck("section title", SECOND_SECTION_TITLE) && clean;
  for (const p of PHOTOS) clean = ruleCheck(`alt ${p.file}`, p.alt) && clean;
  if (!clean) {
    console.error("\nRefusing to write.");
    process.exit(1);
  }
  console.log("  all pass");

  console.log(`\nPhotographs, from ${dir}\n`);
  for (const p of PHOTOS) {
    p.path = path.join(dir, p.file);
    if (!fs.existsSync(p.path)) {
      console.error(`  missing: ${p.path}`);
      process.exit(2);
    }
    p.bytes = fs.readFileSync(p.path);
    console.log(`  ${p.file}  ${(p.bytes.length / 1024).toFixed(0)} KB`);
    console.log(`    alt: ${p.alt}`);
  }

  const [t] = await query(
    `*[_type == "treatments" && treatmentSlug.current == "outdoor-pilates"]{_id,_rev,additionalSections}`
  );
  if (!t) throw new Error("no outdoor-pilates treatment");

  const first = (t.additionalSections || [])[0];
  if (!first) throw new Error("expected one existing section");

  // The practical blocks were appended to the first section on 2026-10-13
  // because there was no second photograph. They move out now.
  const isPractical = (b) =>
    (b.children || []).some(
      (c) =>
        (c.marks || []).includes("strong") &&
        /^(In a class|What to bring|One-on-one sessions)/.test(c.text || "")
    );
  const kept = (first.sectionParagraph || []).filter((b) => !isPractical(b));
  const moved = (first.sectionParagraph || []).length - kept.length;

  console.log(`\nSections`);
  console.log(
    `  "${first.sectionTitle}": ${kept.length} blocks kept, ${moved} moved out`
  );
  console.log(`  "${SECOND_SECTION_TITLE}": ${PRACTICAL.length} blocks, new`);
  console.log(
    `  AlternatingSections staggers on index, so the first photograph sits left and the second right.`
  );

  if (!apply) {
    console.log("\nDry run. Nothing uploaded, nothing written.");
    return;
  }

  for (const p of PHOTOS) {
    const asset = await uploadImage(p.bytes, p.file, "image/jpeg");
    p.assetId = asset._id;
    console.log(`\nuploaded ${p.file} -> ${asset._id}`);
  }

  const imageField = (p) => ({
    _type: "object",
    image: { _type: "image", asset: { _type: "reference", _ref: p.assetId } },
    alt: p.alt,
  });

  const sections = [
    { ...first, sectionParagraph: kept, sectionImage: imageField(PHOTOS[0]) },
    {
      _key: key(),
      _type: first._type,
      sectionTitle: SECOND_SECTION_TITLE,
      sectionParagraph: PRACTICAL,
      sectionImage: imageField(PHOTOS[1]),
    },
  ];

  const r = await mutate([
    {
      patch: {
        id: t._id,
        ifRevisionID: t._rev,
        set: { additionalSections: sections },
      },
    },
  ]);
  console.log(`\nApplied. Transaction ${r.transactionId || "(none)"}`);
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
