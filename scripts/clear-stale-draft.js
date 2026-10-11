/**
 * Delete a draft that holds nothing the published document does not already
 * have, and refuse to delete any other kind.
 *
 *   node scripts/clear-stale-draft.js --id=<published id>           # dry run
 *   node scripts/clear-stale-draft.js --id=<published id> --apply
 *
 * WHY THIS EXISTS
 *
 * A Sanity draft is a whole document, not a patch, so publishing one replaces
 * the published document outright. A draft left open in the Studio while a
 * migration script writes to the same document becomes a snapshot of the state
 * before that script ran, and the next person to press Publish silently undoes
 * the migration. scripts/audit-drafts.js finds these. This removes them.
 *
 * The worked example is `siteSettings`, cleared 2026-10-11. Its draft was saved
 * at 18:18 on 2026-09-12 and the published document at 22:11 the same day, when
 * add-social-and-hours.js ran. The draft therefore still held the pre-CH-008
 * social list, two profiles rather than five with no entity or label fields,
 * and the pre-CH-010 `/#products` anchor in both the nav and the footer.
 * Publishing it would have deleted TikTok and Facebook from `sameAs` and
 * re-orphaned the five product pages, in one click, with no warning.
 *
 * THE THREE GUARDS
 *
 * Deleting a draft destroys unpublished work if the draft is real, so this
 * refuses unless all three hold, and says which one failed:
 *
 *   1. A published document exists. Deleting an orphan draft destroys a page
 *      nobody has published yet, which is the opposite of safe.
 *   2. The draft is older than the published document. A newer draft is
 *      somebody editing, not a leftover.
 *   3. The draft adds no field the published document lacks. One added field
 *      is unpublished work, whatever the timestamps say.
 *
 * A draft that is merely different is not stale. Differences are expected and
 * are printed for the reader to judge, but only the three conditions above
 * decide whether the delete is allowed.
 *
 * Check the delete against a backup taken the same day, per the working rules.
 */

const { query, mutate } = require("./lib/sanity-cli");

const SYSTEM_FIELDS = new Set([
  "_id",
  "_rev",
  "_createdAt",
  "_updatedAt",
  "_system",
]);

/** Flatten to leaf paths so arrays compare element by element. */
function leaves(node, prefix, out) {
  if (node && typeof node === "object") {
    if (Array.isArray(node)) {
      node.forEach((v, i) => leaves(v, `${prefix}[${i}]`, out));
    } else {
      for (const [k, v] of Object.entries(node)) {
        if (!SYSTEM_FIELDS.has(k)) leaves(v, prefix ? `${prefix}.${k}` : k, out);
      }
    }
  } else {
    out[prefix] = node;
  }
}

const RULE = "=".repeat(78);

async function main() {
  const apply = process.argv.includes("--apply");
  const idArg = process.argv.find((a) => a.startsWith("--id="));

  if (!idArg) {
    console.error("Pass --id=<published document id>. Draft ids are derived.");
    process.exit(2);
  }

  const publishedId = idArg.slice("--id=".length).replace(/^drafts\./, "");
  const draftId = `drafts.${publishedId}`;

  const [published] = await query(`*[_id == $id]`, { id: publishedId });
  const [draft] = await query(`*[_id == $id]`, { id: draftId });

  console.log(RULE);
  console.log(`Stale draft check: ${publishedId}`);
  console.log(RULE);

  if (!draft) {
    console.log("No draft. Nothing to do.");
    return;
  }

  // Guard 1
  if (!published) {
    console.error(`\nREFUSED. No published document, so this draft is an`);
    console.error("orphan and deleting it destroys a page nobody has published.");
    process.exit(1);
  }

  console.log(`type:               ${published._type}`);
  console.log(`published updated:  ${published._updatedAt}`);
  console.log(`draft updated:      ${draft._updatedAt}`);

  const olderBy =
    (new Date(published._updatedAt) - new Date(draft._updatedAt)) / 3.6e6;

  const P = {};
  const D = {};
  leaves(published, "", P);
  leaves(draft, "", D);
  const paths = [...new Set([...Object.keys(P), ...Object.keys(D)])].sort();

  const destructive = paths.filter((k) => k in P && !(k in D));
  const changed = paths.filter((k) => k in P && k in D && P[k] !== D[k]);
  const added = paths.filter((k) => !(k in P) && k in D);

  console.log(
    `\n${destructive.length} destructive, ${changed.length} changed, ${added.length} added`
  );
  console.log("\nWhat publishing this draft would do:");
  for (const k of destructive) {
    console.log(`  DELETE  ${k} = ${JSON.stringify(P[k])}`);
  }
  for (const k of changed) {
    console.log(`  CHANGE  ${k}`);
    console.log(`            now:   ${JSON.stringify(P[k])}`);
    console.log(`            draft: ${JSON.stringify(D[k])}`);
  }

  // Guard 2
  if (olderBy <= 0) {
    console.error(
      `\nREFUSED. The draft is newer than the published document, so it is`
    );
    console.error("somebody editing rather than a leftover. Ask before deleting.");
    process.exit(1);
  }

  // Guard 3
  if (added.length) {
    console.error(`\nREFUSED. The draft adds ${added.length} field(s) the published`);
    console.error("document does not have, which is unpublished work:");
    for (const k of added) console.error(`  ${k} = ${JSON.stringify(D[k])}`);
    process.exit(1);
  }

  console.log(
    `\nStale: ${olderBy.toFixed(1)}h older than published, and adds nothing.`
  );
  console.log("Everything in it is an older copy of something already live.");

  if (!apply) {
    console.log("\nDry run. Nothing written. Re-run with --apply.");
    return;
  }

  const result = await mutate([{ delete: { id: draftId } }]);
  console.log(
    `\nDeleted ${draftId}. Transaction ${result.transactionId || "(id not returned)"}`
  );
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
