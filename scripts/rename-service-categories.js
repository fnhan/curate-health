/**
 * Renames two service categories and moves Psychotherapy under One-on-One Care.
 *
 *   node scripts/rename-service-categories.js            dry run
 *   node scripts/rename-service-categories.js --apply    writes
 *
 *   Rehab            -> One-on-One Care        /services/one-on-one-care
 *   Exercise Therapy -> Movement and Training  /services/movement-and-training
 *
 * REQUIRES THE ALIAS CODE TO BE LIVE FIRST
 *
 * app/services/[slug]/page.tsx redirects the old slugs to the new ones, using
 * RENAMED_SERVICE_SLUGS in lib/service-urls.ts. That shipped in #207. Until it
 * is deployed, renaming here takes /services/rehab straight to 404, because
 * nothing else knows the old name.
 *
 * This script checks for it rather than trusting the deploy timeline: it
 * fetches the old URL from production and refuses to run unless the site is
 * already serving it, which is only true when the code is live. Pass
 * --skip-live-check to override, and be sure why.
 *
 * WHY THE CATEGORIES ARE RENAMED AT ALL
 *
 * The five categories each sorted by a different logic: scope of practice,
 * brand name, modality, health domain, and physical place. No consistent label
 * could be found for the first slot because the row itself was incoherent.
 * They now sort by format, meaning what kind of commitment a patient makes,
 * which is scope-neutral.
 *
 * "Primary Care" also had to go on its own merits. Curate does not provide
 * OHIP primary care and the label drew the wrong traffic. CH-027 proposed
 * "Rehabilitation" instead, which the restructure brief overrode: it
 * pigeonholes naturopathy and psychotherapy, neither of which is rehab.
 *
 * NOT IN THIS SCRIPT
 *
 * Mental Health stays exactly as it is. The brief dissolves it and points
 * /services/mental-health at a /help-with/mental-health page, and Frank
 * deferred that whole idea on 2026-09-08. Moving its remaining children out
 * would leave a live hub with nothing in it.
 *
 * The orphaned lifestyle-medicine branch is a separate step.
 */

const { mutate, query } = require("./lib/sanity-cli");

const RENAMES = [
  {
    from: "rehab",
    to: "one-on-one-care",
    title: "One-on-One Care",
    wasTitle: "Primary Care",
  },
  {
    from: "exercise-therapy",
    to: "movement-and-training",
    title: "Movement and Training",
    wasTitle: "Exercise Therapy",
  },
];

/** Treatments whose category changes. Their URLs are already flat, so nothing moves. */
const REASSIGN = [{ treatment: "psychotherapy", toService: "one-on-one-care" }];

const LIVE = "https://www.curatehealth.ca";
const RULE = "=".repeat(78);

async function assertAliasIsLive() {
  for (const { from } of RENAMES) {
    const url = `${LIVE}/services/${from}`;
    let status;
    try {
      status = (await fetch(url, { redirect: "manual" })).status;
    } catch (error) {
      throw new Error(`Could not reach ${url}: ${error.message}`);
    }

    if (status !== 200) {
      throw new Error(
        `${url} returned ${status}, expected 200.\n` +
          `Either the rename already ran, or something is wrong. Check before forcing.`
      );
    }
  }

  console.log("  old category URLs are live and serving, safe to rename\n");
}

async function main() {
  const apply = process.argv.includes("--apply");
  const skipLiveCheck = process.argv.includes("--skip-live-check");

  console.log(RULE);
  console.log("Renaming service categories");
  console.log(RULE);

  if (!skipLiveCheck) await assertAliasIsLive();

  const mutations = [];

  for (const rename of RENAMES) {
    const service = await query(
      `*[_type == "service" && slug.current == $slug && !(_id in path("drafts.**"))][0]{_id, _rev, title, "slug": slug.current}`,
      { slug: rename.from }
    );

    if (!service) {
      const already = await query(
        `*[_type == "service" && slug.current == $slug][0]{_id, title}`,
        { slug: rename.to }
      );
      if (already) {
        console.log(`  ${rename.from} -> ${rename.to}: already renamed`);
        continue;
      }
      console.error(
        `\nNo service found at "${rename.from}" or "${rename.to}".`
      );
      process.exit(2);
    }

    const clash = await query(
      `*[_type == "service" && slug.current == $slug && _id != $id][0]{_id}`,
      { slug: rename.to, id: service._id }
    );
    if (clash) {
      console.error(`\nSomething else already uses the slug "${rename.to}".`);
      process.exit(2);
    }

    console.log(`  ${service._id}`);
    console.log(
      `    title: ${JSON.stringify(service.title)} -> ${JSON.stringify(rename.title)}`
    );
    console.log(
      `    slug:  /services/${rename.from} -> /services/${rename.to}`
    );
    console.log(`    old URL keeps working, via RENAMED_SERVICE_SLUGS`);

    mutations.push({
      patch: {
        id: service._id,
        ifRevisionID: service._rev,
        set: { title: rename.title, "slug.current": rename.to },
      },
    });
  }

  console.log(`\n${RULE}`);
  console.log("Category reassignments, no URL change");
  console.log(RULE);

  for (const move of REASSIGN) {
    const treatment = await query(
      `*[_type == "treatments" && treatmentSlug.current == $slug && !(_id in path("drafts.**"))][0]{_id, _rev, title, "service": service->slug.current}`,
      { slug: move.treatment }
    );
    if (!treatment) {
      console.error(`\nNo treatment "${move.treatment}".`);
      process.exit(2);
    }

    // The target may still be under its old slug at this point in the run.
    const targetSlug =
      RENAMES.find((r) => r.to === move.toService)?.from ?? move.toService;
    const target = await query(
      `*[_type == "service" && slug.current in $slugs && !(_id in path("drafts.**"))][0]{_id, "slug": slug.current}`,
      { slugs: [move.toService, targetSlug] }
    );
    if (!target) {
      console.error(`\nNo service "${move.toService}".`);
      process.exit(2);
    }

    console.log(
      `  ${treatment.title}: ${treatment.service} -> ${move.toService}`
    );
    console.log(
      `    /services/${move.treatment} is unchanged, only the hub listing moves`
    );

    if (treatment.service !== move.toService) {
      mutations.push({
        patch: {
          id: treatment._id,
          set: { service: { _type: "reference", _ref: target._id } },
        },
      });
    }
  }

  if (!mutations.length) {
    console.log("\nNothing to do.");
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
    `*[_type == "service" && !(_id in path("drafts.**"))]{"slug": slug.current, title} | order(slug asc)`
  );
  console.log("\nCategories now:");
  for (const s of after)
    console.log(`  /services/${String(s.slug).padEnd(24)} ${s.title}`);
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  process.exit(1);
});
