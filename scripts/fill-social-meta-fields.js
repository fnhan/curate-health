/**
 * Fills the six documents whose social media fields were empty. Frank,
 * 2026-10-26.
 *
 *   node scripts/fill-social-meta-fields.js
 *   node scripts/fill-social-meta-fields.js --apply
 *
 * WHY THIS BLOCKED HIM, WHICH IS NOT WHAT THE AUDITS WERE WATCHING FOR
 *
 * Every field on `sanity/schemas/socialMeta.ts` is `Rule.required().error()`,
 * and Sanity refuses Publish on an error. So a document with an empty share
 * image could not be published AT ALL: not to change the share image, not to
 * fix a typo three fields away. Frank hit it and asked for them filled, "as I
 * can't publish the page if I need to modify it otherwise".
 *
 * Nothing was wrong with what visitors got. `buildPageMetadata` substitutes a
 * photo the page already shows whenever the Studio has none, which is the
 * every-page rule working as written, so all six pages have been sharing
 * correctly the whole time. The defect was in the Studio, where the editor was
 * locked out of their own document, and an audit reading rendered HTML cannot
 * see it. `audit-seo-fields.js` reads the dataset for this reason and is what
 * found them.
 *
 * SO THIS WRITES WHAT IS ALREADY RENDERING, AND NOTHING ELSE
 *
 * Each asset below was read off the live `og:image` on that page, and each alt
 * off its live `og:image:alt`. Checked against the rendered crop: all six
 * fallbacks produce a plain centred 1200x630 band with no crop and no hotspot
 * stored, so writing the bare asset reference reproduces the same URL byte for
 * byte. `imageEntry` is one function serving both paths, so there is no second
 * code path to disagree.
 *
 * ONE REAL BEHAVIOUR CHANGE, ON /blog
 *
 * Its fallback is "the newest post's photo", so its share card moved whenever
 * a post was published. Filling the field freezes it to the chard photograph
 * that is there today. That is arguably better rather than worse, since a blog
 * index whose card changes under it is not something anybody chose, but it is
 * a change and it is Frank's to redirect in the Studio.
 *
 * Re-running does nothing: every write is skipped when the field already holds
 * something, so an editor's own choice can never be clobbered by this script.
 */
const { mutate, query } = require("./lib/sanity-cli");

const APPLY = process.argv.includes("--apply");

/**
 * Asset and alt per document, both read off the rendered page rather than
 * guessed, so the card does not move.
 */
const PAGES = [
  {
    id: "aboutIndexPage",
    label: "/about",
    asset: "image-6dfb6e8c7b46336c007db415d1a447f197213e83-2920x3073-jpg",
    alt: "The Curate Health logo embossed into cork yoga mats, lit from the side.",
  },
  {
    id: "633fb86b-be95-4506-a044-0265d3846e93",
    label: "/blog",
    asset: "image-2e76b8bd3f2ef0ccd18eefd28ce6e9a04f928d34-1500x1000-jpg",
    alt: "Close-up photo of wet Swiss chard leaves with purple stems and water droplets on dark green foliage.",
  },
  {
    id: "classSchedule",
    label: "/classes",
    asset: "image-ee230e7ba114b5beea8abf2bafb82abef4342f2e-2601x1611-jpg",
    alt: "The outdoor sauna and cold plunge tub beneath a wooden canopy at the Recovery Sanctuary.",
  },
  {
    id: "aca9cf1c-45e0-4d98-b9dc-df48cc4a372d",
    label: "/blog/curate-health-on-diet-and-exercise",
    asset: "image-2e76b8bd3f2ef0ccd18eefd28ce6e9a04f928d34-1500x1000-jpg",
    alt: "Close-up photo of wet Swiss chard leaves with purple stems and water droplets on dark green foliage.",
  },
  {
    id: "4ab39129-774a-4167-b889-9d6441d13725",
    label: "/blog/joints-in-motion-prioritizing-joint-health-for-lifelong-mobility",
    asset: "image-de42a6de4688bc94520aebc2291dfbc96e2fb029-2400x1500-jpg",
    alt: "Black and white photo of a person in a downward dog yoga pose on a mat, with focus on their hands and legs.",
  },
  {
    id: "productsPage",
    label: "/products",
    asset: "image-a4de12a2be84aa7ced8692ffa53803d80b282aca-2400x1500-jpg",
    alt: "A practitioner’s hands supporting a patient’s knee during an assessment",
    /*
     * The only text written here, and it is the page's own meta description,
     * which is what og:description already falls back to. The share title is
     * already filled on this document; the description was the one gap.
     */
    socialDescription:
      "Custom foot orthotics, knee braces, compression stockings, TENS machines and professional grade supplements, fitted at Curate Health in Midtown Toronto.",
  },
];

const DESCRIPTION_LIMIT = 160;

function shareImage(asset, alt) {
  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset },
    alt,
  };
}

(async () => {
  const problems = [];
  const patches = [];

  for (const page of PAGES) {
    const doc = await query(
      `*[_id == $id][0]{
        _id, _rev, _type,
        "ogRef": seo.socialMeta.ogImage.asset._ref,
        "ogAlt": seo.socialMeta.ogImage.alt,
        "twRef": seo.socialMeta.twitterImage.asset._ref,
        "twAlt": seo.socialMeta.twitterImage.alt,
        "socialTitle": seo.socialMeta.title,
        "socialDescription": seo.socialMeta.description
      }`,
      { id: page.id }
    );

    if (!doc) {
      problems.push(`${page.label} (${page.id}) is missing`);
      continue;
    }

    // The asset has to exist, or the reference publishes a broken card.
    const asset = await query(`*[_id == $id][0]{_id, url}`, { id: page.asset });
    if (!asset) {
      problems.push(`${page.label} asset ${page.asset} is not in the dataset`);
      continue;
    }

    if (!doc.socialTitle || !doc.socialTitle.trim()) {
      problems.push(
        `${page.label} has no socialMeta.title and this script does not write one`
      );
      continue;
    }

    const set = {};
    const skipped = [];

    if (doc.ogRef) {
      skipped.push(`ogImage already set to ${doc.ogRef}`);
      // An image that is set but has no alt still blocks Publish on its own.
      if (!doc.ogAlt) set["seo.socialMeta.ogImage.alt"] = page.alt;
    } else {
      set["seo.socialMeta.ogImage"] = shareImage(page.asset, page.alt);
    }

    if (doc.twRef) {
      skipped.push(`twitterImage already set to ${doc.twRef}`);
      if (!doc.twAlt) set["seo.socialMeta.twitterImage.alt"] = page.alt;
    } else {
      set["seo.socialMeta.twitterImage"] = shareImage(page.asset, page.alt);
    }

    if (page.socialDescription) {
      if (page.socialDescription.length > DESCRIPTION_LIMIT) {
        problems.push(
          `${page.label} social description is ${page.socialDescription.length} of ${DESCRIPTION_LIMIT}`
        );
        continue;
      }
      if (doc.socialDescription && doc.socialDescription.trim()) {
        skipped.push("description already set");
      } else {
        set["seo.socialMeta.description"] = page.socialDescription;
      }
    }

    console.log();
    console.log(`  ${page.label}  (${doc._type})`);
    Object.keys(set).forEach((path) => console.log(`    write  ${path}`));
    skipped.forEach((note) => console.log(`    skip   ${note}`));
    if (Object.keys(set).length === 0) {
      console.log("    nothing to do");
      continue;
    }
    console.log(`    alt    "${page.alt}"`);

    patches.push({
      patch: { id: doc._id, ifRevisionID: doc._rev, set },
    });
  }

  console.log();

  if (problems.length) {
    console.error("  REFUSED, nothing written:");
    problems.forEach((p) => console.error(`    ${p}`));
    process.exitCode = 1;
    return;
  }

  if (patches.length === 0) {
    console.log("  Every document is already filled. Nothing to do.");
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
        "ogAlt": seo.socialMeta.ogImage.alt,
        "tw": seo.socialMeta.twitterImage.asset._ref,
        "twAlt": seo.socialMeta.twitterImage.alt,
        "d": seo.socialMeta.description
      }`,
      { id: page.id }
    );
    const ok =
      after.og === page.asset &&
      after.tw === page.asset &&
      after.ogAlt === page.alt &&
      after.twAlt === page.alt &&
      Boolean(after.d && after.d.trim());
    console.log(`  Reading back: ${ok ? "ok  " : "GAP "} ${page.label}`);
    if (!ok) console.log(`    ${JSON.stringify(after)}`);
  }
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exitCode = 1;
});
