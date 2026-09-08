/**
 * CH-022. Corrects the acupuncture treatment slug in Sanity.
 *
 *   node scripts/fix-acupuncture-slug.js            dry run, writes nothing
 *   node scripts/fix-acupuncture-slug.js --apply    submits the mutation
 *
 * The slug is stored as "acupunture". The correct spelling 404s, so any inbound
 * link built to the sensible spelling dies. The 301 from the typo lives in
 * next.config.mjs and is a code change; this is the data half.
 *
 * SCOPE
 *
 * One field, treatmentSlug.current, on the acupuncture treatment document and
 * its draft if one exists. Nothing else on the document is read for writing and
 * nothing else in the dataset is touched. In particular this does not correct
 * the "Flowpesso" and "Flowspresso" spellings found by the same survey, which
 * are CH-023 and need Frank's sign-off on the replacement copy.
 *
 * The patch carries ifRevisionID, so an edit made in the Studio between the dry
 * run and the apply fails the mutation instead of overwriting it.
 *
 * A slug change breaks the old URL by definition, which is why this runs after
 * a fresh dataset export, per the working rules in CLAUDE.md.
 */

const { mutate, query } = require("./lib/sanity-cli");

/** The document the survey found. Nothing else is patched. */
const PUBLISHED_ID = "1d426053-e8f5-4a4c-96fa-eed2ed7d50a5";
const DRAFT_ID = `drafts.${PUBLISHED_ID}`;

/** Typed by hand, not pasted, per the working rules. */
const CURRENT_SLUG = "acupunture";
const TARGET_SLUG = "acupuncture";

const RULE = "=".repeat(78);

/**
 * Guards against this file itself carrying invisible characters from a future
 * paste. CH-020 covers Cf; scripts/retire-second-location.js shipped a literal
 * U+0000, which is Cc, so this checks for anything outside printable ASCII.
 */
function assertTargetsAreClean() {
  for (const [name, value] of Object.entries({ CURRENT_SLUG, TARGET_SLUG })) {
    if (!/^[a-z0-9-]+$/.test(value)) {
      throw new Error(
        `${name} is not a plain lowercase slug. Retype it by hand.`
      );
    }
  }

  if (CURRENT_SLUG === TARGET_SLUG) {
    throw new Error("CURRENT_SLUG and TARGET_SLUG are identical.");
  }
}

async function main() {
  assertTargetsAreClean();

  const apply = process.argv.includes("--apply");

  const documents = await query("*[_id in $ids]", {
    ids: [PUBLISHED_ID, DRAFT_ID],
  });

  if (!documents.some((document) => document._id === PUBLISHED_ID)) {
    console.error(
      `Cannot find the published document ${PUBLISHED_ID}.\n` +
        `Confirm against the dataset before assuming this ticket is applied.`
    );
    process.exit(2);
  }

  // Refuse to create a collision. TREATMENT_BY_SLUG_QUERY takes [0] of the
  // match, so two documents on one slug would serve whichever Sanity returns
  // first, silently.
  const collisions = await query(
    `*[_type == "treatments" && treatmentSlug.current == $slug && !(_id in $ids)]{_id, title}`,
    { slug: TARGET_SLUG, ids: [PUBLISHED_ID, DRAFT_ID] }
  );

  if (collisions.length) {
    console.error(
      `Another document already uses the slug "${TARGET_SLUG}":\n` +
        collisions.map((d) => `  ${d._id}  ${d.title}`).join("\n")
    );
    process.exit(2);
  }

  console.log(RULE);
  console.log(
    `CH-022  treatmentSlug.current  "${CURRENT_SLUG}" -> "${TARGET_SLUG}"`
  );
  console.log(RULE);

  const mutations = [];

  for (const document of documents) {
    const current = document.treatmentSlug?.current ?? null;
    const label = document._id === DRAFT_ID ? "draft    " : "published";

    if (current === TARGET_SLUG) {
      console.log(`  ${label}  already "${TARGET_SLUG}", nothing to do`);
      continue;
    }

    if (current !== CURRENT_SLUG) {
      console.error(
        `  ${label}  unexpected value ${JSON.stringify(current)}.\n` +
          `  Expected ${JSON.stringify(CURRENT_SLUG)}. Refusing to patch blind.`
      );
      process.exit(2);
    }

    console.log(`  ${label}  ${document._id}  rev ${document._rev}`);
    console.log(`             title: ${JSON.stringify(document.title)}`);
    console.log(
      `             ${JSON.stringify(current)} -> ${JSON.stringify(TARGET_SLUG)}`
    );

    mutations.push({
      patch: {
        id: document._id,
        ifRevisionID: document._rev,
        set: { "treatmentSlug.current": TARGET_SLUG },
      },
    });
  }

  if (!mutations.length) {
    console.log("\nNothing to apply.");
    return;
  }

  if (!apply) {
    console.log(
      `\nDry run. ${mutations.length} patch(es) prepared, nothing written.` +
        `\nRe-run with --apply to submit.`
    );
    return;
  }

  const result = await mutate(mutations);
  console.log(`\nApplied. Transaction ${result.transactionId}`);

  const after = await query(
    `*[_id in $ids]{_id, _rev, "slug": treatmentSlug.current}`,
    { ids: [PUBLISHED_ID, DRAFT_ID] }
  );

  console.log("Verified against the dataset:");
  for (const document of after) {
    console.log(
      `  ${document._id}  slug=${JSON.stringify(document.slug)}  rev ${document._rev}`
    );
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
