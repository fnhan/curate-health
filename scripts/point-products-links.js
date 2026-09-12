/**
 * Points the Products links at the products page. CH-010.
 *
 *   node scripts/point-products-links.js           # dry run, writes nothing
 *   node scripts/point-products-links.js --apply
 *
 * WHY THE FIVE PRODUCT PAGES WERE ORPHANED
 *
 * Not because nothing linked to them. Because the two things that looked like
 * links to them were not: the Products entry in the main navigation and the
 * Products entry in the footer both pointed at /#products, an anchor to a
 * carousel on the homepage. So a crawler following either one arrived back at
 * the homepage, and the product pages sat outside three hops from it.
 *
 * Building /products does not fix that on its own. Repointing these two is the
 * change that actually connects them, which is why it is in the same ticket.
 *
 * Patches carry ifRevisionID. Re-runnable: it reports what already points at
 * the right place and writes only what does not.
 */

const { mutate, query } = require("./lib/sanity-cli");

const APPLY = process.argv.includes("--apply");

const FROM = "/#products";
const TO = "/products";

const SURVEY = `*[_type == "siteSettings"][0]{
  _id, _rev,
  navLinks[]{_key, title, href},
  footerNavLinks[]{_key, groupTitle, links[]{_key, title, slug}}
}`;

async function main() {
  const site = await query(SURVEY);
  if (!site) throw new Error("No siteSettings document found.");

  console.log(`siteSettings ${site._id} rev ${site._rev}\n`);

  const mutations = [];

  for (const link of site.navLinks ?? []) {
    if (!/product/i.test(link.title ?? "")) continue;
    console.log(`nav    "${link.title}"  ${link.href}`);
    if (link.href === TO) {
      console.log("       already correct");
      continue;
    }
    if (link.href !== FROM) {
      console.log(`       unexpected target, leaving alone`);
      continue;
    }
    console.log(`       -> ${TO}`);
    mutations.push({
      patch: {
        id: site._id,
        set: { [`navLinks[_key=="${link._key}"].href`]: TO },
      },
    });
  }

  // The footer stores its targets as slug objects rather than plain strings,
  // so the shape written here is not the same as the nav's.
  for (const group of site.footerNavLinks ?? []) {
    for (const link of group.links ?? []) {
      if (!/product/i.test(link.title ?? "")) continue;
      const current = link.slug?.current;
      console.log(`footer "${link.title}" in ${group.groupTitle}  ${current}`);
      if (current === TO) {
        console.log("       already correct");
        continue;
      }
      if (current !== FROM) {
        console.log("       unexpected target, leaving alone");
        continue;
      }
      console.log(`       -> ${TO}`);
      mutations.push({
        patch: {
          id: site._id,
          set: {
            [`footerNavLinks[_key=="${group._key}"].links[_key=="${link._key}"].slug.current`]:
              TO,
          },
        },
      });
    }
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

  // Sanity reports a patch whose path matched nothing as applied, so read it
  // back rather than trusting the transaction id.
  const after = await query(SURVEY);
  const stillWrong = [
    ...(after.navLinks ?? [])
      .filter((l) => /product/i.test(l.title ?? "") && l.href === FROM)
      .map((l) => `nav "${l.title}"`),
    ...(after.footerNavLinks ?? []).flatMap((g) =>
      (g.links ?? [])
        .filter(
          (l) => /product/i.test(l.title ?? "") && l.slug?.current === FROM
        )
        .map((l) => `footer "${l.title}"`)
    ),
  ];

  if (stillWrong.length) {
    console.error("\nWrote, but these still point at the anchor:");
    stillWrong.forEach((s) => console.error("  " + s));
    process.exitCode = 1;
    return;
  }

  console.log("Verified: both links point at /products.");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 2;
});
