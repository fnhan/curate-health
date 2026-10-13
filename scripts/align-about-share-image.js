/**
 * Make /about's share card its own hero photograph.
 *
 *   node scripts/align-about-share-image.js            # dry run
 *   node scripts/align-about-share-image.js --apply
 *
 * Frank asked on 2026-10-12 for the share image to be the same photograph as
 * the hero, the Curate Health logo embossed into cork yoga mats.
 *
 * WHY THIS CLEARS A FIELD RATHER THAN SETTING ONE
 *
 * `seo.socialMeta.ogImage` held a different picture, the logo in cork lettering
 * on the wall above the waiting area, with its own crop and hotspot. Pointing
 * it at the hero asset instead would work today and drift the moment somebody
 * changed the hero in the Studio without remembering this field. Emptying it
 * makes the page fall through to `buildPageMetadata`'s `image` option, which
 * app/about/page.tsx now passes the hero, so the two cannot disagree again.
 *
 * That is also the every-page rule in CLAUDE.md: default the share image to a
 * photo the page already shows, so nobody has to remember to pick one.
 *
 * `twitterImage` goes with it, otherwise X would still show the wall photo.
 * The share title and description are Frank's and are left alone.
 *
 * The old values are printed before they go, so they can be put back by hand.
 */

const { query, mutate } = require("./lib/sanity-cli");

async function main() {
  const apply = process.argv.includes("--apply");
  const docs = await query(
    `*[_type == "aboutIndexPage"]{_id, _rev, "sm": seo.socialMeta,
       "heroFile": heroImage.asset->originalFilename}`
  );

  const mutations = [];
  for (const d of docs) {
    const fields = ["ogImage", "twitterImage"].filter((f) => d.sm && d.sm[f]);
    if (!fields.length) {
      console.log(`${d._id}: already falls through to the hero`);
      continue;
    }
    console.log(`${d._id}${d._id.startsWith("drafts.") ? "  [DRAFT]" : ""}`);
    console.log(`  hero: ${d.heroFile}`);
    for (const f of fields) {
      console.log(`  clearing seo.socialMeta.${f}`);
      console.log(`    asset: ${d.sm[f].asset?._ref}`);
      console.log(`    alt:   ${d.sm[f].alt}`);
      if (d.sm[f].crop) console.log(`    crop:  ${JSON.stringify(d.sm[f].crop)}`);
      if (d.sm[f].hotspot)
        console.log(`    hotspot: ${JSON.stringify(d.sm[f].hotspot)}`);
    }
    mutations.push({
      patch: {
        id: d._id,
        ifRevisionID: d._rev,
        unset: fields.map((f) => `seo.socialMeta.${f}`),
      },
    });
  }

  if (!mutations.length) return console.log("\nNothing to write.");
  if (!apply) return console.log(`\n${mutations.length} patches. Dry run.`);

  const r = await mutate(mutations);
  console.log(`\nApplied. Transaction ${r.transactionId || "(none)"}`);
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
