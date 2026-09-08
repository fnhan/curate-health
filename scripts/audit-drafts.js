/**
 * Stale draft audit. Read-only, writes nothing.
 *
 *   node scripts/audit-drafts.js           summary plus anything dangerous
 *   node scripts/audit-drafts.js --all     every differing field on every draft
 *
 * Exits 1 if any draft would destroy published content when someone presses
 * Publish in the Studio, 0 otherwise.
 *
 * WHY THIS EXISTS
 *
 * A Sanity draft is a whole document, not a patch. Publishing it replaces the
 * published document outright, so a draft that is missing a field the published
 * document has does not leave that field alone: it deletes it.
 *
 * The Recovery Sanctuary draft is the worked example. It carries no `content`
 * field at all while the published document has a body block, so publishing it
 * would silently wipe the page copy. It surfaced by accident during CH-023,
 * which is the reason this audit is now a gate rather than a spot check.
 *
 * Run it before any migration. A migration touches most documents, and a stale
 * draft that outlives the migration is a landmine holding pre-migration shape.
 *
 * WHAT IT CLASSIFIES
 *
 *   DESTRUCTIVE  published has the field, draft does not. Publishing deletes it
 *   CHANGED      both have it and the values differ. Normal editing, review it
 *   ADDED        draft has it, published does not. Normal editing
 *   ORPHAN       draft with no published counterpart. Publishing creates a page
 */

const { query } = require("./lib/sanity-cli");

/** Sanity metadata. Differs on every draft by definition and means nothing. */
const SYSTEM_FIELDS = new Set([
  "_id",
  "_rev",
  "_createdAt",
  "_updatedAt",
  "_system",
]);

const RULE = "=".repeat(78);
const THIN = "-".repeat(78);

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Walks both documents together and records every leaf that differs.
 *
 * Arrays are compared by index rather than by _key. A reordered array reports
 * as a wall of CHANGED entries, which is noisy but honest: it is a real
 * difference and publishing really would apply it.
 */
function diff(published, draft, path = "", found = []) {
  const inPublished = published !== undefined;
  const inDraft = draft !== undefined;

  if (!inPublished && !inDraft) return found;

  if (!inDraft) {
    found.push({ kind: "DESTRUCTIVE", path, published, draft: undefined });
    return found;
  }

  if (!inPublished) {
    found.push({ kind: "ADDED", path, published: undefined, draft });
    return found;
  }

  if (isObject(published) && isObject(draft)) {
    const keys = new Set([...Object.keys(published), ...Object.keys(draft)]);
    for (const key of [...keys].sort()) {
      if (!path && SYSTEM_FIELDS.has(key)) continue;
      if (key === "_key" || key === "_type") continue;
      diff(published[key], draft[key], path ? `${path}.${key}` : key, found);
    }
    return found;
  }

  if (Array.isArray(published) && Array.isArray(draft)) {
    const length = Math.max(published.length, draft.length);
    for (let i = 0; i < length; i++) {
      diff(published[i], draft[i], `${path}[${i}]`, found);
    }
    return found;
  }

  if (JSON.stringify(published) !== JSON.stringify(draft)) {
    found.push({ kind: "CHANGED", path, published, draft });
  }

  return found;
}

function preview(value) {
  if (value === undefined) return "(absent)";
  if (value === null) return "null";

  const text = typeof value === "string" ? value : JSON.stringify(value);

  return JSON.stringify(text.length > 88 ? `${text.slice(0, 88)} ...` : text);
}

async function main() {
  const verbose = process.argv.includes("--all");

  const drafts = await query(`*[_id in path("drafts.**")]`);

  console.log(RULE);
  console.log("Stale draft audit, Sanity source of truth");
  console.log(RULE);
  console.log(`drafts found: ${drafts.length}`);

  if (!drafts.length) {
    console.log("\nPASS: no drafts in the dataset.");
    return;
  }

  const publishedIds = drafts.map((d) => d._id.replace(/^drafts\./, ""));
  const published = await query(`*[_id in $ids]`, { ids: publishedIds });
  const byId = Object.fromEntries(published.map((d) => [d._id, d]));

  let destructiveTotal = 0;

  for (const draft of drafts) {
    const publishedId = draft._id.replace(/^drafts\./, "");
    const counterpart = byId[publishedId];

    console.log(`\n${THIN}`);
    console.log(`${draft._type}  ${publishedId}`);
    console.log(`  draft updated ${draft._updatedAt}`);

    if (!counterpart) {
      console.log("  ORPHAN: no published counterpart.");
      console.log(
        "  Publishing creates a new document rather than updating one."
      );
      continue;
    }

    console.log(`  published updated ${counterpart._updatedAt}`);

    const differences = diff(counterpart, draft);
    const destructive = differences.filter((d) => d.kind === "DESTRUCTIVE");
    const changed = differences.filter((d) => d.kind === "CHANGED");
    const added = differences.filter((d) => d.kind === "ADDED");

    destructiveTotal += destructive.length;

    if (!differences.length) {
      console.log(
        "  identical. Publishing is a no-op, the draft is stale noise."
      );
      continue;
    }

    console.log(
      `  ${destructive.length} destructive, ${changed.length} changed, ${added.length} added`
    );

    for (const entry of destructive) {
      console.log(`\n  DESTRUCTIVE  ${entry.path}`);
      console.log(`      published: ${preview(entry.published)}`);
      console.log("      draft:     (absent, publishing deletes this)");
    }

    if (verbose) {
      for (const entry of [...changed, ...added]) {
        console.log(`\n  ${entry.kind}  ${entry.path}`);
        console.log(`      published: ${preview(entry.published)}`);
        console.log(`      draft:     ${preview(entry.draft)}`);
      }
    } else if (changed.length || added.length) {
      const paths = [...changed, ...added].map((d) => d.path).slice(0, 6);
      console.log(`      non-destructive paths: ${paths.join(", ")}`);
      if (changed.length + added.length > paths.length) {
        console.log(
          `      and ${changed.length + added.length - paths.length} more, re-run with --all`
        );
      }
    }
  }

  console.log(`\n${RULE}`);

  if (destructiveTotal) {
    console.log(
      `FAIL: ${destructiveTotal} field(s) would be deleted by publishing a draft.`
    );
    console.log("Resolve these before migrating. Do not publish blind.");
    process.exit(1);
  }

  console.log("PASS: no draft would delete published content.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
