/**
 * Applies the page titles, descriptions and share images Frank approved on
 * 2026-09-09.
 *
 *   node scripts/fix-page-metadata.js            dry run
 *   node scripts/fix-page-metadata.js --apply    writes
 *
 * WHAT THIS FIXES
 *
 * Four pages were renamed during the restructure and their SEO titles never
 * followed, so Google was still showing names the site had retired: "Rehab"
 * for Clinical Care, "Exercise Therapy" for Movement & Training, "Cold Plunge"
 * for Outdoor Cold Plunge, and "Counseling" with one L. The heading and the
 * search result disagreed, and the search result is the one people see.
 *
 * Two more had a description belonging to a different service, and two had no
 * seo object at all.
 *
 * TITLES ARE STORED WITHOUT THE BRAND
 *
 * app/layout.tsx appends " | Curate Health" to whatever a page returns. Values
 * here are therefore the bare name. lib/page-metadata.ts also strips a
 * trailing brand at render time, so a value typed with it still renders once,
 * but the stored value should match what renders or the Studio lies about it.
 *
 * SHARE IMAGES
 *
 * Four pages had none. Frank asked for the best existing image from each page
 * rather than new photography. Each was opened and looked at before choosing:
 *
 *   Our Story          The photo of Frank treating a patient, from the
 *                      Chiropractic Origin Story section, not the page hero.
 *                      The hero is an anonymous muscular back, which is
 *                      striking and says nothing about a founder's story
 *                      about a heart condition.
 *   Mission and Values The sunlit forest hero. Generic as stock, but it is the
 *                      page's own image and ties to the sustainability
 *                      section.
 *   Pillars of Health  The water ripples hero. Abstract, which suits an
 *                      abstract subject.
 *   Our Programs       The two people stretching. Human, warm, and obviously
 *                      about the service. The strongest of the four.
 *
 * Alt text is written from the images, same rule as everywhere else: 25 to 125
 * characters, neutral, ends with a full stop.
 */

const { mutate, query } = require("./lib/sanity-cli");

const RULE = "=".repeat(78);

/** Titles and descriptions, by document type and optional slug. */
const COPY = [
  {
    type: "service",
    slug: "clinical-care",
    pageTitle: "Clinical Care Toronto",
  },
  {
    type: "service",
    slug: "movement-and-training",
    pageTitle: "Movement & Training Toronto",
  },
  {
    type: "treatments",
    slug: "outdoor-cold-plunge",
    pageTitle: "Outdoor Cold Plunge Toronto",
  },
  {
    type: "treatments",
    slug: "nutritional-counselling",
    pageTitle: "Nutritional Counselling Toronto",
  },
  {
    type: "treatments",
    slug: "psychotherapy",
    pageTitle: "Psychotherapy Toronto",
    // Was performance training's description, word for word. Someone looking
    // for a therapist was reading about strength and agility. CH-033.
    pageDescription:
      "Psychotherapy at Curate Health in Midtown Toronto. Personalized support for emotional and mental health, with a registered psychotherapist.",
  },
  {
    type: "pillarsOfHealth",
    pageTitle: "Pillars of Health",
    pageDescription:
      "The five pillars behind our approach at Curate Health: physical, mental, emotional, spiritual and social health.",
  },
];

/** Share images, chosen from what each page already uses. */
const IMAGES = [
  {
    type: "ourStory",
    sourcePath: "additionalSections[1].sectionImage.image.asset._ref",
    alt: "Dr. Frank Nhan treating a patient lying on a treatment table in the clinic.",
  },
  {
    type: "missionAndValues",
    sourcePath: "heroSection.heroImage.image.asset._ref",
    alt: "Sunlight through the trunks of a green forest.",
  },
  {
    type: "pillarsOfHealth",
    sourcePath: "heroSection.heroImage.image.asset._ref",
    alt: "Overlapping ripples spreading across the surface of still water.",
  },
  {
    type: "ourPrograms",
    sourcePath: "heroImage.asset._ref",
    alt: "Two people stretching on mats in a bright studio with plants and tall windows.",
  },
];

const BANNED = [
  "journey",
  "dive in",
  "unlock",
  "elevate",
  "harness the power of",
  "complimentary",
  "transformative",
  "seamless",
];

const BRAND = "Curate Health";

function checkCopy(label, value, max) {
  const problems = [];

  if (value.length > max) problems.push(`${value.length} chars, over ${max}`);
  if (/[—–]/.test(value)) problems.push("dash used as punctuation");
  if (/!/.test(value)) problems.push("exclamation mark");
  // Titles only. The layout appends the brand to the title, so a title
  // carrying it renders it twice. Descriptions are not templated, and naming
  // the clinic in one is normal and useful.
  if (label === "title" && value.includes(BRAND)) {
    problems.push(`contains "${BRAND}", which the layout appends already`);
  }
  for (const word of BANNED) {
    if (new RegExp(`\\b${word}`, "i").test(value)) {
      problems.push(`banned word "${word}"`);
    }
  }

  return problems.map((p) => `${label}: ${p}`);
}

function readPath(doc, path) {
  return path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .reduce((node, key) => (node ? node[key] : undefined), doc);
}

async function main() {
  const apply = process.argv.includes("--apply");

  console.log(RULE);
  console.log("Page titles, descriptions and share images");
  console.log(RULE);

  const mutations = [];
  let problems = 0;

  console.log("\nTITLES AND DESCRIPTIONS");

  for (const item of COPY) {
    const filter = item.slug
      ? `_type == $type && coalesce(slug.current, treatmentSlug.current) == $slug`
      : `_type == $type`;

    const doc = await query(
      `*[${filter} && !(_id in path("drafts.**"))][0]{_id, _rev, title, name, "current": seo.pageTitle, "currentDescription": seo.pageDescription}`,
      { type: item.type, slug: item.slug ?? "" }
    );

    if (!doc) {
      console.error(`\n  NOT FOUND: ${item.type} ${item.slug ?? ""}`);
      process.exit(2);
    }

    const set = {};
    const label = doc.title || doc.name || item.type;

    console.log(`\n  ${label}`);

    if (item.pageTitle) {
      const faults = checkCopy("title", item.pageTitle, 60);
      problems += faults.length;
      faults.forEach((f) => console.log(`    PROBLEM ${f}`));

      console.log(`    title was: ${JSON.stringify(doc.current)}`);
      console.log(`    title now: ${JSON.stringify(item.pageTitle)}`);
      console.log(
        `    renders:   ${JSON.stringify(`${item.pageTitle} | ${BRAND}`)}`
      );
      if (doc.current !== item.pageTitle) set["seo.pageTitle"] = item.pageTitle;
    }

    if (item.pageDescription) {
      const faults = checkCopy("description", item.pageDescription, 155);
      problems += faults.length;
      faults.forEach((f) => console.log(`    PROBLEM ${f}`));

      console.log(
        `    description was: ${JSON.stringify((doc.currentDescription || "").slice(0, 80))}`
      );
      console.log(
        `    description now: ${JSON.stringify(item.pageDescription.slice(0, 80))}`
      );
      if (doc.currentDescription !== item.pageDescription) {
        set["seo.pageDescription"] = item.pageDescription;
      }
    }

    if (Object.keys(set).length) {
      mutations.push({ patch: { id: doc._id, set } });
    } else {
      console.log("    already correct");
    }
  }

  console.log(`\n${RULE}`);
  console.log("SHARE IMAGES");

  for (const item of IMAGES) {
    const doc = await query(
      `*[_type == $type && !(_id in path("drafts.**"))][0]`,
      { type: item.type }
    );
    if (!doc) {
      console.error(`\n  NOT FOUND: ${item.type}`);
      process.exit(2);
    }

    const ref = readPath(doc, item.sourcePath);
    if (!ref) {
      console.error(`\n  ${item.type}: no image at ${item.sourcePath}`);
      process.exit(2);
    }

    const faults = checkCopy("alt", item.alt, 125);
    problems += faults.length;

    const existing = doc.seo?.socialMeta?.ogImage?.asset?._ref;

    console.log(`\n  ${item.type}`);
    console.log(`    source:  ${item.sourcePath}`);
    console.log(`    asset:   ${ref}`);
    console.log(`    alt:     ${JSON.stringify(item.alt)}`);
    console.log(`    was:     ${existing ? existing : "no share image"}`);
    faults.forEach((f) => console.log(`    PROBLEM ${f}`));

    if (existing === ref) {
      console.log("    already set");
      continue;
    }

    const image = {
      _type: "image",
      asset: { _type: "reference", _ref: ref },
      alt: item.alt,
    };

    mutations.push({
      patch: {
        id: doc._id,
        // setIfMissing so this never clobbers an seo object that exists.
        setIfMissing: {
          seo: { _type: "seo" },
          "seo.socialMeta": { _type: "socialMeta" },
        },
        set: {
          "seo.socialMeta.ogImage": image,
          "seo.socialMeta.twitterImage": image,
        },
      },
    });
  }

  console.log(`\n${RULE}`);

  if (problems) {
    console.error(`${problems} problem(s) with the copy. Nothing written.`);
    process.exit(2);
  }

  console.log(
    "All copy passes the content rules: length, punctuation, no banned words, no brand."
  );

  if (!mutations.length) {
    console.log("Nothing to apply.");
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
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  process.exit(1);
});
