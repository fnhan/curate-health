/**
 * CH-023. Corrects the Flowpresso spellings and the title tag in Sanity.
 *
 *   node scripts/fix-flowpresso-spelling.js            dry run, writes nothing
 *   node scripts/fix-flowpresso-spelling.js --apply    submits the mutations
 *
 * APPLIED 2026-08-25, transaction wv8LiIZ2vmtSmVH1g7ZgNu. The dataset was
 * otherwise frozen to the CH-022 slug change on this branch, so both the write
 * and the stored title value were signed off before this ran. Re-running it is
 * a no-op: every field already holds its target and the script reports
 * "already correct, nothing to do" rather than patching.
 *
 * SCOPE
 *
 * A grep of the codebase found zero Flowpresso spellings in code. All three
 * spellings live in the dataset:
 *
 *   Section A, the treatment document. seo.pageTitle carries "Flowpesso", which
 *   is the title tag on a page that ranks first in Canada for "Flowpresso
 *   Toronto". The same field feeds og:title and twitter:title, so the typo
 *   renders six times. seo.socialMeta.title carries the same typo but SEO_QUERY
 *   does not select it, so correcting it changes nothing rendered today and
 *   only stops a future query picking the typo back up.
 *
 *   Section B, the Recovery Sanctuary service document and its draft.
 *   seo.pageDescription and seo.socialMeta.description read "Flowspresso". The
 *   pageDescription is what /llms.txt emits, the third defect listed in CH-032,
 *   and it renders eight times on /services/recovery-sanctuary.
 *
 * NOT IN SCOPE, reported by the dry run rather than patched:
 *
 *   The orphaned `metadatas` document holds a fourth copy, "Flowspresso
 *   Therapy", and a slug of /services/recovery-sanctuary/flowspresso-therapy.
 *   That type is not registered in sanity/schema.ts and no query reads it, so
 *   nothing renders it. Same class as the two orphaned 2024 documents in
 *   CH-025: invisible to the site, so not a live defect, and deleting
 *   documents needs sign-off and a fresh export.
 *
 * Patches carry ifRevisionID, so a concurrent Studio edit fails the mutation
 * instead of overwriting it.
 */

const { mutate, query } = require("./lib/sanity-cli");

const TREATMENT_ID = "15127b12-484d-41fb-8491-c6d85b6ad404";
const SERVICE_ID = "b9816e30-cb14-431e-a92f-d3c00adb4eda";
const SERVICE_DRAFT_ID = `drafts.${SERVICE_ID}`;
const ORPHAN_METADATAS_ID = "f56a180f-edc9-47ff-b080-7a7dff7558cb";

/** What the layout appends to every page title. See TARGET_PAGE_TITLE. */
const TITLE_SUFFIX = " | Curate Health";

/**
 * The stored value, not the rendered one. Typed by hand, not pasted.
 *
 * CH-023 specifies the title "FLOWpresso Therapy Toronto | Curate Health".
 * That is the rendered target. The stored value has to be shorter, because
 * app/layout.tsx sets a metadata template of "%s | Curate Health" and Next
 * appends it to whatever a page returns. Storing the full string would render
 * "FLOWpresso Therapy Toronto | Curate Health | Curate Health", which is
 * exactly the CH-006 defect, currently on 17 titles. Verified on the built
 * site: /services/rehab/acupuncture renders its stored title followed by a
 * second " | Curate Health".
 *
 * Storing the bare name renders the CH-023 target today and stays correct after
 * CH-006, since that ticket only suppresses the append for values that already
 * end in the brand.
 */
const TARGET_PAGE_TITLE = "FLOWpresso Therapy Toronto";

/** The wrong spellings, and the one correct one. */
const WRONG = ["Flowpesso", "Flowspresso"];
const RIGHT = "Flowpresso";

const RULE = "=".repeat(78);
const THIN = "-".repeat(78);

/**
 * Guards against this file itself carrying invisible characters from a future
 * paste. scripts/retire-second-location.js shipped a literal U+0000, which is
 * category Cc and so invisible to the CH-020 Cf audit, hence the ASCII test.
 */
function assertTargetsAreClean() {
  const values = { TARGET_PAGE_TITLE, RIGHT, TITLE_SUFFIX, ...WRONG };

  for (const [name, value] of Object.entries(values)) {
    if (typeof value !== "string") continue;

    if (!/^[\x20-\x7E]+$/.test(value)) {
      throw new Error(
        `${name} holds a non-printable-ASCII character. Retype it by hand.`
      );
    }
  }

  if (TARGET_PAGE_TITLE !== TARGET_PAGE_TITLE.trim()) {
    throw new Error("TARGET_PAGE_TITLE has untrimmed whitespace.");
  }

  if (TARGET_PAGE_TITLE.endsWith(TITLE_SUFFIX)) {
    throw new Error(
      "TARGET_PAGE_TITLE already ends in the brand. The layout appends it " +
        "again, which is the CH-006 defect. Store the bare name."
    );
  }
}

/** Replaces every wrong spelling in a string. Returns null if nothing changes. */
function respell(value) {
  if (typeof value !== "string") return null;

  let out = value;
  for (const wrong of WRONG) {
    out = out.split(wrong).join(RIGHT);
  }

  return out === value ? null : out;
}

function get(document, path) {
  return path
    .split(".")
    .reduce((node, key) => (node ? node[key] : undefined), document);
}

function show(label, before, after) {
  console.log(`  ${label}`);
  console.log(`      before: ${JSON.stringify(before)}`);
  console.log(`      after:  ${JSON.stringify(after)}`);
}

async function main() {
  assertTargetsAreClean();

  const apply = process.argv.includes("--apply");

  const ids = [TREATMENT_ID, SERVICE_ID, SERVICE_DRAFT_ID];
  const documents = await query("*[_id in $ids]", { ids });
  const byId = Object.fromEntries(documents.map((d) => [d._id, d]));

  if (!byId[TREATMENT_ID] || !byId[SERVICE_ID]) {
    console.error(
      "Cannot find the treatment or the service document.\n" +
        "Re-survey the dataset before assuming this ticket is applied."
    );
    process.exit(2);
  }

  const mutations = [];

  console.log(RULE);
  console.log("CH-023  Section A, the Flowpresso treatment title");
  console.log(RULE);

  {
    const document = byId[TREATMENT_ID];
    const set = {};

    const currentTitle = get(document, "seo.pageTitle");
    if (currentTitle !== TARGET_PAGE_TITLE) {
      show(
        "seo.pageTitle          renders as title, og:title and twitter:title",
        currentTitle,
        TARGET_PAGE_TITLE
      );
      const rendered = TARGET_PAGE_TITLE + TITLE_SUFFIX;
      console.log(
        `      renders: ${JSON.stringify(rendered)}  (${rendered.length} chars)`
      );
      set["seo.pageTitle"] = TARGET_PAGE_TITLE;
    }

    const currentSocial = get(document, "seo.socialMeta.title");
    const fixedSocial = respell(currentSocial);
    if (fixedSocial) {
      show(
        "seo.socialMeta.title   not selected by SEO_QUERY, stored typo only",
        currentSocial,
        fixedSocial
      );
      set["seo.socialMeta.title"] = fixedSocial;
    }

    if (Object.keys(set).length) {
      mutations.push({
        patch: { id: document._id, ifRevisionID: document._rev, set },
      });
    } else {
      console.log("  already correct, nothing to do");
    }
  }

  console.log(`\n${RULE}`);
  console.log(
    "CH-023  Section B, Recovery Sanctuary description, feeds llms.txt"
  );
  console.log(RULE);

  for (const id of [SERVICE_ID, SERVICE_DRAFT_ID]) {
    const document = byId[id];
    if (!document) {
      console.log(`  ${id}  absent, skipping`);
      continue;
    }

    console.log(
      `  ${id === SERVICE_DRAFT_ID ? "draft    " : "published"}  rev ${document._rev}`
    );
    const set = {};

    for (const path of ["seo.pageDescription", "seo.socialMeta.description"]) {
      const current = get(document, path);
      const fixed = respell(current);
      if (fixed) {
        show(`  ${path}`, current, fixed);
        set[path] = fixed;
      }
    }

    if (Object.keys(set).length) {
      mutations.push({
        patch: { id: document._id, ifRevisionID: document._rev, set },
      });
    } else {
      console.log("      already correct, nothing to do");
    }
  }

  console.log(`\n${THIN}`);
  console.log("NOT PATCHED, reported only");
  console.log(THIN);

  const orphan = await query(
    `*[_id == $id][0]{_id, _type, "entry": datas[24]{title, "slug": slug.current}}`,
    { id: ORPHAN_METADATAS_ID }
  );

  if (orphan) {
    console.log(`  ${orphan._type} ${orphan._id}`);
    console.log(
      `      datas[24].title = ${JSON.stringify(orphan.entry?.title)}`
    );
    console.log(
      `      datas[24].slug  = ${JSON.stringify(orphan.entry?.slug)}`
    );
    console.log("      Type is not in sanity/schema.ts and no query reads it,");
    console.log(
      "      so nothing renders these. Same class as CH-025 orphans."
    );
  }

  if (!mutations.length) {
    console.log("\nNothing to apply.");
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
    `*[_id in $ids]{_id, _rev, "pageTitle": seo.pageTitle, "pageDescription": seo.pageDescription}`,
    { ids }
  );

  console.log("Verified against the dataset:");
  for (const document of after) {
    console.log(`  ${document._id}  rev ${document._rev}`);
    if (document.pageTitle) {
      console.log(`      pageTitle: ${JSON.stringify(document.pageTitle)}`);
    }
    if (document.pageDescription) {
      console.log(
        `      pageDescription: ${JSON.stringify(document.pageDescription.slice(0, 90))}`
      );
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
