/**
 * Puts the six derived share cards back on their fallback. Frank, 2026-10-28.
 *
 *   node scripts/unfreeze-share-images.js
 *   node scripts/unfreeze-share-images.js --apply
 *
 * THIS UNDOES scripts/fill-social-meta-fields.js, AND THAT SCRIPT WAS WRONG
 *
 * Two days earlier six documents could not be published, because every
 * socialMeta field was `Rule.required().error()` and Sanity refuses Publish on
 * an error. The fix was to fill them with whatever each page was already
 * rendering, which unblocked the Studio and changed nothing a visitor saw.
 *
 * It was still the wrong fix. The pages that reach the fallback are exactly
 * the ones whose card is DERIVED from something else, so writing today's value
 * into the field freezes it and the card stops following the thing it was
 * meant to follow:
 *
 *   /blog          the newest post's photograph
 *   a blog post    its own photograph
 *   /about         its own hero
 *   /products      its own hero
 *   /classes       the schedule's hero, or the Recovery Sanctuary's
 *
 * Frank named /blog: "use the newest post and not have it fixed on the chard
 * photo. Just simply make it so that studio doesn't require the field to be a
 * requirement to publish." The second half is the real fix and it is in
 * `sanity/schemas/socialMeta.ts`, where both share images are warnings now.
 *
 * **All six are reverted, not only /blog**, because the same reasoning covers
 * all of them and CLAUDE.md already says so: /about's field was deliberately
 * CLEARED on 2026-10-12 so the card could not drift from the hero, and the
 * every-page rule is "default the image to a photo the page already shows, so
 * nobody has to remember to pick one".
 *
 * **`/products`'s socialMeta.description is kept.** It is text with a static
 * fallback rather than a derived picture, nothing about it can drift, and the
 * title and description fields are still required.
 *
 * It refuses to unset an image that is not the one the fill script wrote, so a
 * picture an editor has since chosen in the Studio is never thrown away.
 */
const { mutate, query } = require("./lib/sanity-cli");

const APPLY = process.argv.includes("--apply");

/** What fill-social-meta-fields.js wrote, so only that is taken back out. */
const PAGES = [
  {
    id: "aboutIndexPage",
    label: "/about",
    asset: "image-6dfb6e8c7b46336c007db415d1a447f197213e83-2920x3073-jpg",
    falls_back_to: "its own hero",
  },
  {
    id: "633fb86b-be95-4506-a044-0265d3846e93",
    label: "/blog",
    asset: "image-2e76b8bd3f2ef0ccd18eefd28ce6e9a04f928d34-1500x1000-jpg",
    falls_back_to: "the newest post's photograph",
  },
  {
    id: "classSchedule",
    label: "/classes",
    asset: "image-ee230e7ba114b5beea8abf2bafb82abef4342f2e-2601x1611-jpg",
    falls_back_to: "the schedule's hero",
  },
  {
    id: "aca9cf1c-45e0-4d98-b9dc-df48cc4a372d",
    label: "/blog/curate-health-on-diet-and-exercise",
    asset: "image-2e76b8bd3f2ef0ccd18eefd28ce6e9a04f928d34-1500x1000-jpg",
    falls_back_to: "its own photograph",
  },
  {
    id: "4ab39129-774a-4167-b889-9d6441d13725",
    label: "/blog/joints-in-motion-prioritizing-joint-health-for-lifelong-mobility",
    asset: "image-de42a6de4688bc94520aebc2291dfbc96e2fb029-2400x1500-jpg",
    falls_back_to: "its own photograph",
  },
  {
    id: "productsPage",
    label: "/products",
    asset: "image-a4de12a2be84aa7ced8692ffa53803d80b282aca-2400x1500-jpg",
    falls_back_to: "its own hero",
  },
];

(async () => {
  const problems = [];
  const patches = [];

  for (const page of PAGES) {
    const doc = await query(
      `*[_id == $id][0]{
        _id, _rev,
        "ogRef": seo.socialMeta.ogImage.asset._ref,
        "twRef": seo.socialMeta.twitterImage.asset._ref
      }`,
      { id: page.id }
    );

    if (!doc) {
      problems.push(`${page.label} (${page.id}) is missing`);
      continue;
    }

    const unset = [];
    const skipped = [];

    for (const [field, ref] of [
      ["ogImage", doc.ogRef],
      ["twitterImage", doc.twRef],
    ]) {
      if (!ref) {
        skipped.push(`${field} is already empty`);
      } else if (ref !== page.asset) {
        // Somebody has chosen a picture since. Never throw that away.
        problems.push(
          `${page.label} ${field} holds ${ref}, not the value this script wrote`
        );
      } else {
        unset.push(`seo.socialMeta.${field}`);
      }
    }

    console.log();
    console.log(`  ${page.label}`);
    unset.forEach((path) => console.log(`    unset  ${path}`));
    skipped.forEach((note) => console.log(`    skip   ${note}`));
    if (unset.length) {
      console.log(`    then   the card follows ${page.falls_back_to}`);
      patches.push({
        patch: { id: doc._id, ifRevisionID: doc._rev, unset },
      });
    } else if (!skipped.length) {
      console.log("    nothing to do");
    }
  }

  console.log();

  if (problems.length) {
    console.error("  REFUSED, nothing written:");
    problems.forEach((p) => console.error(`    ${p}`));
    process.exitCode = 1;
    return;
  }

  if (patches.length === 0) {
    console.log("  Every one is already on its fallback. Nothing to do.");
    return;
  }

  if (!APPLY) {
    console.log(`  Dry run. ${patches.length} document(s) would change.`);
    console.log("  Re-run with --apply.");
    return;
  }

  const result = await mutate(patches);
  console.log(`  Applied. Transaction ${result.transactionId}.`);

  console.log();
  for (const page of PAGES) {
    const after = await query(
      `*[_id == $id][0]{
        "og": seo.socialMeta.ogImage.asset._ref,
        "tw": seo.socialMeta.twitterImage.asset._ref
      }`,
      { id: page.id }
    );
    const clear = !after.og && !after.tw;
    console.log(`  Reading back: ${clear ? "empty" : "STILL SET"}  ${page.label}`);
    if (!clear) console.log(`    ${JSON.stringify(after)}`);
  }
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exitCode = 1;
});
