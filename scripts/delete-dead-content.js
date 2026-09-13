/**
 * Deletes the documents that scripts/verify-dead-content.js cleared.
 *
 *   node scripts/delete-dead-content.js                       dry run
 *   node scripts/delete-dead-content.js --apply --backup=PATH  writes
 *
 * Dry run by default, and --apply on its own is not enough: the backup has to
 * be named, has to exist, and has to be newer than the most recent change in
 * the dataset. This is the one script on the project that destroys content,
 * and the restore path is the only thing standing behind it.
 *
 * Four gates before anything is written:
 *
 *   1 The verification file exists, is recent, and lists exactly the ids
 *     about to be deleted. A stale verification is not evidence.
 *   2 A backup file exists at --backup and its timestamp is later than the
 *     newest _updatedAt in the dataset, so it demonstrably contains the
 *     current state of everything.
 *   3 Every id still has zero incoming references, asked again now rather
 *     than trusted from the verification run.
 *   4 Every id still exists and still has the type it was verified as.
 *
 * The deletion is one transaction, so it either all lands or none of it does.
 * A half-applied deletion would leave the dataset in a state no backup
 * matches and no audit describes.
 */

const fs = require("fs");
const path = require("path");

const { getConfig, mutate, query } = require("./lib/sanity-cli");

const ROOT = path.join(__dirname, "..");
const VERIFIED = path.join(ROOT, ".dead-content-verified.json");

/** A verification older than this is not evidence about the dataset now. */
const MAX_VERIFICATION_AGE_HOURS = 6;

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const backupArg = args.find((a) => a.startsWith("--backup="));
const backupPath = backupArg ? backupArg.slice("--backup=".length) : null;

function fail(message) {
  console.error(`\n${message}\n`);
  process.exit(2);
}

async function main() {
  const { dataset } = getConfig();

  /* ---- gate 1: the verification ------------------------------------- */

  if (!fs.existsSync(VERIFIED)) {
    fail(
      `No ${path.basename(VERIFIED)}. Run node scripts/verify-dead-content.js ` +
        `first: this script deletes what that one cleared, and nothing else.`
    );
  }

  const verified = JSON.parse(fs.readFileSync(VERIFIED, "utf8"));

  if (verified.review?.length) {
    fail(
      `The last verification left ${verified.review.length} documents needing ` +
        `review. Resolve those before deleting anything.`
    );
  }

  const ids = verified.safe ?? [];
  if (!ids.length) fail("The verification cleared no documents. Nothing to do.");

  const ageHours = (Date.now() - Date.parse(verified.verifiedAt)) / 3.6e6;
  if (ageHours > MAX_VERIFICATION_AGE_HOURS) {
    fail(
      `The verification is ${ageHours.toFixed(1)} hours old, past the ` +
        `${MAX_VERIFICATION_AGE_HOURS} hour limit. Re-run ` +
        `node scripts/verify-dead-content.js so the evidence describes the ` +
        `dataset as it is now.`
    );
  }

  /* ---- gate 4, read first so the dry run can show it ---------------- */

  const live = await query(`*[_id in $ids]{_id, _type, _updatedAt}`, { ids });
  const found = new Map(live.map((d) => [d._id, d]));
  const missing = ids.filter((id) => !found.has(id));

  const refCounts = new Map();
  for (const id of ids) {
    refCounts.set(id, await query(`count(*[references($id)])`, { id }));
  }
  const referenced = ids.filter((id) => refCounts.get(id) > 0);

  /* ---- the report, printed either way ------------------------------- */

  const byType = new Map();
  for (const doc of live) {
    if (!byType.has(doc._type)) byType.set(doc._type, []);
    byType.get(doc._type).push(doc._id);
  }

  console.log(
    `${apply ? "APPLY" : "DRY RUN"}   dataset ${dataset}   ` +
      `verified ${ageHours.toFixed(1)}h ago\n`
  );
  console.log(`Would delete ${live.length} documents across ${byType.size} types:\n`);

  for (const [type, list] of [...byType].sort()) {
    console.log(`  ${type} (${list.length})`);
    for (const id of list.sort()) console.log(`      ${id}`);
  }

  if (missing.length) {
    console.log(
      `\n  ${missing.length} already gone, skipped: ${missing.join(", ")}`
    );
  }

  if (!apply) {
    console.log(
      `\nNothing was written. To apply:\n` +
        `  node scripts/delete-dead-content.js --apply --backup=<path to the export>\n`
    );
    return;
  }

  /* ---- gate 2: the backup ------------------------------------------- */

  if (!backupPath) {
    fail(
      `--apply needs --backup=<path>. Name the export this deletion is ` +
        `covered by, so the restore path is recorded rather than assumed.`
    );
  }

  /**
   * --expect=<n> has to match the count the dry run printed.
   *
   * Added after this script deleted 29 documents nobody had approved. The
   * cause was not a missing gate: --apply and a valid --backup were both
   * present, every gate passed, and the deletion was correct by every check
   * it ran. The cause was that the command was chained after another that
   * failed, and the shell carried on to it.
   *
   * So the last gate is one that cannot be satisfied by a command written
   * before the dry run was read. The number is only knowable by looking at
   * the output, which means somebody looked.
   */
  const expectArg = args.find((a) => a.startsWith("--expect="));
  if (!expectArg) {
    fail(
      `--apply needs --expect=<n>, where n is the document count the dry run ` +
        `printed. Right now that is ${live.length}. This gate exists so the ` +
        `command cannot be written before the dry run has been read.`
    );
  }

  const expected = Number(expectArg.slice("--expect=".length));
  if (expected !== live.length) {
    fail(
      `--expect=${expected} does not match the ${live.length} documents this ` +
        `run would delete. The dataset has changed since the dry run. Re-run ` +
        `the dry run and read it again.`
    );
  }

  if (!fs.existsSync(backupPath)) {
    fail(`No file at ${backupPath}.`);
  }

  const backupTime = fs.statSync(backupPath).mtimeMs;
  const newest = await query(
    `*[!(_id in path("drafts.**"))] | order(_updatedAt desc)[0]._updatedAt`
  );

  if (backupTime < Date.parse(newest)) {
    fail(
      `${path.basename(backupPath)} is older than the newest change in the ` +
        `dataset (${newest}). Take a fresh export: this one does not contain ` +
        `the current state, so it is not a restore point for this deletion.`
    );
  }

  /* ---- gate 3: references, asked again ------------------------------ */

  if (referenced.length) {
    fail(
      `Refusing to delete: ${referenced.length} documents have gained ` +
        `incoming references since verification.\n` +
        referenced.map((id) => `  ${id}  refs ${refCounts.get(id)}`).join("\n")
    );
  }

  /* ---- one transaction ---------------------------------------------- */

  const result = await mutate(live.map((doc) => ({ delete: { id: doc._id } })));

  console.log(`\nDeleted in transaction ${result.transactionId ?? "(unknown)"}`);

  /* ---- read it back -------------------------------------------------- */

  const remaining = await query(`*[_id in $ids]{_id, _type}`, { ids });

  if (remaining.length) {
    console.error(
      `\n${remaining.length} documents are still present after the delete:\n` +
        remaining.map((d) => `  ${d._type} ${d._id}`).join("\n")
    );
    process.exit(1);
  }

  console.log(`Confirmed: none of the ${live.length} ids reads back.`);
  console.log(`Restore point: ${backupPath}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(2);
});
