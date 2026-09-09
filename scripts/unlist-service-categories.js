/**
 * Removes Curate Lifestyle and Mental Health from the service listings.
 *
 *   node scripts/unlist-service-categories.js            dry run
 *   node scripts/unlist-service-categories.js --apply    writes
 *
 * Frank asked on 2026-09-08 for both to come off the homepage "Our Services"
 * section and off /services. Mental Health is to be unpublished but kept, for
 * when /help-with/mental-health is built.
 *
 * ONE FLAG, THREE PLACES
 *
 * The sidebar nav, the homepage section and the /services page all read
 * services through queries that filter `isActive == true`:
 * ALL_SERVICES_QUERY, SERVICES_SECTION_QUERY and SERVICES_PAGE_QUERY. Setting
 * the flag false removes each category from all three at once, so this is a
 * content change and needs no code.
 *
 * Curate Lifestyle is a program, not a service. It was appearing in both the
 * services grid and the programs section, which is the duplication the
 * restructure exists to remove.
 *
 * THE PAGES STAY LIVE
 *
 * SERVICE_BY_SLUG_QUERY does not filter on isActive, so /services/curate-lifestyle
 * and /services/mental-health keep serving. That is deliberate for both.
 * Curate Lifestyle is still reached from the programs section. Mental Health
 * is indexed, and 404ing it would throw away whatever ranking it holds before
 * there is anywhere better to send it.
 *
 * WHAT THIS LEAVES BEHIND, KNOWINGLY
 *
 * Breathwork and Meditation sit under Mental Health. Once it is unlisted they
 * are reachable at /services/breathwork and /services/meditation but appear in
 * no menu, which makes them orphans in the CH-010 sense. The restructure brief
 * moves both under Recovery Sanctuary, which is where they belong and which
 * gives them a home again. That move changes their canonical URL, so it waits
 * for the canonical redirect rule in #209 rather than creating a second pair
 * of duplicate addresses.
 */

const { mutate, query } = require("./lib/sanity-cli");

const UNLIST = [
  {
    slug: "curate-lifestyle",
    why: "a program, not a service. Lives in the programs section.",
  },
  {
    slug: "mental-health",
    why: "unpublished, kept for /help-with/mental-health later.",
  },
];

const RULE = "=".repeat(78);

async function main() {
  const apply = process.argv.includes("--apply");

  console.log(RULE);
  console.log("Unlisting service categories");
  console.log(RULE);

  const mutations = [];

  for (const target of UNLIST) {
    const service = await query(
      `*[_type == "service" && slug.current == $slug && !(_id in path("drafts.**"))][0]{_id, _rev, title, isActive}`,
      { slug: target.slug }
    );

    if (!service) {
      console.error(`\nNo service with slug "${target.slug}".`);
      process.exit(2);
    }

    const children = await query(
      `*[_type == "treatments" && service->slug.current == $slug && isActive == true && !(_id in path("drafts.**"))]{"slug": treatmentSlug.current, title}`,
      { slug: target.slug }
    );

    console.log(`\n  ${service.title}  (/services/${target.slug})`);
    console.log(`    ${target.why}`);
    console.log(`    isActive ${service.isActive} -> false`);
    console.log(`    page keeps serving, it is only removed from the listings`);

    if (children.length) {
      console.log(
        `    ORPHANS THIS: ${children.length} treatment(s) lose their menu entry`
      );
      for (const child of children) {
        console.log(
          `      /services/${child.slug}  ${JSON.stringify(child.title)}`
        );
      }
    }

    if (service.isActive === false) {
      console.log("    already unlisted, nothing to do");
      continue;
    }

    mutations.push({
      patch: {
        id: service._id,
        ifRevisionID: service._rev,
        set: { isActive: false },
      },
    });
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
    `*[_type == "service" && !(_id in path("drafts.**"))]{"slug": slug.current, title, isActive} | order(slug asc)`
  );
  console.log("\nCategories, listed ones marked:");
  for (const s of after) {
    console.log(
      `  ${s.isActive ? "listed  " : "unlisted"}  /services/${String(s.slug).padEnd(24)} ${s.title}`
    );
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
