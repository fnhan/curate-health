/**
 * Clears four share images that were smaller than the card they filled.
 *
 *   node scripts/clear-undersized-share-images.js
 *   node scripts/clear-undersized-share-images.js --apply
 *
 * FOUND BY GIVING THE AUDIT THE SOURCE DIMENSIONS, 2026-10-28
 *
 * A share card is 1200x630. Sanity will happily scale anything up to fill it,
 * so a picture chosen in the Studio passed every check that existed: the tag
 * was there, the file loaded, and an editor had made a choice. Reading the
 * source size out of the filename showed what was actually being served.
 *
 * **The three legal pages were sharing the 180x180 favicon**, below the
 * 200x200 Facebook and LinkedIn will accept at all, so those links rendered
 * with no picture. /our-programs was sharing a 352x344 logo while its own
 * hero, which the page opens on, is 4096x2733.
 *
 * Clearing the field is the whole fix, because the fallback is now better than
 * what it was shadowing. That is only true since 2026-10-28, when both share
 * images became optional and every route gained a fallback:
 *
 *   /legal/*        the house card, 2920x3073
 *   /our-programs   its own hero, 4096x2733
 *
 * **The five left alone are left alone deliberately.** Ariel Zohar's portrait
 * at 1001x685 is the known photograph CH-104 wants replaced, and three product
 * cutouts are 418x400 to 600x600 with nothing larger behind them, so clearing
 * those would swap a small picture of the product for a large picture of the
 * logo, which is worse. They need better source art, which is Frank's.
 */
const { mutate, query } = require("./lib/sanity-cli");

const APPLY = process.argv.includes("--apply");

/** The asset each document holds today, so a changed one fails the run. */
const TARGETS = [
  {
    type: "legalPage",
    expect: "180x180",
    falls_back_to: "the house card, 2920x3073",
  },
  {
    type: "ourPrograms",
    expect: "352x344",
    falls_back_to: "its own hero, 4096x2733",
  },
];

const dimensions = (url) => {
  const match = (url || "").match(/-(\d+x\d+)\./);
  return match ? match[1] : null;
};

(async () => {
  const problems = [];
  const patches = [];

  for (const target of TARGETS) {
    const docs = await query(
      `*[_type == $type && defined(seo.socialMeta.ogImage.asset)]{
        _id, _rev,
        "name": coalesce(title, name, _id),
        "og": seo.socialMeta.ogImage.asset->url,
        "tw": seo.socialMeta.twitterImage.asset->url
      }`,
      { type: target.type }
    );

    if (!docs.length) {
      problems.push(`${target.type}: nothing to clear, already done?`);
      continue;
    }

    for (const doc of docs) {
      const size = dimensions(doc.og);
      if (size !== target.expect) {
        problems.push(
          `${target.type} ${doc.name}: share image is ${size}, expected ${target.expect}`
        );
        continue;
      }

      const unset = ["seo.socialMeta.ogImage"];
      if (doc.tw) unset.push("seo.socialMeta.twitterImage");

      console.log();
      console.log(`  ${target.type}  ${doc.name}`);
      console.log(`    was    ${size}, upscaled to fill a 1200x630 card`);
      console.log(`    now    ${target.falls_back_to}`);

      patches.push({ patch: { id: doc._id, ifRevisionID: doc._rev, unset } });
    }
  }

  console.log();

  if (problems.length) {
    console.error("  REFUSED, nothing written:");
    problems.forEach((p) => console.error(`    ${p}`));
    process.exitCode = 1;
    return;
  }

  if (!patches.length) {
    console.log("  Nothing to do.");
    return;
  }

  if (!APPLY) {
    console.log(`  Dry run. ${patches.length} document(s) would change.`);
    console.log("  Re-run with --apply.");
    return;
  }

  const result = await mutate(patches);
  console.log(`  Applied. Transaction ${result.transactionId}.`);

  const after = await query(
    `*[_type in ["legalPage", "ourPrograms"]]{
      "name": coalesce(title, name, _id),
      "og": seo.socialMeta.ogImage.asset->url
    }`
  );
  console.log();
  after.forEach((d) =>
    console.log(`  Reading back: ${d.og ? "STILL SET" : "empty    "}  ${d.name}`)
  );
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exitCode = 1;
});
