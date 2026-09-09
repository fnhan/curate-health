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
  // ---------------------------------------------------------------------
  // Approved 2026-09-09, second round.
  //
  // Four titles carried the brand in the middle of the string rather than at
  // the end, so stripBrand could not remove it and the layout appended a
  // second copy. Three more described something the heading did not. Four
  // descriptions used a banned word or ran past the length Google shows.
  // ---------------------------------------------------------------------
  {
    type: "treatments",
    slug: "acupuncture",
    // Was "Integrated Acupuncture | Curate Health for Pain & Wellness", which
    // rendered with the brand twice.
    pageTitle: "Integrated Acupuncture Toronto",
  },
  {
    type: "sustainability",
    // Was "Curate Health: Our Commitment to Eco-Friendly Sustainability".
    pageTitle: "Our Commitment to Sustainability",
  },
  {
    type: "missionAndValues",
    // Was "Mission & Values | Curate Health – Toronto Wellness Clinic": brand
    // mid-string, an en dash, and "Clinic", which is not how Frank describes
    // the business.
    pageTitle: "Mission and Values",
    pageDescription:
      "The mission and values behind Curate Health, a health and wellness space in Midtown Toronto.",
  },
  {
    type: "ourStory",
    // Was "Our Story" against a heading reading "The Story of My Heart: From
    // Healing To Passion". Neither the tab nor the search result said what the
    // page was about.
    pageTitle: "Our Story, From Healing to Passion",
    pageDescription:
      "How a personal health experience led to founding Curate Health, and the interdisciplinary care model it shaped.",
  },
  {
    type: "post",
    slug: "curate-health-on-diet-and-exercise",
    pageTitle: "Diet and Exercise",
    pageDescription:
      "How Curate Health approaches diet and exercise together rather than as separate parts of health.",
  },
  {
    type: "post",
    slug: "joints-in-motion-prioritizing-joint-health-for-lifelong-mobility",
    pageTitle: "Joints in Motion, Joint Health and Mobility",
    pageDescription:
      "Why joint health underpins mobility and quality of life, and what helps maintain it as you age.",
  },
  {
    type: "product",
    slug: "profession-grade-supplements",
    // The heading read "Profession Grade Supplements" while the title read
    // "Professional". The heading was the typo. The slug keeps the typo for
    // now, because changing it changes a live address and that is Frank's
    // call, not a copy fix.
    title: "Professional Grade Supplements",
    pageDescription:
      "Professional grade supplements at Curate Health in Midtown Toronto, selected for quality and available through our practitioners.",
  },
  // ---------------------------------------------------------------------
  // Found by scripts/audit-stale-content.js on 2026-09-09. Same class as the
  // above: text that went stale when something was renamed, or that breaks a
  // content rule. All of these are live.
  // ---------------------------------------------------------------------
  {
    type: "contactPage",
    // Ended "to begin your wellness journey today".
    pageDescription:
      "How to reach Curate Health in Midtown Toronto. Our address and opening hours, and how to book an appointment.",
  },
  {
    type: "treatments",
    slug: "meditation",
    // Ended "tailored to your wellness journey".
    pageDescription:
      "Guided meditation sessions at Curate Health in Midtown Toronto, to build calm and focus as part of your wider care.",
  },
  {
    type: "treatments",
    slug: "chiropractic-care",
    // Ended "for your lasting wellness journey".
    pageDescription:
      "Chiropractic care at Curate Health in Midtown Toronto. Assessment and hands-on treatment to relieve pain and restore mobility.",
  },
  {
    type: "service",
    slug: "recovery-sanctuary",
    // Opened "Discover transformative wellness treatments".
    pageDescription:
      "Flowpresso, sauna, cold plunge and yoga therapy in the Recovery Sanctuary, the outdoor space at Curate Health in Midtown Toronto.",
  },
  {
    type: "treatments",
    slug: "naturopathy",
    // Used an em dash, and carried seven trailing blank lines.
    pageDescription:
      "Naturopathic medicine at Curate Health in Midtown Toronto. Natural remedies and evidence-based care to restore balance and vitality.",
  },
  {
    type: "treatments",
    slug: "nutritional-counselling",
    // The page was renamed to the Canadian spelling months ago. Its
    // description still said "counseling", so the search result and the
    // heading disagreed on how the service is spelled.
    pageDescription:
      "Nutritional counselling at Curate Health in Midtown Toronto. Personalized guidance on food and eating, built around your health goals.",
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

/**
 * Alt text carrying the American spelling of counselling.
 *
 * These describe photographs, so the fix is one word, not a rewrite. The
 * mental-health entry is included even though that page is unpublished: it is
 * coming back at /help-with/mental-health, and leaving a known misspelling in
 * place to be rediscovered then is how this class of defect survives a
 * restructure in the first place.
 */
const ALT_TEXT = [
  { type: "treatments", slug: "psychotherapy", path: "heroImage.heroAlt" },
  {
    type: "treatments",
    slug: "psychotherapy",
    path: "seo.socialMeta.ogImage.alt",
  },
  {
    type: "treatments",
    slug: "psychotherapy",
    path: "seo.socialMeta.twitterImage.alt",
  },
  { type: "service", slug: "mental-health", path: "seo.socialMeta.ogImage.alt" },
  {
    type: "service",
    slug: "mental-health",
    path: "seo.socialMeta.twitterImage.alt",
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
  if (value !== value.trim()) problems.push("leading or trailing whitespace");
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

/**
 * A possible rule-of-three list, for a human to look at.
 *
 * This is a note and not a failure, because no regex can separate "calm,
 * clarity and balance", which is a tricolon, from "Curate Health in Midtown
 * Toronto, to build calm and focus", which is a clause that happens to contain
 * a comma and an "and". A first version of this check failed the run on five
 * strings and all five were fine. Blocking on a test that is wrong most of the
 * time trains everyone to pass the flag rather than read it.
 *
 * Counting the items is the closest a machine gets: three is banned, four is
 * not, and everything here has to be read anyway before it ships.
 */
function tricolonNote(label, value) {
  const match = value.match(/([^.;]*?)\s+and\s+([^.;,]+)/i);
  if (!match) return null;

  const items = (match[1].match(/,/g) || []).length + 2;
  if (items !== 3) return null;

  return `${label}: may be a rule-of-three list, read it: ${JSON.stringify(
    `${match[1]} and ${match[2]}`.trim()
  )}`;
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

    // The document's own title, which is what the page renders as its heading.
    // Separate from seo.pageTitle, which is what the tab and the search result
    // show. They are allowed to differ, but not to contradict each other.
    if (item.title) {
      const faults = checkCopy("heading", item.title, 70);
      problems += faults.length;
      faults.forEach((f) => console.log(`    PROBLEM ${f}`));
      const note = tricolonNote("heading", item.title);
      if (note) console.log(`    NOTE    ${note}`);

      console.log(`    heading was: ${JSON.stringify(doc.title)}`);
      console.log(`    heading now: ${JSON.stringify(item.title)}`);
      if (doc.title !== item.title) set.title = item.title;
    }

    if (item.pageTitle) {
      const faults = checkCopy("title", item.pageTitle, 60);
      problems += faults.length;
      faults.forEach((f) => console.log(`    PROBLEM ${f}`));
      const note = tricolonNote("title", item.pageTitle);
      if (note) console.log(`    NOTE    ${note}`);

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
      const note = tricolonNote("description", item.pageDescription);
      if (note) console.log(`    NOTE    ${note}`);

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
  console.log("ALT TEXT SPELLING");

  for (const item of ALT_TEXT) {
    const doc = await query(
      `*[_type == $type && coalesce(slug.current, treatmentSlug.current) == $slug && !(_id in path("drafts.**"))][0]`,
      { type: item.type, slug: item.slug }
    );
    if (!doc) {
      console.error(`\n  NOT FOUND: ${item.type} ${item.slug}`);
      process.exit(2);
    }

    const current = readPath(doc, item.path);
    if (typeof current !== "string") {
      console.log(`\n  ${item.slug}  ${item.path}: no value, skipped`);
      continue;
    }

    const fixed = current.replace(/counseling/gi, (m) =>
      m[0] === "C" ? "Counselling" : "counselling"
    ).trim();

    console.log(`\n  ${item.slug}  ${item.path}`);
    console.log(`    was: ${JSON.stringify(current)}`);
    console.log(`    now: ${JSON.stringify(fixed)}`);

    if (fixed === current) {
      console.log("    already correct");
      continue;
    }

    mutations.push({ patch: { id: doc._id, set: { [item.path]: fixed } } });
  }

  console.log(`\n${RULE}`);
  console.log("TRAILING WHITESPACE IN DESCRIPTIONS");

  // Several descriptions carry seven trailing blank lines from a paste. They
  // are invisible in the Studio and they travel into the meta tag.
  const withDescriptions = await query(
    `*[defined(seo.pageDescription) && !(_id in path("drafts.**")) && !(_id in path("sanity.**"))]{
      _id, _type,
      "name": coalesce(title, name, "(untitled)"),
      "description": seo.pageDescription
    }`
  );

  let trimmed = 0;
  for (const doc of withDescriptions) {
    const clean = doc.description.trim();
    if (clean === doc.description) continue;

    // Skip anything COPY is already rewriting, so one document does not get
    // two patches setting the same field.
    if (mutations.some((m) => m.patch.id === doc._id && m.patch.set?.["seo.pageDescription"])) {
      continue;
    }

    trimmed++;
    const junk = doc.description.length - clean.length;
    console.log(`  ${doc._type}  ${doc.name}: ${junk} trailing character(s)`);
    mutations.push({
      patch: { id: doc._id, set: { "seo.pageDescription": clean } },
    });
  }
  console.log(trimmed ? `  ${trimmed} description(s) trimmed` : "  none");

  console.log(`\n${RULE}`);
  console.log("SOCIAL TITLE AND DESCRIPTION");
  console.log(`
  Nothing renders these. SEO_QUERY selects socialMeta's two images and not its
  title or description, so og:title and twitter:title both come from
  seo.pageTitle instead. The fields have been quietly diverging ever since:
  clinical-care's social title still says "Rehab", nutritional-counselling's
  still spells counselling with one L, and psychotherapy's holds a photo
  caption where a title should be.

  Setting both to match the page title and description makes the Studio stop
  showing values that are wrong, and means that if these are ever wired up
  they publish the right thing rather than a snapshot of 2024. See the note in
  scripts/audit-seo-fields.js for why leaving them as they are is the one
  option that carries real risk.
`);

  const socialDocs = await query(
    `*[defined(seo.socialMeta) && !(_id in path("drafts.**")) && !(_id in path("sanity.**"))]{
      _id, _type,
      "name": coalesce(title, name, "(untitled)"),
      "pageTitle": seo.pageTitle,
      "pageDescription": seo.pageDescription,
      "socialTitle": seo.socialMeta.title,
      "socialDescription": seo.socialMeta.description
    }`
  );

  let synced = 0;
  for (const doc of socialDocs) {
    // Read through the pending patches, so a document COPY is rewriting syncs
    // to its new title rather than the one being replaced.
    const pending = mutations.find((m) => m.patch.id === doc._id)?.patch.set ?? {};
    const title = (pending["seo.pageTitle"] ?? doc.pageTitle ?? "").trim();
    const description = (
      pending["seo.pageDescription"] ??
      doc.pageDescription ??
      ""
    ).trim();

    if (!title && !description) continue;

    const set = {};
    if (title && doc.socialTitle !== title) set["seo.socialMeta.title"] = title;
    if (description && doc.socialDescription !== description) {
      set["seo.socialMeta.description"] = description;
    }
    if (!Object.keys(set).length) continue;

    synced++;
    console.log(`  ${doc._type}  ${doc.name}`);
    if (set["seo.socialMeta.title"]) {
      console.log(`      title was: ${JSON.stringify(doc.socialTitle)}`);
      console.log(`      title now: ${JSON.stringify(title)}`);
    }
    if (set["seo.socialMeta.description"]) {
      console.log(
        `      desc  was: ${JSON.stringify((doc.socialDescription || "").slice(0, 70))}`
      );
    }

    const existing = mutations.find((m) => m.patch.id === doc._id);
    if (existing) Object.assign(existing.patch.set, set);
    else mutations.push({ patch: { id: doc._id, set } });
  }
  console.log(`\n  ${synced} document(s) whose social fields disagreed.`);

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
