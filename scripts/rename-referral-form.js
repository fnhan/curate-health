/**
 * Fixes the misspelled filename on the Curate Lifestyle referral form.
 *
 *   node scripts/rename-referral-form.js            dry run, writes nothing
 *   node scripts/rename-referral-form.js --apply    renames it
 *
 * Approved by Frank on 2026-09-08, who supplied a corrected copy of the file.
 *
 * WHY THIS IS A RENAME AND NOT A RE-UPLOAD
 *
 * The file Frank supplied is byte for byte identical to the one already in
 * Sanity. Same SHA-256, same 127,694 bytes, same 88 form fields. Only the
 * filename differed: "CurateLifestlye" against "CurateLifestyle".
 *
 * Sanity stores one asset per unique file and deduplicates on the content
 * hash, so uploading the corrected copy would return the existing asset rather
 * than creating a second one, and the stored filename would not change. The
 * asset URL is the hash, not the name, so no link anywhere changes either.
 *
 * That makes the whole job a single field edit. The three documents that
 * reference the form, serviceLifestyle, serviceLifestyleProgram and
 * ourPrograms, all point at the asset by id and are untouched. There is
 * nothing to re-link and nothing to delete.
 *
 * originalFilename is what Sanity serves as the download name and what the
 * Studio shows in the media library, which is where the typo was visible.
 *
 * NOT DONE HERE
 *
 * CurateLifestyle_ReferralForm_Ver.5.pdf, asset
 * file-42b74c99a52d358dd6167a0bcc955de1cfe30515-pdf, is an older referral form
 * referenced by nothing. Deleting it was not part of what Frank approved, so
 * it stays until he says otherwise.
 */

const { mutate, query } = require("./lib/sanity-cli");

const ASSET_ID = "file-6cb3d58ca11474dacffaa870ecaa71c6e2476ca6-pdf";

/** Typed by hand, not pasted. */
const WRONG_NAME = "CurateLifestlye_ReferralForm_Ver.7-Interactive.pdf";
const RIGHT_NAME = "CurateLifestyle_ReferralForm_Ver.7-Interactive.pdf";

const RULE = "=".repeat(78);

function assertTargetsAreClean() {
  for (const [label, value] of [
    ["WRONG_NAME", WRONG_NAME],
    ["RIGHT_NAME", RIGHT_NAME],
  ]) {
    if (!/^[\x20-\x7E]+$/.test(value)) {
      throw new Error(`${label} holds a non-printable character. Retype it.`);
    }
  }

  if (WRONG_NAME === RIGHT_NAME) {
    throw new Error("The two filenames are identical.");
  }

  if (!RIGHT_NAME.includes("CurateLifestyle")) {
    throw new Error("RIGHT_NAME does not spell CurateLifestyle correctly.");
  }
}

async function main() {
  assertTargetsAreClean();

  const apply = process.argv.includes("--apply");

  const asset = await query(
    `*[_id == $id][0]{_id, _rev, originalFilename, size, url}`,
    { id: ASSET_ID }
  );

  if (!asset) {
    console.error(`Cannot find asset ${ASSET_ID}.`);
    process.exit(2);
  }

  const referrers = await query(`*[references($id)]{_id, _type, title}`, {
    id: ASSET_ID,
  });

  console.log(RULE);
  console.log("Curate Lifestyle referral form, filename fix");
  console.log(RULE);
  console.log(`  asset:  ${asset._id}`);
  console.log(`  size:   ${asset.size} bytes`);
  console.log(`  url:    ${asset.url}`);
  console.log(`  before: ${JSON.stringify(asset.originalFilename)}`);
  console.log(`  after:  ${JSON.stringify(RIGHT_NAME)}`);

  console.log(
    `\n  still referenced by ${referrers.length} document(s), all untouched:`
  );
  for (const r of referrers) {
    console.log(`    ${r._type.padEnd(24)} ${r._id}`);
  }

  if (asset.originalFilename === RIGHT_NAME) {
    console.log("\nAlready correct, nothing to do.");
    return;
  }

  if (asset.originalFilename !== WRONG_NAME) {
    console.error(
      `\nREFUSING: filename is ${JSON.stringify(asset.originalFilename)}, ` +
        `expected ${JSON.stringify(WRONG_NAME)}. Someone changed it already.`
    );
    process.exit(2);
  }

  if (!apply) {
    console.log("\nDry run. Nothing written. Re-run with --apply.");
    return;
  }

  const result = await mutate([
    {
      patch: {
        id: ASSET_ID,
        ifRevisionID: asset._rev,
        set: { originalFilename: RIGHT_NAME },
      },
    },
  ]);

  console.log(`\nApplied. Transaction ${result.transactionId}`);

  const after = await query(`*[_id == $id][0]{originalFilename, url}`, {
    id: ASSET_ID,
  });
  console.log(`  filename now: ${JSON.stringify(after.originalFilename)}`);
  console.log(`  url unchanged: ${after.url === asset.url}`);

  const stillReferenced = await query(`count(*[references($id)])`, {
    id: ASSET_ID,
  });
  console.log(`  documents still pointing at it: ${stillReferenced}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
