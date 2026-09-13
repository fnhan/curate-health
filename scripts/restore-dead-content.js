/**
 * Puts back the documents scripts/delete-dead-content.js removed.
 *
 *   node scripts/restore-dead-content.js --backup=PATH            dry run
 *   node scripts/restore-dead-content.js --backup=PATH --apply    writes
 *
 * Reads the documents out of a Sanity export archive and recreates them with
 * their original ids and field values. Additive: it uses createIfNotExists,
 * so running it twice is harmless and it will never overwrite a document that
 * has come back some other way.
 *
 * What it cannot restore is _updatedAt and _rev, which Sanity assigns. The
 * content returns; the history does not. If the original timestamps matter,
 * restore the whole dataset from the archive with the Sanity CLI instead:
 *
 *   npx sanity dataset import <archive> production --replace
 *
 * That is the heavier option and it overwrites everything, so this script is
 * the right one when the goal is only to undo a targeted deletion.
 */

const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const { mutate, query } = require("./lib/sanity-cli");

const ROOT = path.join(__dirname, "..");
const VERIFIED = path.join(ROOT, ".dead-content-verified.json");

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const backupArg = args.find((a) => a.startsWith("--backup="));
const backupPath = backupArg ? backupArg.slice("--backup=".length) : null;

function fail(message) {
  console.error(`\n${message}\n`);
  process.exit(2);
}

/** Pulls data.ndjson out of the archive into a temp directory. */
function readArchive(archive) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "curate-restore-"));
  /**
   * --force-local, because GNU tar reads a Windows path as host:path and
   * tries to open a network connection to a drive letter: "Cannot connect to
   * C: resolve failed". Frank is on Windows, so this is the normal case here,
   * not the edge case.
   */
  execFileSync("tar", ["--force-local", "-xzf", archive, "-C", dir], {
    stdio: "pipe",
  });

  const found = [];
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === "data.ndjson") found.push(full);
    }
  };
  walk(dir);

  if (!found.length) fail(`No data.ndjson inside ${archive}.`);

  return fs
    .readFileSync(found[0], "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

async function main() {
  if (!backupPath) fail("Needs --backup=<path to the export archive>.");
  if (!fs.existsSync(backupPath)) fail(`No file at ${backupPath}.`);

  if (!fs.existsSync(VERIFIED)) {
    fail(
      `No ${path.basename(VERIFIED)}, so there is no record of which ids were ` +
        `deleted. Name them by hand rather than guessing from the archive.`
    );
  }

  const ids = JSON.parse(fs.readFileSync(VERIFIED, "utf8")).safe ?? [];
  if (!ids.length) fail("The verification file lists no ids.");

  console.log(`Reading ${path.basename(backupPath)}...`);
  const archived = readArchive(backupPath);
  const byId = new Map(archived.map((d) => [d._id, d]));

  const recoverable = ids.filter((id) => byId.has(id));
  const absent = ids.filter((id) => !byId.has(id));

  if (absent.length) {
    fail(
      `Refusing to restore: ${absent.length} of ${ids.length} ids are not in ` +
        `this archive, so it is the wrong backup for this deletion.\n` +
        absent.map((id) => `  ${id}`).join("\n")
    );
  }

  const present = await query(`*[_id in $ids]._id`, { ids });
  const toCreate = recoverable.filter((id) => !present.includes(id));

  console.log(
    `\n${apply ? "APPLY" : "DRY RUN"}   ` +
      `${ids.length} ids, ${present.length} already in the dataset, ` +
      `${toCreate.length} to recreate\n`
  );

  const byType = new Map();
  for (const id of toCreate) {
    const type = byId.get(id)._type;
    if (!byType.has(type)) byType.set(type, []);
    byType.get(type).push(id);
  }
  for (const [type, list] of [...byType].sort()) {
    console.log(`  ${type} (${list.length})`);
  }

  if (!apply) {
    console.log(
      `\nNothing was written. To apply:\n` +
        `  node scripts/restore-dead-content.js --backup=${backupPath} --apply\n`
    );
    return;
  }

  if (!toCreate.length) {
    console.log("\nNothing to do: every id is already present.");
    return;
  }

  const result = await mutate(
    toCreate.map((id) => ({ createIfNotExists: byId.get(id) }))
  );

  console.log(`\nRestored in transaction ${result.transactionId ?? "(unknown)"}`);

  const back = await query(`*[_id in $ids]{_id, _type}`, { ids });
  const stillGone = ids.filter((id) => !back.some((d) => d._id === id));

  if (stillGone.length) {
    console.error(
      `\n${stillGone.length} ids did not come back:\n` +
        stillGone.map((id) => `  ${id}`).join("\n")
    );
    process.exit(1);
  }

  console.log(`Confirmed: all ${ids.length} documents read back.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(2);
});
