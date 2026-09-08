/**
 * Replaces the hero photo on two service categories.
 *
 *   node scripts/set-category-photos.js            dry run, uploads nothing
 *   node scripts/set-category-photos.js --apply    uploads and patches
 *
 * Frank supplied both on 2026-09-08. The files are read from disk rather than
 * fetched at run time, so re-running does not depend on a Drive link still
 * being shared.
 *
 * Uploading is separate from patching. Sanity deduplicates assets on the
 * content hash, so re-running returns the existing asset rather than making a
 * second copy, and the patch then points at the same id it already had.
 *
 * ALT TEXT
 *
 * Written from the images, not from the category names. Both were opened and
 * looked at. Same rule as the practitioner photos: 25 to 125 characters,
 * neutral, ends with a full stop, no banned words.
 *
 * THE RECOVERY SANCTUARY FILE WAS EDITED BEFORE UPLOAD
 *
 * Frank asked for the thermostat cropped out. It is a small clear box on the
 * sauna wall above the plant, and it sits inside the band the banner actually
 * shows, so it would have been visible rather than cropped away by chance.
 * 470px was taken off the left edge, which clears it.
 *
 * The file was also resized from 5184px wide to 2600px. CH-029 flags every
 * asset over 2600px, and the banner is never rendered wider than that. 9.02 MB
 * became 0.88 MB for no visible difference.
 *
 * His first Recovery Sanctuary photo was portrait, 2268x4032. The banner is a
 * wide strip, 400px tall on mobile and 550px on desktop, so a portrait photo
 * would have shown a narrow horizontal band of sauna wall and little else.
 * This replacement is landscape and was checked against the rendered crop
 * before upload rather than after.
 *
 * WHAT THIS DOES NOT DO
 *
 * It does not rename anything. The rehab document keeps its slug and title
 * until the rename lands. Swapping a photo changes no URL, so it is safe to
 * run ahead of that and separately from it.
 */

const fs = require("fs");
const path = require("path");

const { getConfig, mutate, query } = require("./lib/sanity-cli");

const TARGETS = [
  {
    serviceSlug: "rehab",
    label: "One-on-One Care, currently Primary Care",
    file: "one-on-one.jpg",
    contentType: "image/jpeg",
    alt: "A practitioner's hands applying manual therapy to a patient's lower back.",
  },
  {
    serviceSlug: "recovery-sanctuary",
    label: "Recovery Sanctuary",
    // Cropped and resized from the original Frank supplied. See the note below.
    file: "recovery-cropped.jpg",
    contentType: "image/jpeg",
    alt: "The outdoor sauna and cold plunge tub beneath a wooden canopy at the Recovery Sanctuary.",
  },
];

const SOURCE_DIR = process.env.CURATE_PHOTO_DIR || ".";

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

const RULE = "=".repeat(78);

function checkAlt(alt) {
  const problems = [];
  if (alt.length < 25 || alt.length > 125)
    problems.push(`length ${alt.length}`);
  if (!/\.$/.test(alt)) problems.push("no full stop");
  if (/[—–]/.test(alt)) problems.push("dash punctuation");
  if (/!/.test(alt)) problems.push("exclamation mark");
  for (const w of BANNED) {
    if (new RegExp(`\\b${w}`, "i").test(alt))
      problems.push(`banned word "${w}"`);
  }
  return problems;
}

async function uploadImage(filePath, contentType) {
  const config = getConfig();
  const body = fs.readFileSync(filePath);
  const filename = path.basename(filePath);

  const url =
    `https://${config.projectId}.api.sanity.io/v${config.apiVersion}` +
    `/assets/images/${config.dataset}?filename=${encodeURIComponent(filename)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": contentType,
      Authorization: `Bearer ${config.writeToken}`,
    },
    body,
  });

  if (!response.ok) {
    throw new Error(
      `Upload failed: ${response.status} ${await response.text()}`
    );
  }

  return (await response.json()).document;
}

async function main() {
  const apply = process.argv.includes("--apply");

  console.log(RULE);
  console.log("Category hero photos");
  console.log(RULE);

  let problems = 0;
  const plan = [];

  for (const target of TARGETS) {
    const filePath = path.resolve(SOURCE_DIR, target.file);

    if (!fs.existsSync(filePath)) {
      console.error(`\nMissing file: ${filePath}`);
      console.error("Set CURATE_PHOTO_DIR to the folder holding the photos.");
      process.exit(2);
    }

    const service = await query(
      `*[_type == "service" && slug.current == $slug && !(_id in path("drafts.**"))][0]{_id, _rev, title, "currentAlt": hero_image.alt, "currentAsset": hero_image.asset->originalFilename}`,
      { slug: target.serviceSlug }
    );

    if (!service) {
      console.error(`\nNo service with slug "${target.serviceSlug}".`);
      process.exit(2);
    }

    const faults = checkAlt(target.alt);
    problems += faults.length;

    const bytes = fs.statSync(filePath).size;

    console.log(`\n  ${target.label}`);
    console.log(
      `    document:  ${service._id}  ${JSON.stringify(service.title)}`
    );
    console.log(
      `    file:      ${target.file}  ${(bytes / 1024 / 1024).toFixed(2)} MB`
    );
    console.log(`    replaces:  ${JSON.stringify(service.currentAsset)}`);
    console.log(`    alt:       ${JSON.stringify(target.alt)}`);
    console.log(`    was:       ${JSON.stringify(service.currentAlt)}`);
    for (const fault of faults) console.log(`    PROBLEM: ${fault}`);

    plan.push({ target, service, filePath });
  }

  if (problems) {
    console.error(
      `\n${problems} problem(s) with the alt text. Nothing written.`
    );
    process.exit(2);
  }

  if (!apply) {
    console.log(`\n${RULE}`);
    console.log("Dry run. Nothing uploaded, nothing patched.");
    return;
  }

  const mutations = [];

  for (const { target, service, filePath } of plan) {
    const asset = await uploadImage(filePath, target.contentType);
    console.log(`\n  uploaded ${target.file} -> ${asset._id}`);
    console.log(
      `    ${asset.metadata?.dimensions?.width}x${asset.metadata?.dimensions?.height}`
    );

    mutations.push({
      patch: {
        id: service._id,
        set: {
          "hero_image.asset": { _type: "reference", _ref: asset._id },
          "hero_image.alt": target.alt,
        },
      },
    });
  }

  const result = await mutate(mutations);
  console.log(`\nApplied. Transaction ${result.transactionId}`);

  const after = await query(
    `*[_type == "service" && slug.current in $slugs && !(_id in path("drafts.**"))]{"slug": slug.current, "file": hero_image.asset->originalFilename, "alt": hero_image.alt, "w": hero_image.asset->metadata.dimensions.width}`,
    { slugs: TARGETS.map((t) => t.serviceSlug) }
  );

  console.log("Verified:");
  for (const s of after) {
    console.log(`  ${String(s.slug).padEnd(20)} ${s.file}  ${s.w}px`);
    console.log(`    ${JSON.stringify(s.alt)}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
