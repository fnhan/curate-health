/**
 * The Tai Chi page, CH-107's missing child.
 *
 *   node scripts/apply-tai-chi-page.js           # dry run, prints every word
 *   node scripts/apply-tai-chi-page.js --apply
 *
 * Built from Frank's handoff of 2026-10-24, which specifies the page as a
 * duplicate of Outdoor Yoga Therapy with the content swapped. Every section
 * maps onto a field that treatment document already has, so no component is
 * new.
 *
 * TWO THINGS IN THE HANDOFF ARE NOT BUILT, AND BOTH ARE HIS OWN LATER RULES
 *
 * A "Last reviewed" date. CH-111: "make a rule that this update stamp should
 * never appear", 2026-10-13. The component that drew it is deleted and
 * audit-content-rules.js fails any page carrying the words.
 *
 * A breadcrumb trail. CH-009: trails came off every page but a blog post on
 * 2026-09-20, and audit-breadcrumbs.js fails a trail anywhere else. The
 * services menu under the header is what he reads as the trail on these
 * pages, and this page gets it like every other treatment.
 *
 * THE PHOTOGRAPHS
 *
 * Four frames of Dr. Gabriele in the Recovery Sanctuary, 5184x2920 each, sent
 * on 2026-10-24. Cropped in the browser, as every image on this project is,
 * because there is no image library here.
 *
 *   hero    the raised-arms frame, cut to 2880x1216. The hero band is
 *           2.368:1 at desktop, so a quarter of a 16:9 frame has to go, and
 *           this is the only one of the four whose gesture survives that: the
 *           others are full-body stances that would lose their legs.
 *   hands   his raised palm against the pony-tail palm, 1408x1000, matching
 *           the yoga page's hand detail. This is the shot the handoff asks
 *           for: hands mid-movement against greenery.
 *   cta     arms crossed, eyes closed, 1440x1040 like the yoga lotus.
 *
 * THE ALT TEXT DEPARTS FROM THE HANDOFF ON TWO OF THE THREE
 *
 * The handoff was written before the photographs existed, so it describes
 * pictures that are not the ones supplied: there is no class in the hero
 * frame, only Dr. Gabriele, and the second is not a close crop of hands
 * alone. Alt text describes the photograph, per CH-028, so these were
 * written from the files.
 *
 * The treatment hero is plain next/image rather than SanityImage, so a crop
 * or hotspot set in the Studio is ignored on this one slot. That is why these
 * are cropped before upload rather than left whole. Worth fixing, but it is a
 * shared component on eighteen live pages and does not belong in this change.
 */
const fs = require("fs");
const path = require("path");

const { query, mutate, uploadImage } = require("./lib/sanity-cli");
const { findBanned } = require("./lib/content-rules");

const APPLY = process.argv.includes("--apply");

const PHOTOS = process.env.TAI_CHI_PHOTOS;
if (!PHOTOS) {
  console.error("Set TAI_CHI_PHOTOS to the folder holding the cropped files.");
  process.exit(1);
}

const DOC_ID = "treatment-tai-chi";
const SANCTUARY = "b9816e30-cb14-431e-a92f-d3c00adb4eda";
const GABRIELE = "practitioner-dr-david-gabriele";

/* ------------------------------------------------------------------- copy */

const TITLE = "Tai Chi";
const SLUG = "tai-chi";

const SEO_TITLE = "Tai Chi Classes in Midtown Toronto";
const SEO_DESCRIPTION =
  "Small-group Tai Chi with Dr. David Gabriele at Curate Health in Midtown Toronto. Slow, deliberate movement for balance, strength and a calmer mind.";
const SHARE_TITLE = "Tai Chi";

const SUBTITLE =
  "The strength in moving slowly: Tai Chi in the Recovery Sanctuary";

const INTRO =
  "Most of the week asks you to move quickly. Tai Chi asks for the opposite. If a serene mind and long, functional years interest you, the flowing movements and therapeutic breathing taught by Dr. David Gabriele are worth an hour of your week. The pace is slow on purpose. Over time your balance steadies and your joints move more easily, and the calm you practise in class becomes something you can return to on your own. Class is held outdoors in the Recovery Sanctuary when the weather allows, and indoors when it doesn't.";

/**
 * The pull quote. Not a testimonial, deliberately: Dr. Gabriele is a
 * naturopathic doctor and CONO restricts testimonials in ND advertising, as
 * the handoff says. It carries no attribution because nobody said it.
 */
const QUOTE =
  "The slower the movement, the more of your body has to show up for it.";

const SECTION_TITLE = "What slow, deliberate movement does for the body";

const SECTION_LEAD =
  "Tai Chi has a substantial body of clinical research behind it, most of all for balance and joint health. Over months of regular practice, it works on:";

/**
 * The bullets, as blocks rather than a list, matching how the yoga page sets
 * out the same idea. Each lead-in is bold, and the first carries two links
 * the handoff asks for.
 */
const BULLETS = [
  {
    lead: "A calmer nervous system:",
    spans: [
      {
        text: " Long, even breaths paired with slow movement shift the body toward its parasympathetic, rest-and-recover state. It is the same system we work with in ",
      },
      { text: "breathwork", link: "/services/recovery-sanctuary/breathwork" },
      { text: " and " },
      { text: "meditation", link: "/services/recovery-sanctuary/meditation" },
      { text: "." },
    ],
  },
  {
    lead: "Focus:",
    spans: [
      {
        text: " Each movement asks you to notice where your weight sits and when to breathe. There is little room left for the week behind you or the one ahead.",
      },
    ],
  },
  {
    lead: "Balance:",
    spans: [
      {
        text: " Your weight travels slowly from one leg to the other, again and again. That trains the small stabilizing muscles and reflexes that keep you upright, and better balance is one of the most consistent findings in Tai Chi research.",
      },
    ],
  },
  {
    lead: "Leg strength:",
    spans: [
      {
        text: " Bent-knee stances held under your own body weight build strength through the hips and thighs, with no impact on the joints.",
      },
    ],
  },
  {
    lead: "Joint comfort:",
    spans: [
      {
        text: " The movements are low-load and continuous, which suits stiff knees, hips and backs. Studies in knee osteoarthritis have reported less pain and better function with regular practice.",
      },
    ],
  },
];

const BENEFITS_TITLE = "Why Practise Tai Chi at Curate Health?";

const BENEFITS = [
  {
    title: "Three Decades of Practice",
    subtitle:
      "Dr. David Gabriele has studied traditional martial arts since 1996 and teaches Taiji, Qigong, meditation and therapeutic breathing. As a naturopathic doctor and registered acupuncturist, he also brings a clinician's understanding of the bodies in front of him.",
  },
  {
    title: "Small by Design",
    subtitle:
      "We keep Tai Chi to small groups on purpose, so Dr. Gabriele can watch every student closely and correct posture in the moment. The result is real instruction rather than following along from the back of a room. Spaces are limited, and we recommend reserving yours in advance.",
  },
  {
    title: "Open Air, Whenever the Season Allows",
    subtitle:
      "Class meets in the Recovery Sanctuary, our outdoor space in Midtown Toronto, with fresh air and open sky overhead. On colder or wetter days we move inside, so the practice never has to pause. The outdoor sauna and cold plunge share the space if you want to extend your visit.",
  },
  {
    title: "Something to Gain at Every Level",
    subtitle:
      "Beginners come away with steadier footing and a simple practice they can take home. Experienced students find there is always more depth in the same movements, however long they have been at it. Dr. Gabriele shapes each class around the people in it.",
  },
  {
    title: "Connected to Your Care",
    subtitle:
      "Our practitioners work as one interdisciplinary team. If you are seeing a chiropractor, physiotherapist or naturopathic doctor at Curate, Tai Chi gives you a weekly place to practise what you are working on in treatment.",
  },
];

const CTA_TITLE = "Begin With a Single Hour";
const CTA_TEXT =
  "Tai Chi is a practice measured in years, and it starts with one class. Groups are kept intentionally small so that every student receives close, personal instruction, which means spaces are limited. Wear clothes you can move in; no experience is needed.";
const CTA_BUTTON = "Reserve Your Place";

/** Checked on the live booking site: Tai Chi with Dr. Gabriele, 60 minutes. */
const JANE = "https://curatehealth.janeapp.com/#/discipline/22/treatment/112";

const IMAGES = [
  {
    file: "taichi-hero.jpg",
    name: "tai-chi-hero-recovery-sanctuary.jpg",
    alt: "Dr. David Gabriele standing with both arms raised in a Tai Chi movement, in the Recovery Sanctuary at Curate Health.",
  },
  {
    file: "taichi-hands.jpg",
    name: "tai-chi-hands-detail.jpg",
    alt: "Dr. David Gabriele's hands held open in a Tai Chi posture, with a potted palm behind them.",
  },
  {
    file: "taichi-cta.jpg",
    name: "tai-chi-closing-posture.jpg",
    alt: "Dr. David Gabriele standing with his arms crossed at his chest, eyes closed, at the end of a Tai Chi movement.",
  },
];

/* ------------------------------------------------------------ rule checks */

const DASHES = /[–—]/;
const CF = /\p{Cf}/u;

function ruleBreaks(label, text) {
  const out = [];
  if (!text) return out;
  if (CF.test(text)) {
    const n = [...text].filter((c) => CF.test(c)).length;
    out.push(`${label}: ${n} zero-width or bidi characters, retype it`);
  }
  if (DASHES.test(text)) out.push(`${label}: em or en dash`);
  if (text.includes("!")) out.push(`${label}: exclamation mark`);
  for (const hit of findBanned(text)) out.push(`${label}: ${hit.rule}`);
  /*
   * The short Canadian list. "stabilizing" and "practise" are deliberately
   * not here: -ize is correct Canadian, and practice against practise splits
   * noun from verb in a way no regex can judge.
   */
  for (const [us, ca] of [
    ["color", "colour"],
    ["center", "centre"],
    ["meter", "metre"],
    ["fiber", "fibre"],
    ["neighborhood", "neighbourhood"],
  ]) {
    if (text.toLowerCase().includes(us)) out.push(`${label}: "${us}" -> ${ca}`);
  }
  // CH-111, and it is why the handoff's "Last reviewed" line is not built.
  if (/last (reviewed|updated|modified)/i.test(text)) {
    out.push(`${label}: an update stamp, which never appears on any page`);
  }
  return out;
}

const TITLE_BUDGET = 60 - " | Curate Health".length;

/* ------------------------------------------------------------------ shape */

const key = (text, n) =>
  `${text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24)}-${n}`;

/** One bullet: a bold lead-in, then its text, with links where asked. */
function bulletBlock(bullet, index) {
  const markDefs = [];
  const children = [
    {
      _key: key(bullet.lead, `${index}-lead`),
      _type: "span",
      marks: ["strong"],
      text: bullet.lead,
    },
  ];

  bullet.spans.forEach((span, i) => {
    const marks = [];
    if (span.link) {
      const defKey = key(span.text, `${index}-${i}-link`);
      markDefs.push({ _key: defKey, _type: "link", href: span.link });
      marks.push(defKey);
    }
    children.push({
      _key: key(span.text, `${index}-${i}`),
      _type: "span",
      marks,
      text: span.text,
    });
  });

  return {
    _key: key(bullet.lead, index),
    _type: "block",
    style: "normal",
    markDefs,
    children,
  };
}

function plainBlock(text, id) {
  return {
    _key: id,
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: `${id}-s`, _type: "span", marks: [], text }],
  };
}

(async () => {
  const problems = [];

  /* ------------------------------------------------------- the rule pass */

  const everything = [
    ["title", TITLE],
    ["seo.pageTitle", SEO_TITLE],
    ["seo.pageDescription", SEO_DESCRIPTION],
    ["seo.socialMeta.title", SHARE_TITLE],
    ["intro.subtitle", SUBTITLE],
    ["intro.introParagraph", INTRO],
    ["quoteContent", QUOTE],
    ["section.title", SECTION_TITLE],
    ["section.lead", SECTION_LEAD],
    ["benefits.title", BENEFITS_TITLE],
    ["cta.ctaTitle", CTA_TITLE],
    ["cta.ctaText", CTA_TEXT],
    ["cta.ctaButtonText", CTA_BUTTON],
    ...BULLETS.map((b, i) => [
      `bullet ${i + 1}`,
      b.lead + b.spans.map((s) => s.text).join(""),
    ]),
    ...BENEFITS.flatMap((b, i) => [
      [`benefit ${i + 1} title`, b.title],
      [`benefit ${i + 1}`, b.subtitle],
    ]),
    ...IMAGES.map((img) => [`alt: ${img.name}`, img.alt]),
  ];

  for (const [label, text] of everything) problems.push(...ruleBreaks(label, text));

  const fullTitle = `${SEO_TITLE} | Curate Health`;
  if (SEO_TITLE.length > TITLE_BUDGET) {
    problems.push(`seo.pageTitle: "${fullTitle}" is ${fullTitle.length} of 60`);
  }
  if (SEO_DESCRIPTION.length > 155) {
    problems.push(`seo.pageDescription is ${SEO_DESCRIPTION.length}, over 155`);
  }

  /*
   * The page title has to agree with the h1, which is what audit-metadata.js
   * checks: every significant word of the heading in the title.
   */
  const significant = (s) =>
    s
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 2);
  for (const word of significant(TITLE)) {
    if (!significant(SEO_TITLE).includes(word)) {
      problems.push(`seo.pageTitle is missing "${word}" from the h1 "${TITLE}"`);
    }
  }

  /* -------------------------------------------------------- the lookups */

  const refs = await query(`{
    "sanctuary": *[_id == $s][0]{_id, title},
    "gabriele": *[_id == $g][0]{_id, name, isActive},
    "existing": *[_type == "treatments" && treatmentSlug.current == $slug][0]{_id, _rev},
    "takenOrder": *[_type == "treatments" && service._ref == $s].displayOrder,
    "breathwork": count(*[_type == "treatments" && treatmentSlug.current == "breathwork" && isActive == true]),
    "meditation": count(*[_type == "treatments" && treatmentSlug.current == "meditation" && isActive == true])
  }`, { s: SANCTUARY, g: GABRIELE, slug: SLUG });

  if (!refs.sanctuary) problems.push("the Recovery Sanctuary service is missing");
  if (!refs.gabriele) problems.push("Dr. David Gabriele's record is missing");
  else if (!refs.gabriele.isActive) {
    problems.push("Dr. David Gabriele is switched off, so the page would name nobody");
  }
  // Both links in the first bullet must reach a live page.
  if (!refs.breathwork) problems.push("the breathwork link has no live page");
  if (!refs.meditation) problems.push("the meditation link has no live page");

  const displayOrder = Math.max(0, ...refs.takenOrder.filter(Number.isFinite)) + 1;

  /* ----------------------------------------------------------- the print */

  console.log();
  console.log(`  ${TITLE}   /services/recovery-sanctuary/${SLUG}`);
  console.log(`  ${fullTitle}  (${fullTitle.length} of 60)`);
  console.log(`  ${SEO_DESCRIPTION}  (${SEO_DESCRIPTION.length} of 155)`);
  console.log(`  share title: ${SHARE_TITLE} | Curate Health`);
  console.log(`  position ${displayOrder} in the Recovery Sanctuary list`);
  console.log(`  taught by ${refs.gabriele?.name}`);
  console.log(`  books at ${JANE}`);
  console.log();
  console.log(`  H2  ${SUBTITLE}`);
  console.log(`  ${INTRO}`);
  console.log();
  console.log(`  QUOTE  ${QUOTE}`);
  console.log();
  console.log(`  ${SECTION_TITLE}`);
  console.log(`  ${SECTION_LEAD}`);
  for (const b of BULLETS) {
    console.log(`    ${b.lead}${b.spans.map((s) => s.text).join("")}`);
    for (const s of b.spans) if (s.link) console.log(`        link: "${s.text}" -> ${s.link}`);
  }
  console.log();
  console.log(`  ${BENEFITS_TITLE}`);
  for (const b of BENEFITS) console.log(`    ${b.title}\n      ${b.subtitle}`);
  console.log();
  console.log(`  CTA  ${CTA_TITLE}`);
  console.log(`  ${CTA_TEXT}`);
  console.log(`  [${CTA_BUTTON}]`);
  console.log();
  for (const img of IMAGES) {
    const p = path.join(PHOTOS, img.file);
    const size = fs.existsSync(p) ? `${Math.round(fs.statSync(p).size / 1024)} KB` : "MISSING";
    if (!fs.existsSync(p)) problems.push(`the file ${img.file} is not in ${PHOTOS}`);
    console.log(`  ${img.file}  ${size}\n      ${img.alt}`);
  }
  console.log();
  console.log("  NOT BUILT, both of them Frank's own later rules:");
  console.log("    a Last reviewed date, CH-111, no update stamp on any page");
  console.log("    a breadcrumb trail, CH-009, blog posts only since 2026-09-20");
  console.log();

  if (refs.existing) {
    console.log(`  NOTE: ${SLUG} already exists as ${refs.existing._id}; it will be replaced.`);
    console.log();
  }

  if (problems.length) {
    console.log("  REFUSING TO WRITE:");
    for (const p of problems) console.log(`    ${p}`);
    process.exit(1);
  }

  if (!APPLY) {
    console.log("  Dry run. Nothing written. Re-run with --apply.");
    return;
  }

  /* --------------------------------------------------------- the upload */

  const uploaded = {};
  for (const img of IMAGES) {
    const buffer = fs.readFileSync(path.join(PHOTOS, img.file));
    const asset = await uploadImage(buffer, img.name, "image/jpeg");
    uploaded[img.file] = asset._id;
    console.log(`  uploaded ${img.name}  ${asset._id}`);
  }

  const ref = (file) => ({
    _type: "image",
    asset: { _type: "reference", _ref: uploaded[file] },
  });

  const doc = {
    _id: refs.existing?._id ?? DOC_ID,
    _type: "treatments",
    title: TITLE,
    isActive: true,
    displayOrder,
    service: { _type: "reference", _ref: SANCTUARY },
    treatmentSlug: { _type: "slug", current: SLUG },
    janeBookingUrl: JANE,
    practitioners: [
      { _key: "gabriele", _type: "reference", _ref: GABRIELE },
    ],
    heroImage: { ...ref("taichi-hero.jpg"), heroAlt: IMAGES[0].alt },
    intro: { subtitle: SUBTITLE, introParagraph: INTRO },
    quoteContent: QUOTE,
    additionalSections: [
      {
        _key: "what-slow-movement-does",
        sectionTitle: SECTION_TITLE,
        sectionImage: {
          image: ref("taichi-hands.jpg"),
          alt: IMAGES[1].alt,
        },
        sectionParagraph: [
          plainBlock(SECTION_LEAD, "lead"),
          ...BULLETS.map(bulletBlock),
        ],
      },
    ],
    benefits: {
      title: BENEFITS_TITLE,
      benefitsList: BENEFITS.map((b, i) => ({
        _key: key(b.title, i),
        title: b.title,
        subtitle: b.subtitle,
      })),
    },
    cta: {
      ctaBg: ref("taichi-cta.jpg"),
      ctaBgAlt: IMAGES[2].alt,
      ctaTitle: CTA_TITLE,
      ctaText: CTA_TEXT,
      ctaButtonText: CTA_BUTTON,
    },
    seo: {
      _type: "seo",
      pageTitle: SEO_TITLE,
      pageDescription: SEO_DESCRIPTION,
      socialMeta: {
        _type: "socialMeta",
        title: SHARE_TITLE,
        description: SEO_DESCRIPTION,
        // The hero doubles as the share card, per the every-page rule.
        ogImage: { ...ref("taichi-hero.jpg"), alt: IMAGES[0].alt },
        twitterImage: { ...ref("taichi-hero.jpg"), alt: IMAGES[0].alt },
      },
    },
  };

  const result = await mutate([{ createOrReplace: doc }]);
  console.log(`\n  Applied. Transaction ${result.transactionId}.`);

  /*
   * Point the class schedule at the new page, so Tai Chi stops being a name
   * on /classes and becomes a link, and takes its photograph and description
   * from here rather than from the summary typed on the entry.
   */
  const schedule = await query(
    `*[_type == "classSchedule"][0]{_id, _rev, classes}`
  );
  if (schedule) {
    const classes = schedule.classes.map((c) =>
      c._key === "tai-chi"
        ? {
            ...c,
            treatment: { _type: "reference", _ref: doc._id },
            // The name and summary are the fallback for a class with no
            // page. It has one now, so they would only be a second copy to
            // drift; the query prefers the treatment's anyway.
            name: undefined,
            summary: undefined,
          }
        : c
    );
    const linked = await mutate([
      {
        patch: {
          id: schedule._id,
          ifRevisionID: schedule._rev,
          set: { classes },
        },
      },
    ]);
    console.log(`  Linked from /classes. Transaction ${linked.transactionId}.`);
  }
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
