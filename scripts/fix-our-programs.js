/**
 * Fixes the Our Programs page: its heading, its share image, and one piece of
 * alt text that was never written.
 *
 *   node scripts/fix-our-programs.js            dry run
 *   node scripts/fix-our-programs.js --apply    writes
 *
 * THE HEADING
 *
 * "Personalized Programs for Every Stage of Your Journey" uses a banned word,
 * and it is the page's h1, so it is the single most prominent string on the
 * page. The page also had two h1s, which is fixed in three-paths.tsx rather
 * than here.
 *
 * THE ALT TEXT
 *
 * The Essential Series card image has alt text reading "test". Someone typed it
 * to check the field saved and it has been live ever since. A screen reader
 * announces the word "test" where a description of the photograph should be.
 *
 * THE SHARE IMAGE
 *
 * The current one is a stock photograph of two people doing a seated twist in
 * a yoga studio. It is warm, and it is not this page: /our-programs is about
 * structured programs run by clinicians, and the card says "yoga class".
 *
 * Replaced with OCA-Nhan-51, from Curate's own shoot, which shows Frank
 * coaching a patient through a resistance band exercise in the training area.
 * Right subject, real space, real practitioner.
 *
 * WHY THIS ONE NEEDS A CROP
 *
 * That photograph is 3733x5599, portrait. Share cards are 1.91:1. Every
 * automatic crop of it cuts both heads off: `crop=entropy` picks the busiest
 * region, which is the resistance band and the equipment behind it, and
 * `crop=center` lands on two torsos. Both were rendered and looked at before
 * choosing to set the crop by hand.
 *
 * The crop below is the region from y=700 to y=2660 of the original, which
 * holds both faces and Frank's hands on her shoulder. Sanity stores a crop as
 * the fraction trimmed from each edge, so:
 *
 *   top    =     700 / 5599  = 0.125022
 *   bottom = 1 - 2660 / 5599 = 0.524915
 *
 * urlForShareImage honours this, so the framing is now a thing Frank can
 * change by dragging the crop box in the Studio rather than by asking for a
 * code change.
 */

const { mutate, query } = require("./lib/sanity-cli");

const RULE = "=".repeat(78);

/** OCA-Nhan-51.jpg, 3733x5599, from Curate's own shoot. */
const SHARE_ASSET =
  "image-f47a2baf1ce47d6fdd3ef479ff7d58e4ec7d7498-3733x5599-jpg";

const SHARE_ALT =
  "Dr. Frank Nhan guiding a patient through a resistance band exercise in the training area.";

/** The region holding both faces. See the note above for the arithmetic. */
const SHARE_CROP = {
  _type: "sanity.imageCrop",
  top: 0.125022,
  bottom: 0.524915,
  left: 0,
  right: 0,
};

/** Centre of that region, in fractions of the whole image. */
const SHARE_HOTSPOT = {
  _type: "sanity.imageHotspot",
  x: 0.5,
  y: 0.300054,
  width: 1,
  height: 0.350063,
};

const HEADING = "Personalized Programs for Every Stage of Life";

const CARD_ALT = {
  "Essential Series":
    "Dr. Frank Nhan coaching a patient through a resistance band exercise.",
};

const BANNED = [
  "journey",
  "dive in",
  "unlock",
  "elevate",
  "harness the power of",
  "complimentary",
  "transformative",
  "seamless",
];

function check(label, value, max) {
  const problems = [];
  if (value.length > max) problems.push(`${value.length} chars, over ${max}`);
  if (value !== value.trim()) problems.push("leading or trailing whitespace");
  if (/[—–]/.test(value)) problems.push("dash used as punctuation");
  if (/!/.test(value)) problems.push("exclamation mark");
  for (const word of BANNED) {
    if (new RegExp(`\\b${word}`, "i").test(value)) {
      problems.push(`banned word "${word}"`);
    }
  }
  return problems.map((p) => `${label}: ${p}`);
}

async function main() {
  const apply = process.argv.includes("--apply");

  console.log(RULE);
  console.log("Our Programs");
  console.log(RULE);

  const doc = await query(
    `*[_type == "ourPrograms" && !(_id in path("drafts.**"))][0]{
      _id, title,
      "programs": programs[]{programName, "alt": image.alt},
      "ogAsset": seo.socialMeta.ogImage.asset._ref,
      "ogAlt": seo.socialMeta.ogImage.alt
    }`
  );

  if (!doc) {
    console.error("NOT FOUND: ourPrograms");
    process.exit(2);
  }

  const set = {};
  let problems = 0;

  // 1. The heading.
  const faults = check("heading", HEADING, 70);
  problems += faults.length;
  faults.forEach((f) => console.log(`  PROBLEM ${f}`));

  console.log("\nHEADING");
  console.log(`  was: ${JSON.stringify(doc.title)}`);
  console.log(`  now: ${JSON.stringify(HEADING)}`);
  if (doc.title !== HEADING) set.title = HEADING;

  // 2. Card alt text.
  console.log("\nCARD ALT TEXT");
  (doc.programs || []).forEach((program, index) => {
    const wanted = CARD_ALT[program.programName];
    console.log(
      `  ${String(program.programName).padEnd(24)} ${JSON.stringify(program.alt)}`
    );
    if (!wanted || program.alt === wanted) return;

    const altFaults = check("alt", wanted, 125);
    problems += altFaults.length;
    altFaults.forEach((f) => console.log(`    PROBLEM ${f}`));

    console.log(`    now: ${JSON.stringify(wanted)}`);
    set[`programs[${index}].image.alt`] = wanted;
  });

  // 3. The share image.
  const image = {
    _type: "image",
    asset: { _type: "reference", _ref: SHARE_ASSET },
    alt: SHARE_ALT,
    crop: SHARE_CROP,
    hotspot: SHARE_HOTSPOT,
  };

  const altFaults = check("share alt", SHARE_ALT, 125);
  problems += altFaults.length;
  altFaults.forEach((f) => console.log(`  PROBLEM ${f}`));

  console.log("\nSHARE IMAGE");
  console.log(`  was:  ${doc.ogAsset || "none"}`);
  console.log(`  now:  ${SHARE_ASSET}`);
  console.log(`  alt:  ${JSON.stringify(SHARE_ALT)}`);
  console.log(
    `  crop: top ${SHARE_CROP.top}, bottom ${SHARE_CROP.bottom}, keeping both faces`
  );

  if (doc.ogAsset !== SHARE_ASSET || doc.ogAlt !== SHARE_ALT) {
    set["seo.socialMeta.ogImage"] = image;
    set["seo.socialMeta.twitterImage"] = image;
  }

  console.log(`\n${RULE}`);

  if (problems) {
    console.error(`${problems} problem(s). Nothing written.`);
    process.exit(2);
  }

  if (!Object.keys(set).length) {
    console.log("Already correct.");
    return;
  }

  console.log(`${Object.keys(set).length} field(s) to change:`);
  Object.keys(set).forEach((k) => console.log(`  ${k}`));

  if (!apply) {
    console.log("\nDry run. Nothing written.");
    return;
  }

  const result = await mutate([
    {
      patch: {
        id: doc._id,
        setIfMissing: {
          seo: { _type: "seo" },
          "seo.socialMeta": { _type: "socialMeta" },
        },
        set,
      },
    },
  ]);
  console.log(`\nApplied. Transaction ${result.transactionId}`);
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  process.exit(1);
});
