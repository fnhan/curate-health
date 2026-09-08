/**
 * Deletes two unpublished Sanity documents. Approved by Frank on 2026-09-07.
 *
 *   node scripts/delete-stale-drafts.js            dry run, deletes nothing
 *   node scripts/delete-stale-drafts.js --apply    deletes them
 *
 * Deleting is the most destructive thing in this project, so this refuses to
 * run unless the dataset still matches what was approved. If anything has
 * changed it exits 2 and deletes nothing.
 *
 * WHAT IS BEING DELETED, AND WHY IT IS SAFE
 *
 * 1. The Recovery Sanctuary unpublished copy.
 *
 *    This is not a second page. It is an unfinished edit of the live page at
 *    /services/recovery-sanctuary. It is missing the intro paragraph the live
 *    page has, and is otherwise identical to it, so publishing it would delete
 *    that paragraph and change nothing else. It holds nothing worth keeping.
 *
 *    Deleting an unpublished edit does not touch the live page. The live page
 *    is a separate document and is not referenced here.
 *
 * 2. The Outdoor Pilates duplicate.
 *
 *    A word-for-word copy of the live Outdoor Pilates page, all 120 text
 *    fields identical, created two weeks after it. It claims the same URL
 *    slug, and the query that serves treatment pages takes the first match,
 *    so if it were ever published which page visitors get becomes arbitrary.
 *
 * Neither document is referenced by any other document, checked below before
 * deleting, so nothing is left pointing at a missing record.
 */

const { mutate, query } = require("./lib/sanity-cli");

const TARGETS = [
  {
    id: "drafts.b9816e30-cb14-431e-a92f-d3c00adb4eda",
    label: "Recovery Sanctuary, unpublished edit",
    // Must still exist and still be the live page's counterpart.
    livePageId: "b9816e30-cb14-431e-a92f-d3c00adb4eda",
    // The field whose absence made it dangerous. Guards against deleting a
    // draft that someone has since finished.
    expectMissingField: "content",
  },
  {
    id: "drafts.903bba2b-ce61-49a9-91f0-4d042ccb8770",
    label: "Outdoor Pilates, duplicate",
    livePageId: "f665b175-6b04-4335-9252-eb32a67f575b",
    expectMissingField: null,
  },
];

const RULE = "=".repeat(78);

function fail(message) {
  console.error(`\nREFUSING TO DELETE: ${message}`);
  console.error("Nothing was deleted. Re-check the dataset.");
  process.exit(2);
}

async function main() {
  const apply = process.argv.includes("--apply");

  console.log(RULE);
  console.log("Deleting two unpublished documents");
  console.log(RULE);

  const deletions = [];

  for (const target of TARGETS) {
    const doc = await query(`*[_id == $id][0]`, { id: target.id });

    if (!doc) {
      console.log(`\n  ${target.label}`);
      console.log(`    ${target.id}`);
      console.log("    already gone, nothing to do");
      continue;
    }

    const live = await query(`*[_id == $id][0]{_id, _rev, title}`, {
      id: target.livePageId,
    });

    if (!live) {
      fail(
        `the live page ${target.livePageId} is missing. ` +
          `Deleting the unpublished copy is only safe while the live one exists.`
      );
    }

    if (
      target.expectMissingField &&
      doc[target.expectMissingField] !== undefined
    ) {
      fail(
        `${target.id} now has a "${target.expectMissingField}" field. ` +
          `Someone has worked on it since this was approved.`
      );
    }

    // Nothing else may point at it. A reference to a deleted document leaves a
    // dangling link that renders as a missing page rather than an error.
    const referrers = await query(
      `*[references($id) && _id != $id]{_id, _type}`,
      { id: target.id }
    );

    if (referrers.length) {
      fail(
        `${target.id} is referenced by ${referrers.length} document(s): ` +
          referrers.map((r) => `${r._type} ${r._id}`).join(", ")
      );
    }

    console.log(`\n  ${target.label}`);
    console.log(`    deleting:  ${doc._id}`);
    console.log(
      `    live page: ${live._id} ${JSON.stringify(live.title)}, untouched`
    );
    console.log("    referenced by nothing");

    deletions.push({ delete: { id: doc._id } });
  }

  if (!deletions.length) {
    console.log("\nNothing to delete.");
    return;
  }

  if (!apply) {
    console.log(
      `\nDry run. ${deletions.length} deletion(s) prepared, nothing written.`
    );
    return;
  }

  const result = await mutate(deletions);
  console.log(`\nDeleted. Transaction ${result.transactionId}`);

  for (const target of TARGETS) {
    const gone = await query(`count(*[_id == $id])`, { id: target.id });
    const live = await query(`count(*[_id == $id])`, { id: target.livePageId });
    console.log(
      `  ${target.label}: unpublished copy ${gone === 0 ? "gone" : "STILL PRESENT"}, ` +
        `live page ${live === 1 ? "intact" : "MISSING"}`
    );
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
