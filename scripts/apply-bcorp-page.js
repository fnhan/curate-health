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
 * Two photographs already live on /about/sustainability, with alt text already
 * written from the images themselves. Placeholders rather than choices: the
 * sections want pictures of this business and Frank has better ones.
 */
const COMMUNITY_ASSET =
  "image-ef41075f6a819b062d8a2d58f5991d6969ed6c84-2268x4032-jpg";
const WORKERS_ASSET =
  "image-23198e0a9a15d382a77f49a1745b15b7088cbd6d-3728x2920-jpg";

const CONTENT = {
  seo: {
    pageTitle: "Our B Corp Certification",
    pageDescription:
      "Curate Health is a Certified B Corporation, scoring 91.7 where 80 is the pass mark. What B Lab measured, what we scored, and where to check it.",
    socialTitle: "Our B Corp Certification",
    socialDescription:
      "An independent assessment of how this business is run, and the score it was given. Read it rather than take our word for it.",
  },

  heroTitle: "Our B Corp Certification",

  heroParagraphs: [
    "Curate Health is a Certified B Corporation. B Lab, the non-profit that runs the certification, assessed how this business is governed and how it treats the people and the place around it, then verified the answers rather than taking our word for them.",
    "Most people who see the mark do not know what it stands for. This page says what was measured and what we scored, with a link to the record anybody can read.",
  ],

  score: {
    heading: "Our score",
    intro:
      "B Lab scores a business out of 200 across five areas. Curate Health was assessed in 2026 and the whole breakdown is published, so none of it has to be taken on trust.",
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
            text: "A Certified B Corporation is a business assessed by B Lab, an independent non-profit, against a standard covering governance, workers, community, environment and customers. A business needs at least 80 points out of 200 to certify, and it is assessed again every three years.",
          },
        ],
        [
          {
            text: "It is not a legal status and it is not a government scheme. It certifies the company rather than anything the company sells, so it describes Curate Health as a business and makes no claim about a particular treatment or anything on the cafe menu.",
          },
        ],
        [
          { text: "Each of the five areas is covered on our " },
          { text: "sustainability page", link: "/about/sustainability" },
          { text: "." },
        ],
      ],
    },
    {
      key: "what-it-changes",
      title: "What the certification changes",
      asset: COMMUNITY_ASSET,
      alt: "Photograph of a group of people doing yoga on mats with their arms crossed leaning back.",
      paragraphs: [
        [
          {
            text: "Before it, you had our word. We could tell you the cafe cooks with whole ingredients and that the people who work here are looked after, and you would have had to decide whether to believe us.",
          },
        ],
        [
          {
            text: "An independent body has now been through all of it, and what it found is published rather than summarised by us. That is the whole of what a certification is worth, and it is why the score sits on this page with a link to the record instead of being described in general terms.",
          },
        ],
      ],
    },
    {
      key: "still-working",
      title: "What we are still working on",
      asset: WORKERS_ASSET,
      alt: "Photograph of two people having a meeting, one man is faced away from the camera, and the other is looking at him.",
      paragraphs: [
        [
          {
            text: "Governance and Customers are our two lowest areas. Certification sets a floor rather than marking a finish, and the assessment comes round again in 2029, which is where that work has to show.",
          },
        ],
        [
          { text: "The standard itself is set out at " },
          { text: "bcorp.com", link: "https://bcorp.com" },
          { text: ", which is also where the mark on this page points." },
        ],
      ],
    },
  ],

  cta: {
    title: "Come and see the space",
    paragraph:
      "The certification describes how we run this place. The quickest way to judge whether it shows is to walk in.",
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
