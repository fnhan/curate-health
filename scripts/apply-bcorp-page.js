/**
 * The B Corp page content. CH-119.
 *
 *   node scripts/apply-bcorp-page.js            dry run, prints every word
 *   node scripts/apply-bcorp-page.js --draft    writes the Sanity DRAFT only
 *   node scripts/apply-bcorp-page.js --apply    publishes it
 *
 * WHY --draft IS THE DEFAULT WRITE AND --apply IS NOT
 *
 * Every word below is drafted rather than approved. The standing rule on this
 * project is that Frank approves copy before it goes into Sanity, so the
 * ordinary write here is to the draft, which is exactly what the Studio means
 * by one: he opens it, reads it, edits it, and presses Publish himself.
 *
 * --apply publishes with pageActive false regardless, so even a published
 * document serves nothing until the switch is turned on. The route, the
 * sitemap, llms.txt, the About menu and site search all read that one switch.
 *
 * WHERE THE NUMBERS COME FROM
 *
 * The B Lab directory profile, read on 2026-10-25, not from memory and not
 * from this file's own history:
 *
 *   https://www.bcorporation.net/en-us/find-a-b-corp/company/curate-health-corp/
 *
 * Overall 91.7, pass mark 80, median 50.9, certified October 2026, standards
 * version 1.6. Workers 20.4, Environment 20.0, Community 19.9, Customers 15.8,
 * Governance 15.4. Re-read the profile before changing any of them.
 *
 * WHAT IS DELIBERATELY NOT HERE
 *
 * The five impact areas are not explained. /about/sustainability already has a
 * section for each one, so explaining them again would put two descriptions of
 * one thing on two pages and let them drift, which is what CH-025 spent a whole
 * ticket undoing for the address. This page links there instead.
 */
const { mutate, query } = require("./lib/sanity-cli");
const { findAmerican, findBanned } = require("./lib/content-rules");

const DRAFT = process.argv.includes("--draft");
const APPLY = process.argv.includes("--apply");
const ACTIVE = process.argv.includes("--active");

const DOC_ID = "bcorpPage";
const DIRECTORY =
  "https://www.bcorporation.net/en-us/find-a-b-corp/company/curate-health-corp/";

/*
 * The hero is greenery Curate owns, at 5575x3717. It is NOT the composite
 * carrying the B Corp mark: this band is 400px tall over the full width, so
 * object-cover would crop the mark, and B Lab's guidelines do not allow a
 * cropped lockup. The mark goes in the first section below, whose slot is
 * 704x556 and crops the 1600x1267 composite by almost nothing, which is the
 * ratio that composite was built to on 2026-10-11.
 */
const HERO_ASSET = "image-3388975510b86abe3792c1deadaeea35da16a7ea-5575x3717-jpg";
const MARK_ASSET = "image-3d55827a4b315471a498ed55829394a1b8e01ddf-1600x1267-jpg";

/*
 * Already live on /about/sustainability, with alt text written from the image
 * itself. A placeholder rather than a choice: people outdoors suits the
 * paragraph about health being social, and a photograph of this community
 * would suit it better.
 */
const COMMUNITY_ASSET =
  "image-ef41075f6a819b062d8a2d58f5991d6969ed6c84-2268x4032-jpg";

/*
 * The waiting area, with the logo in cork lettering on the plaster wall. Found
 * in the library on 2026-10-25, unreferenced, 8160x6144.
 *
 * It is the right photograph for the section about construction specifically:
 * the paragraph says the footprint of this space was counted while it was
 * being built, and this is that space, showing the materials it was built
 * from. A stock photograph of a meeting, which is what sat here first, says
 * nothing about either.
 *
 * At 1.33 against the slot's 1.266 it crops by almost nothing.
 */
const WAITING_AREA_ASSET =
  "image-f782f669ac2524c369dd4919b730a8105fd5e55d-8160x6144-jpg";

const CONTENT = {
  seo: {
    pageTitle: "Our B Corp Certification",
    pageDescription:
      "Curate Health is a Certified B Corporation. Why a health and wellness space measures its own footprint, and what the standard holds us to.",
    socialTitle: "Our B Corp Certification",
    socialDescription:
      "A healthy environment decides the health of the people who live in it. Why we hold an international standard for how this business is run.",
  },

  heroTitle: "Our B Corp Certification",

  heroParagraphs: [
    "A healthy environment decides the health of the people who live in it. To optimize health is to optimize both the person and the place they live in, so we cannot set out to make people well while leaving our own footprint out of the account.",
    "That is why Curate Health is a Certified B Corporation. The B stands for benefit, and the standard measures whether a company is run for the benefit of everyone it touches rather than for its owners alone.",
  ],

  score: {
    heading: "Our score",
    intro:
      "Curate Health certified in October 2026. These are B Lab's figures, published in full on its own directory.",
    overall: 91.7,
    threshold: 80,
    median: 50.9,
    certifiedSince: "October 2026",
    directoryUrl: DIRECTORY,
    areas: [
      { name: "Workers", value: 20.4 },
      { name: "Environment", value: 20 },
      { name: "Community", value: 19.9 },
      { name: "Customers", value: 15.8 },
      {
        name: "Governance",
        value: 15.4,
        note: "10 of these are for writing our mission into the governing documents.",
      },
    ],
  },

  sections: [
    {
      key: "bcorp-mark",
      title: "What a B Corp is",
      asset: MARK_ASSET,
      alt: "Certified B Corporation",
      paragraphs: [
        [
          {
            text: "A Certified B Corporation is a company verified against a standard covering governance, workers, community, environment and customers, and legally committed to weighing all of them in its decisions rather than shareholder return alone.",
          },
        ],
        [
          {
            text: "The standard is run by B Lab, a non-profit founded in 2006 by three people who had just sold their company and watched its commitments to its staff and its community disappear in the sale. They built the certification so that what a business stands for could be measured and defended rather than left to whoever owned it. Eighty-one companies certified in the first year. More than ten thousand hold it today, in over a hundred countries, which is what makes it a standard rather than a badge.",
          },
        ],
        [
          {
            text: "It certifies the company rather than anything the company sells, so it describes how Curate Health is run and makes no claim about a particular treatment or anything on the cafe menu.",
          },
        ],
      ],
    },
    {
      key: "why-we-did-it",
      title: "Why we became one",
      asset: COMMUNITY_ASSET,
      alt: "Photograph of a group of people doing yoga on mats with their arms crossed leaning back.",
      paragraphs: [
        [
          {
            text: "Optimal health is not something a person reaches in isolation. It is shaped by the environment they live in and by the people around them, which is why Social sits alongside Physical, Mental, Emotional and Spiritual in our ",
          },
          { text: "five pillars of health", link: "/about/pillars-of-health" },
          { text: "." },
        ],
        [
          {
            text: "Both of those lead to the same place. If the environment a person lives in dictates how healthy they can be, our own footprint is part of their care rather than separate from it. If health is social, then how we treat the people who work here and the neighbourhood we sit in is part of the same work. Helping people is our business, so social impact is not an adjacent commitment. It is the business.",
          },
        ],
        [
          {
            text: "The certification is where we put that on the record. It measures the parts of this place a patient never sees, and it is assessed again every three years.",
          },
        ],
      ],
    },
    {
      key: "what-it-holds-us-to",
      title: "What it holds us to",
      asset: WAITING_AREA_ASSET,
      alt: "Two light wood armchairs below the Curate Health logo in cork lettering on a plaster wall, with plants on either side.",
      paragraphs: [
        [
          {
            text: "That thinking started before the doors opened. The carbon footprint of this space was considered while it was being built rather than totalled up afterwards, so the choices made during construction were weighed on the same terms as the daily running of the place is now.",
          },
        ],
        [
          {
            text: "Our strongest areas are how the people who work here are treated and how the space itself is run, which is where a health and wellness business ought to be strong. Governance is where we have the most ground to cover, and it is already written into what we are preparing for the next assessment in 2029.",
          },
        ],
        [
          {
            text: "Each of the five areas is set out in detail on our ",
          },
          { text: "sustainability page", link: "/about/sustainability" },
          { text: ", and the standard itself at " },
          { text: "bcorp.com", link: "https://bcorp.com" },
          { text: "." },
        ],
      ],
    },
  ],

  cta: {
    title: "Health, curated for the long term",
    paragraph:
      "The certification describes how this place is run. The rest of it is best understood by walking in.",
    buttonText: "Book an appointment",
    buttonLink: "https://curatehealth.janeapp.com",
    asset: HERO_ASSET,
    alt: "Dark green foliage filling the frame, lit from above.",
  },
};

/* ------------------------------------------------------- portable text */

let keyN = 0;
const nextKey = (prefix) => `${prefix}${(keyN += 1).toString(36)}`;

function block(spans) {
  const markDefs = [];
  const children = spans.map((span) => {
    const marks = [];
    if (span.link) {
      const defKey = nextKey("l");
      markDefs.push({ _key: defKey, _type: "link", href: span.link });
      marks.push(defKey);
    }
    return { _key: nextKey("s"), _type: "span", marks, text: span.text };
  });
  return { _key: nextKey("b"), _type: "block", style: "normal", markDefs, children };
}

const imageObject = (assetId, alt) => ({
  image: {
    _type: "image",
    asset: { _type: "reference", _ref: assetId },
  },
  alt,
});

/* ------------------------------------------------------------- the rules */

/**
 * Every rule the audits apply, run BEFORE the write rather than after it, so a
 * break shows up here rather than in a build. Same gate apply-cafe-menu.js and
 * apply-class-schedule.js carry.
 */
function checkRules() {
  const problems = [];

  const strings = [
    ["seo.pageTitle", CONTENT.seo.pageTitle],
    ["seo.pageDescription", CONTENT.seo.pageDescription],
    ["seo.socialMeta.title", CONTENT.seo.socialTitle],
    ["seo.socialMeta.description", CONTENT.seo.socialDescription],
    ["heroTitle", CONTENT.heroTitle],
    ...CONTENT.heroParagraphs.map((p, i) => [`heroParagraph[${i}]`, p]),
    ["score.heading", CONTENT.score.heading],
    ["score.intro", CONTENT.score.intro],
    ...CONTENT.score.areas.flatMap((a, i) =>
      a.note ? [[`score.areas[${i}].note`, a.note]] : []
    ),
    ...CONTENT.sections.flatMap((s, i) => [
      [`sections[${i}].title`, s.title],
      [`sections[${i}].alt`, s.alt],
      ...s.paragraphs.map((spans, j) => [
        `sections[${i}].paragraph[${j}]`,
        spans.map((span) => span.text).join(""),
      ]),
    ]),
    ["cta.title", CONTENT.cta.title],
    ["cta.paragraph", CONTENT.cta.paragraph],
    ["cta.buttonText", CONTENT.cta.buttonText],
    ["cta.alt", CONTENT.cta.alt],
  ];

  for (const [where, text] of strings) {
    if (typeof text !== "string") continue;

    // The hard ban, reaffirmed 2026-10-11. Em and en dashes as punctuation.
    if (/[—–]/.test(text)) problems.push(`${where}: em or en dash`);
    if (text.includes("!")) problems.push(`${where}: exclamation mark`);

    // The CH-020 contamination route is a paste out of a rich text source.
    // audit-unicode.js runs after a write; this runs before one.
    const cf = [...text].filter((c) => /\p{Cf}/u.test(c)).length;
    if (cf) problems.push(`${where}: ${cf} zero-width characters`);

    if (/café/i.test(text)) problems.push(`${where}: accented cafe`);

    for (const hit of findBanned(text)) {
      problems.push(`${where}: banned, "${hit.match ?? hit}"`);
    }
    for (const hit of findAmerican(text)) {
      problems.push(`${where}: American spelling, "${hit.match ?? hit}"`);
    }
  }

  // The audits' own limits, so a failure shows before the build rather than
  // after it. 60 counts the brand buildPageMetadata appends.
  const fullTitle = `${CONTENT.seo.pageTitle} | Curate Health`;
  if (fullTitle.length > 60) {
    problems.push(`seo.pageTitle: ${fullTitle.length} of 60 with the brand`);
  }
  if (CONTENT.seo.pageDescription.length > 155) {
    problems.push(
      `seo.pageDescription: ${CONTENT.seo.pageDescription.length} of 155`
    );
  }
  if (CONTENT.seo.pageDescription.length < 70) {
    problems.push("seo.pageDescription: under 70, audit-metadata warns");
  }

  // audit-metadata requires every significant word of the H1 to appear in the
  // title. Checked here rather than discovered on a build.
  const significant = (s) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !["the", "and", "for", "our"].includes(w));
  const missing = significant(CONTENT.heroTitle).filter(
    (w) => !fullTitle.toLowerCase().includes(w)
  );
  if (missing.length) {
    problems.push(`heading words missing from the title: ${missing.join(", ")}`);
  }

  // The five areas have to add up to the overall, within rounding.
  const sum = CONTENT.score.areas.reduce((n, a) => n + a.value, 0);
  if (Math.abs(sum - CONTENT.score.overall) > 0.3) {
    problems.push(
      `score: the areas total ${sum.toFixed(1)} against an overall of ${CONTENT.score.overall}`
    );
  }

  return problems;
}

/* --------------------------------------------------------------- the doc */

function buildDocument(id) {
  return {
    _id: id,
    _type: "bcorpPage",
    /*
     * Off unless --active is passed. Nothing serves until Frank turns it on,
     * and turning it on is one switch in the Studio.
     *
     * Publishing this document changes nothing on the live site either way:
     * the route, the sitemap entry, the llms.txt line, the About menu entry
     * and the search entry are all on the branch, so production has no reader
     * for it. --active exists so the page can be rendered and looked at on a
     * local build before any of that merges.
     */
    pageActive: ACTIVE,
    heroSection: {
      heroTitle: CONTENT.heroTitle,
      heroParagraph: CONTENT.heroParagraphs.map((text) => block([{ text }])),
      heroImage: imageObject(HERO_ASSET, CONTENT.cta.alt),
    },
    score: {
      heading: CONTENT.score.heading,
      intro: CONTENT.score.intro,
      overall: CONTENT.score.overall,
      threshold: CONTENT.score.threshold,
      median: CONTENT.score.median,
      certifiedSince: CONTENT.score.certifiedSince,
      directoryUrl: CONTENT.score.directoryUrl,
      areas: CONTENT.score.areas.map((area) => ({
        _key: nextKey("a"),
        name: area.name,
        value: area.value,
        ...(area.note ? { note: area.note } : {}),
      })),
    },
    additionalSections: CONTENT.sections.map((section) => ({
      _key: section.key,
      sectionTitle: section.title,
      sectionParagraph: section.paragraphs.map(block),
      sectionImage: imageObject(section.asset, section.alt),
    })),
    ctaSection: {
      ctaSectionTitle: CONTENT.cta.title,
      ctaSectionParagraph: CONTENT.cta.paragraph,
      ctaSectionImage: imageObject(CONTENT.cta.asset, CONTENT.cta.alt),
      ctaButton: {
        buttonText: CONTENT.cta.buttonText,
        buttonLink: CONTENT.cta.buttonLink,
      },
    },
    seo: {
      pageTitle: CONTENT.seo.pageTitle,
      pageDescription: CONTENT.seo.pageDescription,
      socialMeta: {
        title: CONTENT.seo.socialTitle,
        description: CONTENT.seo.socialDescription,
      },
    },
  };
}

/* ------------------------------------------------------------------- run */

(async () => {
  const problems = checkRules();

  console.log();
  console.log("  /about/b-corp, draft content");
  console.log();
  console.log(`  TITLE        ${CONTENT.seo.pageTitle} | Curate Health`);
  console.log(`  DESCRIPTION  ${CONTENT.seo.pageDescription}`);
  console.log(`  H1           ${CONTENT.heroTitle}`);
  console.log();
  CONTENT.heroParagraphs.forEach((p) => console.log(`    ${p}\n`));
  console.log(`  ${CONTENT.score.heading.toUpperCase()}`);
  console.log(`    ${CONTENT.score.intro}`);
  console.log(
    `    ${CONTENT.score.overall} of 200, pass ${CONTENT.score.threshold}, median ${CONTENT.score.median}, since ${CONTENT.score.certifiedSince}`
  );
  CONTENT.score.areas.forEach((a) =>
    console.log(`      ${String(a.value).padStart(5)}  ${a.name}${a.note ? `  (${a.note})` : ""}`)
  );
  console.log();
  CONTENT.sections.forEach((s) => {
    console.log(`  ${s.title.toUpperCase()}`);
    s.paragraphs.forEach((spans) =>
      console.log(`    ${spans.map((x) => x.text).join("")}\n`)
    );
  });
  console.log(`  CTA  ${CONTENT.cta.title}`);
  console.log(`    ${CONTENT.cta.paragraph}`);
  console.log();

  if (problems.length) {
    console.error("  REFUSED, the copy breaks the rules:");
    problems.forEach((p) => console.error(`    ${p}`));
    process.exit(1);
  }
  console.log("  Content rules: clean.");

  if (!DRAFT && !APPLY) {
    console.log();
    console.log("  Dry run. Nothing written.");
    console.log("    --draft   writes the Sanity draft, for Frank to read and edit");
    console.log("    --apply   publishes it, still with pageActive false");
    console.log("    --active  with either, turns the page on");
    return;
  }

  const id = APPLY ? DOC_ID : `drafts.${DOC_ID}`;
  const existing = await query(`*[_id == $id][0]{_id}`, { id });

  const result = await mutate([{ createOrReplace: buildDocument(id) }]);
  console.log();
  console.log(
    `  ${existing ? "Replaced" : "Created"} ${id}. Transaction ${result.transactionId}.`
  );

  const after = await query(
    `*[_id == $id][0]{"h1": heroSection.heroTitle, "score": score.overall, pageActive}`,
    { id }
  );
  console.log(
    `  Reading back: ${after.h1}, ${after.score}, pageActive ${after.pageActive}`
  );
  if (!APPLY) {
    console.log();
    console.log("  This is the DRAFT. Nothing is published and the page 404s.");
  }
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
