/**
 * CH-008 follow-up: the footer labels for the two Instagram accounts.
 *
 *   node scripts/set-social-labels.js           # dry run, writes nothing
 *   node scripts/set-social-labels.js --apply
 *
 * Two Instagram accounts means the same mark appears twice in the footer, so
 * the label has to say which account rather than which network. Frank picked
 * the names on 2026-09-12: "Curate Health" and "Curate Cafe".
 *
 * The label is a separate field from platform on purpose. platform is what
 * chooses the icon, so renaming it to "Curate Cafe" would lose the Instagram
 * mark and fall back to the generic arrow. Everything without a label keeps
 * printing its platform name, which is what the other three do.
 *
 * Re-runnable: it reports what is already set and writes only what is missing.
 */

const { mutate, query } = require("./lib/sanity-cli");

const APPLY = process.argv.includes("--apply");

/** Matched on the stored url, which is the only stable handle on these. */
const LABELS = {
  "https://www.instagram.com/curatehealth.ca/": "Curate Health",
  "https://www.instagram.com/curate.cafe/": "Curate Cafe",
};

const SURVEY = `*[_type == "siteSettings"][0]{
  _id, _rev,
  socialMedia[]{_key, platform, label, url, entity}
}`;

async function main() {
  const site = await query(SURVEY);
  if (!site) throw new Error("No siteSettings document found.");

  console.log(`siteSettings ${site._id} rev ${site._rev}\n`);

  const mutations = [];

  for (const link of site.socialMedia ?? []) {
    const wanted = LABELS[link.url];
    const shows = link.label || link.platform;

    if (!wanted) {
      console.log(
        `  ${String(shows).padEnd(16)} unchanged, prints its platform name`
      );
      continue;
    }

    if (link.label === wanted) {
      console.log(`  ${String(shows).padEnd(16)} already set`);
      continue;
    }

    console.log(`  ${String(shows).padEnd(16)} -> "${wanted}"`);
    mutations.push({
      patch: {
        id: site._id,
        set: { [`socialMedia[_key=="${link._key}"].label`]: wanted },
      },
    });
  }

  if (!mutations.length) {
    console.log("\nNothing to do.");
    return;
  }

  if (!APPLY) {
    console.log(`\nDry run. ${mutations.length} mutation(s) would be sent.`);
    console.log("Re-run with --apply to write.");
    return;
  }

  const result = await mutate(mutations);
  console.log(`\nApplied. Transaction ${result.transactionId}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 2;
});
