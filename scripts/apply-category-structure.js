/**
 * The structure pass: rename Clinical Care, move two treatments, set the
 * display order Frank specified.
 *
 *   node scripts/apply-category-structure.js            dry run
 *   node scripts/apply-category-structure.js --apply    writes
 *
 * All from Frank on 2026-09-08 and 2026-09-09.
 *
 * REQUIRES THE ALIAS AND THE ORDERING CODE TO BE LIVE FIRST
 *
 * Two dependencies, both checked at run time rather than assumed:
 *
 *   RENAMED_SERVICE_SLUGS must already map one-on-one-care to clinical-care,
 *   or renaming the slug takes a live category hub to 404. Verified by
 *   fetching the old URL from production and requiring a 200, which is only
 *   true while the code is deployed and the rename has not run yet.
 *
 *   The canonical redirect rule from #209 must be live before Breathwork and
 *   Meditation change category, because that move changes their canonical URL
 *   from flat to nested. Without it both the old and new URLs would serve, and
 *   that duplicate is exactly what #209 closes.
 *
 * WHAT MOVES, AND WHAT THAT DOES TO URLS
 *
 * Breathwork and Meditation move from Mental Health to Recovery Sanctuary.
 * Recovery Sanctuary is the one category whose children stay nested, so their
 * canonical URL changes:
 *
 *   /services/breathwork -> /services/recovery-sanctuary/breathwork
 *
 * No redirect is written for that. The canonical rule handles it: the old URL
 * stops being canonical the moment the category changes and starts redirecting
 * itself. That was the point of taking the category out of child URLs.
 *
 * It also gives them a home. Unlisting Mental Health left both reachable but
 * absent from every menu, which is the orphan problem CH-010 tracks.
 *
 * COLD PLUNGE IS RETITLED, NOT RESLUGGED
 *
 * Frank asked for "Outdoor Cold Plunge". That changes the display title. The
 * slug stays cold-plunge, so /services/recovery-sanctuary/cold-plunge keeps
 * working untouched. Renaming the slug to match would change a live indexed
 * URL, which he did not ask for, and doing that uninstructed is the mistake
 * the acupuncture slug already taught this project once.
 */

const { mutate, query } = require("./lib/sanity-cli");

const LIVE = "https://www.curatehealth.ca";
const RULE = "=".repeat(78);

const RENAME_SERVICE = {
  from: "one-on-one-care",
  to: "clinical-care",
  title: "Clinical Care",
};

/** Treatments changing category. Their canonical URL changes with them. */
const MOVE = [
  { treatment: "breathwork", toService: "recovery-sanctuary" },
  { treatment: "meditation", toService: "recovery-sanctuary" },
];

/** Display title changes on treatments. Slugs are untouched. */
const RETITLE = [{ treatment: "cold-plunge", title: "Outdoor Cold Plunge" }];

/**
 * Display title changes on categories. Slugs are untouched here too.
 *
 * "Movement & Training" is shorter than "Movement and Training", which is the
 * longest label in the sidebar and the one that was wrapping onto two lines.
 * The slug stays movement-and-training, so /services/movement-and-training
 * keeps working. An ampersand in a URL would have to be encoded anyway.
 */
const RETITLE_SERVICE = [
  { service: "movement-and-training", title: "Movement & Training" },
];

/** Frank's order, per category. Lowest first. */
const ORDER = {
  "clinical-care": [
    "acupuncture",
    "chiropractic-care",
    "massage-therapy",
    "naturopathy",
    "physiotherapy",
    "psychotherapy",
  ],
  // Frank revised this on 2026-09-09. It was fitness, exercise rehab,
  // performance; it is now exercise rehab first.
  "movement-and-training": [
    "exercise-rehab",
    "fitness-training",
    "performance-training",
  ],
  "recovery-sanctuary": [
    "flowpresso-therapy",
    "outdoor-sauna",
    "cold-plunge",
    "outdoor-yoga-therapy",
    "outdoor-pilates",
    "meditation",
    "breathwork",
  ],
};

async function assertPreconditions() {
  // Before the rename the old hub serves 200. After it, the alias redirects.
  // Either answer proves the alias code is deployed, which is the thing that
  // actually matters. A 404 means it is not, and renaming would strand the
  // old URL.
  const oldHub = `${LIVE}/services/${RENAME_SERVICE.from}`;
  const hubStatus = (await fetch(oldHub, { redirect: "manual" })).status;
  if (![200, 301, 308].includes(hubStatus)) {
    throw new Error(
      `${oldHub} returned ${hubStatus}. It should serve, or redirect to the\n` +
        `new slug. A 404 means the alias code is not deployed.`
    );
  }

  // If the canonical rule is live, a treatment requested under the wrong
  // category redirects rather than serving. Cold Plunge is nested, so asking
  // for it flat must not return 200.
  const flat = `${LIVE}/services/cold-plunge`;
  const flatStatus = (await fetch(flat, { redirect: "manual" })).status;
  if (flatStatus === 200) {
    throw new Error(
      `${flat} returned 200. The canonical redirect rule is not live.\n` +
        `Moving treatments now would leave each at two working URLs.`
    );
  }

  console.log(
    `  old hub serves (${hubStatus}), canonical rule live (${flatStatus} on a non-canonical URL)\n`
  );
}

async function main() {
  const apply = process.argv.includes("--apply");

  console.log(RULE);
  console.log("Category structure pass");
  console.log(RULE);

  await assertPreconditions();

  const mutations = [];

  // 1. Rename the category.
  console.log("CATEGORY RENAME");

  const service = await query(
    `*[_type == "service" && slug.current == $slug && !(_id in path("drafts.**"))][0]{_id, _rev, title}`,
    { slug: RENAME_SERVICE.from }
  );

  if (service) {
    const clash = await query(
      `*[_type == "service" && slug.current == $slug && _id != $id][0]{_id}`,
      { slug: RENAME_SERVICE.to, id: service._id }
    );
    if (clash) throw new Error(`Slug "${RENAME_SERVICE.to}" is already taken.`);

    console.log(
      `  ${JSON.stringify(service.title)} -> ${JSON.stringify(RENAME_SERVICE.title)}`
    );
    console.log(
      `  /services/${RENAME_SERVICE.from} -> /services/${RENAME_SERVICE.to}`
    );
    console.log(`  old URL redirects via the alias, no gap`);

    mutations.push({
      patch: {
        id: service._id,
        ifRevisionID: service._rev,
        set: { title: RENAME_SERVICE.title, "slug.current": RENAME_SERVICE.to },
      },
    });
  } else {
    // Already renamed. Re-running this script has to be safe, since the
    // sections below it are edited as further changes come in.
    const renamed = await query(
      `*[_type == "service" && slug.current == $slug && !(_id in path("drafts.**"))][0]{_id, title}`,
      { slug: RENAME_SERVICE.to }
    );
    if (!renamed) {
      throw new Error(
        `No service at "${RENAME_SERVICE.from}" or "${RENAME_SERVICE.to}".`
      );
    }
    console.log(`  already renamed to ${JSON.stringify(renamed.title)}`);
  }

  // 2. Move treatments between categories.
  console.log(`\nCATEGORY MOVES, these change the URL`);
  for (const move of MOVE) {
    const treatment = await query(
      `*[_type == "treatments" && treatmentSlug.current == $slug && !(_id in path("drafts.**"))][0]{_id, title, "service": service->slug.current}`,
      { slug: move.treatment }
    );
    if (!treatment) throw new Error(`No treatment "${move.treatment}".`);

    const target = await query(
      `*[_type == "service" && slug.current == $slug && !(_id in path("drafts.**"))][0]{_id}`,
      { slug: move.toService }
    );
    if (!target) throw new Error(`No service "${move.toService}".`);

    console.log(
      `  ${treatment.title}: ${treatment.service} -> ${move.toService}`
    );
    console.log(
      `    /services/${move.treatment} -> /services/${move.toService}/${move.treatment}`
    );
    console.log(`    old URL redirects itself, no entry needed`);

    if (treatment.service !== move.toService) {
      mutations.push({
        patch: {
          id: treatment._id,
          set: { service: { _type: "reference", _ref: target._id } },
        },
      });
    }
  }

  // 3. Retitle, without touching slugs.
  console.log(`\nRETITLES, slug untouched`);
  for (const item of RETITLE) {
    const treatment = await query(
      `*[_type == "treatments" && treatmentSlug.current == $slug && !(_id in path("drafts.**"))][0]{_id, _rev, title}`,
      { slug: item.treatment }
    );
    if (!treatment) throw new Error(`No treatment "${item.treatment}".`);

    console.log(
      `  ${JSON.stringify(treatment.title)} -> ${JSON.stringify(item.title)}`
    );
    console.log(`    /services/recovery-sanctuary/${item.treatment} unchanged`);

    if (treatment.title !== item.title) {
      mutations.push({
        patch: { id: treatment._id, set: { title: item.title } },
      });
    }
  }

  for (const item of RETITLE_SERVICE) {
    const category = await query(
      `*[_type == "service" && slug.current == $slug && !(_id in path("drafts.**"))][0]{_id, title}`,
      { slug: item.service }
    );
    if (!category) throw new Error(`No service "${item.service}".`);

    console.log(
      `  ${JSON.stringify(category.title)} -> ${JSON.stringify(item.title)}`
    );
    console.log(`    /services/${item.service} unchanged`);

    if (category.title !== item.title) {
      mutations.push({
        patch: { id: category._id, set: { title: item.title } },
      });
    }
  }

  // 4. Display order.
  console.log(`\nDISPLAY ORDER`);
  for (const [serviceSlug, slugs] of Object.entries(ORDER)) {
    console.log(`  ${serviceSlug}`);
    for (let i = 0; i < slugs.length; i++) {
      const slug = slugs[i];
      const treatment = await query(
        `*[_type == "treatments" && treatmentSlug.current == $slug && !(_id in path("drafts.**"))][0]{_id, title, displayOrder}`,
        { slug }
      );
      if (!treatment) throw new Error(`No treatment "${slug}".`);

      const order = i + 1;
      console.log(`    ${order}. ${String(treatment.title).trim()}`);

      if (treatment.displayOrder !== order) {
        mutations.push({
          patch: { id: treatment._id, set: { displayOrder: order } },
        });
      }
    }
  }

  console.log(`\n${RULE}`);

  if (!mutations.length) {
    console.log("Nothing to do.");
    return;
  }

  if (!apply) {
    console.log(
      `Dry run. ${mutations.length} patch(es) prepared, nothing written.`
    );
    return;
  }

  const result = await mutate(mutations);
  console.log(`Applied. Transaction ${result.transactionId}`);

  const after = await query(
    `*[_type == "service" && isActive == true && !(_id in path("drafts.**"))]{
      "slug": slug.current, title,
      "treatments": *[_type=="treatments" && service._ref == ^._id && isActive == true]
        | order(coalesce(displayOrder, 9999) asc, title asc){ "slug": treatmentSlug.current, displayOrder }
     } | order(slug asc)`
  );
  console.log("\nVerified in the dataset:");
  for (const s of after) {
    console.log(`  /services/${s.slug}  ${s.title}`);
    for (const t of s.treatments) {
      console.log(`      ${t.displayOrder ?? "-"}  ${t.slug}`);
    }
  }
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  process.exit(1);
});
