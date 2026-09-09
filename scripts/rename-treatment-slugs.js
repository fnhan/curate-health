/**
 * Renames two treatment slugs and moves Nutritional Counselling into Clinical
 * Care, finishing the Lifestyle Medicine retirement.
 *
 *   node scripts/rename-treatment-slugs.js            dry run
 *   node scripts/rename-treatment-slugs.js --apply    writes
 *
 *   cold-plunge            -> outdoor-cold-plunge
 *   nutritional-counseling -> nutritional-counselling, and into Clinical Care
 *
 * REQUIRES THE ALIAS CODE TO BE LIVE FIRST
 *
 * RENAMED_TREATMENT_SLUGS in lib/service-urls.ts is what keeps the old URLs
 * working after this runs. Without it deployed, both renames strand a live,
 * indexed page on 404. Checked at run time by fetching the old URLs and
 * requiring that they still serve, which is only true while the code is
 * deployed and the rename has not happened yet.
 *
 * WHY THE SPELLING CHANGE IS WORTH A REDIRECT AND COLD PLUNGE IS A JUDGEMENT
 * CALL
 *
 * "counseling" against "counselling" is a content rule: Canadian spelling
 * throughout. The page title and heading say Counselling, so the URL was the
 * odd one out.
 *
 * Cold Plunge is consistency only. Its siblings are outdoor-sauna,
 * outdoor-yoga-therapy and outdoor-pilates, and it was the one without the
 * prefix. Frank was told plainly that words in a URL are a weak ranking signal
 * and that this buys tidiness rather than SEO, and asked for it anyway. Worth
 * recording, because the same request will come up again for other pages and
 * the answer should not drift into "it helps SEO".
 *
 * THE CATEGORY MOVE IS FREE
 *
 * Nutritional Counselling moves from the retired Lifestyle Medicine branch to
 * Clinical Care. Both are flat categories, so its URL shape does not change,
 * only the slug spelling. It also gives the page a home: /services/lifestyle-medicine
 * now redirects away, so without this the page would be live and in no menu.
 */

const { mutate, query } = require("./lib/sanity-cli");

const LIVE = "https://www.curatehealth.ca";
const RULE = "=".repeat(78);

const RENAMES = [
  {
    from: "cold-plunge",
    to: "outdoor-cold-plunge",
    // Nested category, so the old URL carries the category segment.
    oldUrl: "/services/recovery-sanctuary/cold-plunge",
  },
  {
    from: "nutritional-counseling",
    to: "nutritional-counselling",
    oldUrl: "/services/nutritional-counseling",
    title: "Nutritional Counselling",
    toService: "clinical-care",
  },
];

async function assertAliasIsLive() {
  for (const rename of RENAMES) {
    const status = (
      await fetch(`${LIVE}${rename.oldUrl}`, { redirect: "manual" })
    ).status;

    if (status === 200) continue;

    if (status === 301 || status === 308) {
      console.log(
        `  ${rename.oldUrl} already redirects, rename likely applied`
      );
      continue;
    }

    throw new Error(
      `${LIVE}${rename.oldUrl} returned ${status}, expected 200 or a redirect.\n` +
        `A 404 means the alias code is not deployed. Renaming now would strand it.`
    );
  }

  console.log("  old URLs are reachable, safe to rename\n");
}

async function main() {
  const apply = process.argv.includes("--apply");

  console.log(RULE);
  console.log("Treatment slug renames");
  console.log(RULE);

  await assertAliasIsLive();

  const mutations = [];

  for (const rename of RENAMES) {
    const treatment = await query(
      `*[_type == "treatments" && treatmentSlug.current == $slug && !(_id in path("drafts.**"))][0]{_id, _rev, title, "service": service->slug.current}`,
      { slug: rename.from }
    );

    if (!treatment) {
      const already = await query(
        `*[_type == "treatments" && treatmentSlug.current == $slug][0]{title}`,
        { slug: rename.to }
      );
      console.log(`\n  ${rename.from} -> ${rename.to}`);
      console.log(
        already ? "    already renamed" : "    NOT FOUND under either slug"
      );
      if (!already) process.exit(2);
      continue;
    }

    const clash = await query(
      `*[_type == "treatments" && treatmentSlug.current == $slug && _id != $id][0]{_id}`,
      { slug: rename.to, id: treatment._id }
    );
    if (clash) throw new Error(`Slug "${rename.to}" is already taken.`);

    const set = { "treatmentSlug.current": rename.to };

    console.log(`\n  ${JSON.stringify(treatment.title)}`);
    console.log(`    slug: ${rename.from} -> ${rename.to}`);
    console.log(`    old URL ${rename.oldUrl} redirects via the alias`);

    if (rename.title && treatment.title !== rename.title) {
      set.title = rename.title;
      console.log(
        `    title: ${JSON.stringify(treatment.title)} -> ${JSON.stringify(rename.title)}`
      );
    }

    if (rename.toService && treatment.service !== rename.toService) {
      const target = await query(
        `*[_type == "service" && slug.current == $slug && !(_id in path("drafts.**"))][0]{_id}`,
        { slug: rename.toService }
      );
      if (!target) throw new Error(`No service "${rename.toService}".`);

      set.service = { _type: "reference", _ref: target._id };
      console.log(`    category: ${treatment.service} -> ${rename.toService}`);
      console.log(
        `    both are flat categories, so the URL shape is unchanged`
      );
    }

    mutations.push({
      patch: { id: treatment._id, ifRevisionID: treatment._rev, set },
    });
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
    `*[_type == "treatments" && treatmentSlug.current in $slugs && !(_id in path("drafts.**"))]{
      title, "slug": treatmentSlug.current, "service": service->slug.current
     }`,
    { slugs: RENAMES.map((r) => r.to) }
  );
  console.log("\nVerified in the dataset:");
  for (const t of after) {
    console.log(
      `  ${String(t.slug).padEnd(24)} ${t.service.padEnd(20)} ${JSON.stringify(t.title)}`
    );
  }
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  process.exit(1);
});
