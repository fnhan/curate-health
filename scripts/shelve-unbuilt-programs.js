/**
 * Marks Essential Series and Master Health Blueprint inactive.
 *
 *   node scripts/shelve-unbuilt-programs.js            dry run
 *   node scripts/shelve-unbuilt-programs.js --apply    writes
 *
 * Frank shelved both on 2026-09-08: no pages will be built for them for now.
 * Only Curate Lifestyle goes ahead.
 *
 * Inactive rather than deleted. The two documents hold real migrated content,
 * their descriptions and their comparison table rows, and that content was
 * assembled once against a table whose row order is a trap. Deleting them
 * would mean redoing that work, and the mapping, whenever they come back.
 *
 * This changes nothing a visitor sees. No page reads program documents yet.
 * What it buys is that when the programs hub is rewired to read them, these
 * two do not appear on their own.
 *
 * The live programs page is untouched. It still renders all three from the
 * `ourPrograms` document, which is correct: the current page is finished and
 * Frank shelved building separate pages, not the programs themselves.
 */

const { mutate, query } = require("./lib/sanity-cli");

const SHELVED = ["program-essential-series", "program-master-health-blueprint"];
const KEEP_ACTIVE = "program-curate-lifestyle";

const RULE = "=".repeat(78);

async function main() {
  const apply = process.argv.includes("--apply");

  const docs = await query(
    `*[_type == "program"]{_id, title, isActive} | order(title asc)`
  );

  if (!docs.length) {
    console.error("No program documents found.");
    process.exit(2);
  }

  console.log(RULE);
  console.log("Shelving the programs that are not being built yet");
  console.log(RULE);

  const mutations = [];

  for (const doc of docs) {
    const shelve = SHELVED.includes(doc._id);
    const label = shelve ? "shelve" : "keep active";

    console.log(
      `  ${String(doc.title).padEnd(26)} isActive ${doc.isActive} -> ${shelve ? false : doc.isActive}   ${label}`
    );

    if (shelve && doc.isActive !== false) {
      mutations.push({ patch: { id: doc._id, set: { isActive: false } } });
    }
  }

  const curateLifestyle = docs.find((d) => d._id === KEEP_ACTIVE);
  if (!curateLifestyle) {
    console.error(`\nREFUSING: ${KEEP_ACTIVE} not found. Check the ids.`);
    process.exit(2);
  }
  if (curateLifestyle.isActive === false) {
    console.error(
      "\nREFUSING: Curate Lifestyle is inactive. That is the one going ahead."
    );
    process.exit(2);
  }

  if (!mutations.length) {
    console.log("\nAlready shelved, nothing to do.");
    return;
  }

  if (!apply) {
    console.log(
      `\nDry run. ${mutations.length} patch(es) prepared, nothing written.`
    );
    return;
  }

  const result = await mutate(mutations);
  console.log(`\nApplied. Transaction ${result.transactionId}`);

  const after = await query(
    `*[_type == "program"]{title, isActive} | order(title asc)`
  );
  console.log("Verified:");
  for (const d of after) {
    console.log(`  ${String(d.title).padEnd(26)} isActive=${d.isActive}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
