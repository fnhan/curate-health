/**
 * The copy-review decisions Frank approved in September, applied.
 *
 *   node scripts/apply-decision-backlog.js
 *   node scripts/apply-decision-backlog.js --apply
 *
 * He asked on 2026-10-24 for the backlog cleared: "Please apply the decisions
 * already made by me on the 31 items."
 *
 * FOUR ARE DELIBERATELY NOT APPLIED, AND THEY ARE LISTED AT THE END
 *
 * Each is one his own later work has overtaken. Writing a September decision
 * over an October one he also made would be the same mistake the dash sweep
 * made in reverse, and the point of this pass is to stop that happening.
 *
 * EVERY CHANGE STATES THE TEXT IT EXPECTS
 *
 * `expect` is a distinctive fragment of what is live now. If a field no
 * longer contains it the whole run refuses, rather than writing one
 * paragraph over another. Array positions are not keys: they are read from
 * the document at run time and checked against the title beside them.
 */
const { query, mutate } = require("./lib/sanity-cli");
const { findBanned } = require("./lib/content-rules");

const APPLY = process.argv.includes("--apply");

/* ------------------------------------------------------------------ rules */

const DASHES = /[–—]/;
const CF = /\p{Cf}/u;

function ruleBreaks(label, text) {
  const out = [];
  if (!text) return out;
  if (CF.test(text)) out.push(`${label}: zero-width characters, retype it`);
  if (DASHES.test(text)) out.push(`${label}: em or en dash`);
  if (text.includes("!")) out.push(`${label}: exclamation mark`);
  if (/café/i.test(text)) out.push(`${label}: accented cafe`);
  for (const hit of findBanned(text)) out.push(`${label}: ${hit.rule}`);
  for (const [us, ca] of [
    ["color", "colour"],
    ["center", "centre"],
    ["honor", "honour"],
    ["flavor", "flavour"],
    ["neighborhood", "neighbourhood"],
  ]) {
    if (text.toLowerCase().includes(us)) out.push(`${label}: "${us}" -> ${ca}`);
  }
  if (/last (reviewed|updated|modified)/i.test(text)) {
    out.push(`${label}: an update stamp, which never appears`);
  }
  return out;
}

/* ------------------------------------------------------------- what to do */

/**
 * Plain string fields. `where` is a dotted path, `expect` a fragment of the
 * live value, `to` the text he approved.
 */
const STRINGS = [
  // a03 to a06. Four product banners carried ONE description between them,
  // the same sentence about a professional with a tablet, which describes
  // none of the four photographs. This is the biggest single fix in the set.
  {
    id: "a03",
    doc: `*[_type=="product" && slug.current=="compression-stockings"][0]`,
    where: "banner.alt",
    expect: "healthcare professional in scrubs",
    to: "A person sitting on a sofa pulling on black knee-high compression stockings",
  },
  {
    id: "a04",
    doc: `*[_type=="product" && slug.current=="custom-foot-orthotics"][0]`,
    where: "banner.alt",
    expect: "healthcare professional in scrubs",
    to: "A hand fitting a blue orthotic insole to the underside of a foot",
  },
  {
    id: "a05",
    doc: `*[_type=="product" && slug.current=="custom-knee-braces"][0]`,
    where: "banner.alt",
    expect: "healthcare professional in scrubs",
    to: "A hinged knee brace fastened around a person's knee",
  },
  {
    id: "a06",
    doc: `*[_type=="product" && slug.current=="tens-machines"][0]`,
    where: "banner.alt",
    expect: "healthcare professional in scrubs",
    to: "TENS electrode pads placed on a person's upper back and neck",
  },

  // s05. The live one talks about exercise therapy, which is one service
  // rather than the team.
  {
    id: "s05",
    doc: `*[_type=="ourTeam"][0]`,
    where: "seo.pageDescription",
    expect: "personalized exercise therapy",
    to: "Meet the practitioners at Curate Health in Midtown Toronto, from chiropractic and physiotherapy to naturopathic and lifestyle medicine.",
  },

  // s07. All four fields are empty, so the blog runs on the code fallback.
  {
    id: "s07 title",
    doc: `*[_type=="blogSection"][0]`,
    where: "seo.pageTitle",
    expect: null,
    to: "Health and Wellness Blog",
  },
  {
    id: "s07 description",
    doc: `*[_type=="blogSection"][0]`,
    where: "seo.pageDescription",
    expect: null,
    to: "Articles on movement, recovery and lifestyle medicine from the practitioners at Curate Health in Midtown Toronto.",
  },
  {
    id: "s07 share title",
    doc: `*[_type=="blogSection"][0]`,
    where: "seo.socialMeta.title",
    expect: null,
    to: "Health Notes From the Curate Health Team",
  },
  {
    id: "s07 share description",
    doc: `*[_type=="blogSection"][0]`,
    where: "seo.socialMeta.description",
    expect: null,
    to: "Articles on movement, recovery and lifestyle medicine from the practitioners at Curate Health in Midtown Toronto.",
  },

  // s08. The live one is 42 characters, under the 70 the audit warns at.
  {
    id: "s08",
    doc: `*[_type=="cafePage"][0]`,
    where: "seo.pageDescription",
    expect: "nourishment meets intention",
    to: "Curate Cafe in Midtown Toronto. An organic, whole-food menu with no industrial seed oils or refined sugar, sweetened only with local maple or honey.",
  },

  // c31. The live excerpt carries "unlocking the secrets", which is the
  // register he spent the review cutting.
  {
    id: "c31",
    doc: `*[_type=="post" && slug.current match "joints*"][0]`,
    where: "excerpt",
    expect: "unlocking the secrets",
    to: "Joint health shapes mobility and quality of life. Here is what helps keep your joints healthy and moving well.",
  },

  // c07, c06. Acupuncture.
  {
    id: "c07",
    doc: `*[_type=="treatments" && treatmentSlug.current=="acupuncture"][0]`,
    where: "intro.introParagraph",
    expect: "Acupuncture",
    to: "Acupuncture, a blend of ancient traditional wisdom and modern precision, stimulates specific points on the body to support healing. Rooted in Traditional Chinese Medicine (TCM), acupuncture harmonizes the flow of Qi along meridians to alleviate pain, reduce stress, and restore balance. Simultaneously, Contemporary Medical Acupuncture (CMA), grounded in neuroanatomy and evidence-based practice, targets nerves, muscles, and tissues to relieve pain, reduce inflammation, and promote physiological healing. By integrating TCM's holistic philosophy with CMA's scientific rigor, this fused approach draws on the body's innate resilience, offering a drug-free, tailored solution for pain relief, stress reduction, and vibrant health with unparalleled precision.",
  },
  {
    id: "c06",
    doc: `*[_type=="treatments" && treatmentSlug.current=="acupuncture"][0]`,
    where: "cta.ctaText",
    expect: null,
    to: "Integrated acupuncture at Curate Health draws on traditional medicine and modern science to relieve pain and restore balance. Each plan is built around you. Book a consultation to get started.",
  },

  // c30. Chiropractic Care.
  {
    id: "c30",
    doc: `*[_type=="treatments" && treatmentSlug.current=="chiropractic-care"][0]`,
    where: "intro.introParagraph",
    expect: null,
    to: "Navigating life with back pain, neck stiffness, or joint discomfort can feel like living in a home that's always under construction. Something is always out of place, getting in the way of enjoying your day. At Curate Health, we see chiropractic care as the skilled architect your body needs to restore its structural integrity and harmony.",
  },

  // c39, c38. Breathwork.
  {
    id: "c39",
    doc: `*[_type=="treatments" && treatmentSlug.current=="breathwork"][0]`,
    where: "intro.introParagraph",
    expect: null,
    to: "In the journey toward holistic health, the power of breath is often underestimated. Breathwork at Curate Health uses controlled breathing techniques to support emotional and physical well-being. This ancient practice, informed by modern science, gives you a way to find balance and calm.",
  },
  {
    id: "c38",
    doc: `*[_type=="treatments" && treatmentSlug.current=="breathwork"][0]`,
    where: "cta.ctaText",
    expect: null,
    to: "Ready to see what focused breathing can do for you? Curate Health's Breathwork sessions give you supervised guidance to work on emotional balance and mental clarity. Book a session to begin.",
  },
];

/**
 * Portable text whose whole value is one block of one span, which is every
 * one of these. `listPath` names the array, `match` finds the entry by its
 * own title or by index, and `textPath` is the block array inside it.
 */
const BLOCKS = [
  {
    id: "c08",
    doc: `*[_type=="serviceLifestyle"][0]`,
    list: "benefits",
    by: { title: "Sustain Energy Naturally" },
    field: "description",
    expect: "starting the moment you wake up",
    to: "Experience all-day vitality with fewer crashes and more stamina, from the moment you wake up.",
  },
  {
    id: "c09",
    doc: `*[_type=="serviceLifestyle"][0]`,
    list: "benefits",
    by: { title: "Heal Through Nourishment" },
    field: "description",
    expect: "Rebalance your relationship with food",
    to: "Rebalance your relationship with food, for better digestion and fewer cravings, and a weight you can sustain.",
  },
  {
    id: "c10",
    doc: `*[_type=="serviceLifestyle"][0]`,
    list: "benefits",
    by: { title: "Connect & Learn in Real Time" },
    field: "description",
    expect: "(6 to 15 people)",
    to: "Engage in small group sessions of 6 to 15 people for real-time answers, guidance, and shared motivation.",
  },
  {
    id: "c18",
    doc: `*[_type=="serviceLifestyle"][0]`,
    list: "faq",
    by: { title: "Do I need a referral?" },
    field: "description",
    expect: "referral",
    to: "Yes. Begin by asking your family doctor or medical doctor for a referral, and send it to us via 416-900-3311. If a referral is not possible, our team is happy to suggest other options. The program is partially covered by OHIP and most benefit programs. Let us help you check your benefits.",
  },
];

/** The three opening paragraphs, which are blocks of the `content` array. */
const CONTENT = [
  {
    id: "c13",
    index: 0,
    expect: "elevated by intention",
    to: "Welcome to a new chapter in your health journey, one rooted in evidence and sustained with care. At Curate Health, the Curate Lifestyle Program is more than a protocol. It is a way of living well.",
  },
  {
    id: "c14",
    index: 1,
    expect: "six foundations of Lifestyle Medicine",
    to: "Our approach is grounded in the six foundations of Lifestyle Medicine: nutrient-rich food, purposeful movement, restorative sleep, mental and emotional balance, meaningful connection and avoidance of harmful substances. It is built to help you feel and function better at every age.",
  },
  {
    id: "c15",
    index: 2,
    expect: "transformation, curated just for you",
    to: "Our team of doctors and therapists will meet you where you are and walk beside you. This is your invitation to age well and take back your health with purpose. At Curate Health, lifestyle is medicine, curated for you.",
  },
];

/** Not applied, and why. Printed so the reasoning is in the run, not a note. */
const HELD = [
  [
    "a01, a02",
    "Curate Lifestyle photo descriptions",
    "the live ones were written on 2026-10-11 from the photographs themselves and are more accurate: his says the almonds are IN the bowls where they are scattered around them, and the granola one misses that the oats are in a glass. CH-028 says alt describes the picture.",
  ],
  [
    "s01",
    "Dr. Nhan's description",
    "live is the wording he chose from three options on 2026-10-12, which names all four of his credentials. The September one names two.",
  ],
  [
    "s02",
    "Safa's title and description",
    'September says "RP (Qualifying)". On 2026-10-12 he decided to drop "(Qualifying)" entirely: "we aren\'t pushing it yet anyway, and by the time we do, she will be qualified." Live already reflects that.',
  ],
  [
    "c19",
    "the medication answer",
    "live is the wording HE wrote on 2026-10-12, after this very claim was raised as a clinical one: \"Many participants see improvements ... which may allow them to reduce or eliminate medications under medical supervision.\" The September version is a draft of the same answer. Writing the older over the newer is the mistake this pass exists to stop, and it is a clinical claim, so it is held rather than guessed at.",
  ],
  [
    "c16",
    "the Group Learning line",
    "it is one line inside the multi-part How does the program work answer rather than a field of its own, so it needs a block-level edit inside that answer. Worth doing with c17 beside it, which is already live.",
  ],
];

/* -------------------------------------------------------------- machinery */

const get = (obj, path) =>
  path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);

const blockText = (blocks) =>
  (blocks ?? [])
    .filter((b) => b._type === "block")
    .map((b) => (b.children ?? []).map((c) => c.text ?? "").join(""))
    .join("\n");

/** One block of one span, keeping the key so a re-run is a no-op. */
const oneBlock = (existing, text) => {
  const first = (existing ?? []).find((b) => b._type === "block");
  return [
    {
      _key: first?._key ?? "b",
      _type: "block",
      style: first?.style ?? "normal",
      markDefs: [],
      children: [
        {
          _key: first?.children?.[0]?._key ?? "s",
          _type: "span",
          marks: [],
          text,
        },
      ],
    },
  ];
};

(async () => {
  const problems = [];
  const changes = [];
  const patches = new Map();

  const addSet = (doc, rev, path, value) => {
    const entry = patches.get(doc) ?? { id: doc, ifRevisionID: rev, set: {} };
    entry.set[path] = value;
    patches.set(doc, entry);
  };

  /* ------------------------------------------------------ plain strings */

  for (const s of STRINGS) {
    const doc = await query(`${s.doc}{_id, _rev, ...}`);
    if (!doc) {
      problems.push(`${s.id}: no document matched`);
      continue;
    }
    const now = get(doc, s.where);
    if (s.expect && !(now ?? "").includes(s.expect)) {
      problems.push(
        `${s.id}: ${s.where} no longer contains "${s.expect}". It reads: ${String(now).slice(0, 110)}`
      );
      continue;
    }
    if (now === s.to) continue;
    changes.push({ id: s.id, where: `${doc._type}.${s.where}`, from: now, to: s.to });
    addSet(doc._id, doc._rev, s.where, s.to);
  }

  /* -------------------------------------------------- portable text, 1:1 */

  for (const b of BLOCKS) {
    const doc = await query(`${b.doc}{_id, _rev, ${b.list}}`);
    if (!doc) {
      problems.push(`${b.id}: no document matched`);
      continue;
    }
    const list = doc[b.list] ?? [];
    const i = list.findIndex((e) => e.title === b.by.title);
    if (i === -1) {
      problems.push(`${b.id}: no "${b.by.title}" in ${b.list}`);
      continue;
    }
    const now = blockText(list[i][b.field]);
    if (b.expect && !now.includes(b.expect)) {
      problems.push(
        `${b.id}: "${b.by.title}" no longer contains "${b.expect}". It reads: ${now.slice(0, 110)}`
      );
      continue;
    }
    if (now === b.to) continue;
    const next = list.map((e, j) =>
      j === i ? { ...e, [b.field]: oneBlock(e[b.field], b.to) } : e
    );
    changes.push({ id: b.id, where: `${b.list}[${i}] ${b.by.title}`, from: now, to: b.to });
    addSet(doc._id, doc._rev, b.list, next);
  }

  /* ------------------------------------------- the three opening blocks */

  const sl = await query(`*[_type=="serviceLifestyle"][0]{_id, _rev, content}`);
  if (!sl) problems.push("no serviceLifestyle document");
  else {
    let content = sl.content ?? [];
    let touched = false;
    for (const c of CONTENT) {
      const block = content[c.index];
      const now = blockText([block]);
      if (!now.includes(c.expect)) {
        problems.push(
          `${c.id}: content[${c.index}] no longer contains "${c.expect}". It reads: ${now.slice(0, 110)}`
        );
        continue;
      }
      if (now.trim() === c.to) continue;
      content = content.map((b, j) =>
        j === c.index ? oneBlock([b], c.to)[0] : b
      );
      touched = true;
      changes.push({ id: c.id, where: `content[${c.index}]`, from: now, to: c.to });
    }
    if (touched) addSet(sl._id, sl._rev, "content", content);
  }

  /* ---------------------------------------------------------- the rules */

  for (const c of changes) problems.push(...ruleBreaks(c.id, c.to));

  /* ---------------------------------------------------------- the print */

  console.log();
  for (const c of changes) {
    console.log(`  ${c.id}  ${c.where}`);
    console.log(`    WAS: ${String(c.from ?? "(empty)").replace(/\n/g, " ").slice(0, 200)}`);
    console.log(`    NOW: ${c.to.slice(0, 200)}`);
    console.log();
  }
  console.log(`  ${changes.length} changes across ${patches.size} documents.`);
  console.log();
  console.log("  NOT APPLIED, each overtaken by something he decided later:");
  for (const [id, what, why] of HELD) {
    console.log(`    ${id}  ${what}`);
    console.log(`       ${why}`);
  }
  console.log();

  if (problems.length) {
    console.log("  REFUSING TO WRITE:");
    for (const p of problems) console.log(`    ${p}`);
    process.exit(1);
  }

  if (!APPLY) {
    console.log("  Dry run. Nothing written. Re-run with --apply.");
    return;
  }

  const result = await mutate([...patches.values()].map((patch) => ({ patch })));
  console.log(`  Applied. Transaction ${result.transactionId}.`);
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
