/**
 * The order the Connect column reads in. CH-008 follow-up.
 *
 *   node scripts/order-social-links.js           # dry run, writes nothing
 *   node scripts/order-social-links.js --apply
 *
 * The footer renders socialMedia in stored order, and stored order was the
 * order the entries happened to be added: LinkedIn, Instagram, TikTok,
 * Facebook, Instagram (Cafe). That split the two Instagram accounts to opposite
 * ends of the list, which is the one pairing a reader needs to see together.
 *
 * Frank picked this order on 2026-09-12: the two businesses first, then the
 * rest. It is ordinary editorial ordering, so the array stays drag-sortable in
 * the Studio and this script only sets the starting point.
 *
 * Matched on url, which is the stable handle. Entries this script does not
 * name keep their relative order and sit after the ones it does, so adding a
 * platform later does not need this file changed.
 */

const { mutate, query } = require("./lib/sanity-cli");

const APPLY = process.argv.includes("--apply");

const ORDER = [
  "https://www.instagram.com/curatehealth.ca/",
  "https://www.instagram.com/curate.cafe/",
  "https://www.tiktok.com/@curatehealth.ca",
  "https://www.facebook.com/people/Curate-Health/61558820134153/",
  "https://www.linkedin.com/company/curatehealthclinic/",
];

const SURVEY = `*[_type == "siteSettings"][0]{
  _id, _rev,
  socialMedia[]{_key, _type, platform, label, url, isActive, entity}
}`;

async function main() {
  const site = await query(SURVEY);
  if (!site) throw new Error("No siteSettings document found.");

  const current = site.socialMedia ?? [];
  if (!current.length) {
    console.log("No social links stored.");
    return;
  }

  const rank = (link) => {
    const i = ORDER.indexOf(link.url);
    return i === -1 ? ORDER.length : i;
  };

  const sorted = [...current].sort((a, b) => rank(a) - rank(b));

  const show = (list) => list.map((l) => l.label || l.platform).join(" -> ");

  console.log(`siteSettings ${site._id} rev ${site._rev}\n`);
  console.log("now:   " + show(current));
  console.log("after: " + show(sorted));

  if (show(current) === show(sorted)) {
    console.log("\nAlready in this order. Nothing to do.");
    return;
  }

  // The whole array is replaced rather than moved item by item, because a
  // sequence of Sanity insert operations has to reason about positions that
  // shift under it. Every field on every entry is carried across untouched,
  // _key included, so nothing is recreated and no reference breaks.
  const mutations = [
    {
      patch: {
        id: site._id,
        ifRevisionID: site._rev,
        set: { socialMedia: sorted },
      },
    },
  ];

  if (!APPLY) {
    console.log("\nDry run. Re-run with --apply to write.");
    return;
  }

  const result = await mutate(mutations);
  console.log(`\nApplied. Transaction ${result.transactionId}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 2;
});
