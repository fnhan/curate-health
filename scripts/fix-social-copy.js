/**
 * Writes the share card copy for every live page.
 *
 *   node scripts/fix-social-copy.js            dry run
 *   node scripts/fix-social-copy.js --apply    writes
 *
 * WHY THIS IS NOT JUST A COPY OF THE PAGE TITLE
 *
 * A search result and a share card are answering different questions.
 *
 * Someone reading a search result has already typed what they want, so the
 * title's job is to confirm they found it. Keyword first, under 60 characters,
 * "Physiotherapy Toronto".
 *
 * Someone seeing a share card was not looking for anything. The card is in a
 * feed, next to everything else in that feed, and its job is to give a reason
 * to stop. "Our Story" is a perfectly good search result and a dead share
 * card. "The Heart Condition That Started Curate Health" is the reverse, and
 * it is also true: Frank had open-heart surgery at 17 for an atrial septal
 * defect, and that is where the story on that page begins.
 *
 * So these are written, not generated. One at a time, from what each page
 * actually says.
 *
 * WHAT WENT WRONG BEFORE
 *
 * seo.socialMeta.title and seo.socialMeta.description have been in the schema
 * since the beginning and no query ever selected them, so nothing rendered
 * them and nobody had reason to look at them. They rotted quietly:
 *
 *   clinical-care          social title still read "Rehab", a category rename
 *                          and a URL change later
 *   movement-and-training  still read "Exercise Therapy"
 *   outdoor-cold-plunge    still read "Cold Plunge Treatment & Services"
 *   nutritional-...        still spelled counselling with one L
 *   flowpresso-therapy     still carried the pre-CH-023 title
 *   psychotherapy          held a caption describing a forest, with
 *                          performance training's description underneath it
 *
 * The order matters and is deliberate: correct the values, then wire the
 * fields into SEO_QUERY and buildPageMetadata. Wiring first would have
 * published all of the above to every share of those pages.
 *
 * THE BRAND IS NOT TYPED HERE
 *
 * Next applies the layout's title template to openGraph.title, so a value of
 * "Pilates in the Open Air" renders as "Pilates in the Open Air | Curate
 * Health". Same rule as seo.pageTitle. buildPageMetadata strips a trailing
 * brand as a backstop.
 *
 * DEAD PAGES ARE NOT IN HERE
 *
 * Lifestyle Medicine, Mental Health, the Exercise Therapy treatment and the
 * Curate Lifestyle Program document are all switched off or hang off a
 * switched-off category, so no share of them is possible. Writing copy for
 * them would be writing copy nobody can ever see. scripts/audit-stale-content.js
 * is what tracks them.
 */

const { mutate, query } = require("./lib/sanity-cli");

const RULE = "=".repeat(78);

/**
 * Share copy, by document type and optional slug.
 *
 * `pageDescription` appears on a few entries because the sweep found the page's
 * own description was wrong in the same pass: Breathwork carried
 * psychotherapy's copy word for word, Curate Lifestyle carried the retired
 * Lifestyle Medicine page's, the services hub still described the pre-
 * restructure categories, and Our Programs had no title or description at all.
 */
const COPY = [
  // ------------------------------------------------------------------ pages
  {
    type: "cafePage",
    title: "A Cafe With No Industrial Seed Oils",
    description:
      "Seasonal Ontario ingredients, sweetened with maple and honey rather than refined sugar. The cafe attached to Curate Health in Midtown Toronto.",
  },
  {
    type: "contactPage",
    title: "Find Us in Midtown Toronto",
    description:
      "Curate Health is at 989 Eglinton Ave W, Suite 2, between Cedarvale and Forest Hill stations. Opening hours and booking details inside.",
  },
  {
    type: "missionAndValues",
    title: "Why We Treat the Whole Person",
    description:
      "Care that treats the whole person rather than one complaint at a time. The thinking behind a health and wellness space in Midtown Toronto.",
  },
  {
    type: "ourPrograms",
    // This document had no seo values at all, so the page has been running on
    // buildPageMetadata's generic fallback.
    pageTitle: "Our Programs",
    pageDescription:
      "Structured health programs at Curate Health in Midtown Toronto, built around lasting change rather than short term results.",
    title: "Programs Built for Change That Lasts",
    description:
      "Structured programs at Curate Health in Midtown Toronto, run by a team of physicians and therapists working from one plan.",
  },
  {
    type: "ourStory",
    title: "The Heart Condition That Started It All",
    description:
      "Open-heart surgery at 17, and a recovery that shaped how Frank Nhan thinks about care. The story behind Curate Health.",
  },
  {
    type: "ourTeam",
    // Deliberately not "Seven Practitioners". A headcount in a metadata field
    // is wrong the day someone joins, and Claire is already waiting to be
    // added. This whole exercise exists because values nobody re-reads go
    // stale, so do not plant another one.
    title: "One Team, Working From One Plan",
    description:
      "Chiropractic, naturopathic medicine, physiotherapy, massage, psychotherapy and lifestyle medicine, under one roof in Midtown Toronto.",
  },
  {
    type: "pillarsOfHealth",
    title: "The Five Pillars Behind Our Approach",
    description:
      "Physical, mental, emotional, spiritual and social health. Why Curate Health treats all five rather than one at a time.",
  },
  {
    type: "sustainability",
    title: "Building a Health Space That Does Less Harm",
    description:
      "From the materials in the building to how we handle waste, what sustainability actually means at Curate Health.",
  },
  {
    type: "servicesHeroSection",
    // Described "chiropractic care, rehabilitation, and holistic wellness
    // solutions", which is the pre-restructure shape of the site.
    pageDescription:
      "Clinical care, movement and training, the Recovery Sanctuary and the Curate Lifestyle program, all at Curate Health in Midtown Toronto.",
    title: "All of Our Services in One Place",
    description:
      "Clinical care, movement and training, the Recovery Sanctuary and Curate Lifestyle, in one health and wellness space in Midtown Toronto.",
  },
  // ------------------------------------------------------------------ legal
  {
    type: "legalPage",
    slug: "accessibility",
    title: "Accessibility on This Site",
    description:
      "How we work to keep this site usable for everyone, and how to tell us when something is not.",
  },
  {
    type: "legalPage",
    slug: "privacy-and-cookies",
    title: "Privacy and Cookies",
    description:
      "What this site collects and how it is protected. Our privacy and cookie policy, written to be readable.",
  },
  {
    type: "legalPage",
    slug: "terms-of-use",
    title: "Terms of Use",
    description:
      "The terms that apply when you use this site and the services booked through it.",
  },
  // ------------------------------------------------------------------ posts
  {
    type: "post",
    slug: "curate-health-on-diet-and-exercise",
    title: "Why Diet and Exercise Are One Question, Not Two",
    description:
      "Treating food and movement as separate projects is why most plans stall. How we approach them together at Curate Health.",
  },
  {
    type: "post",
    slug: "joints-in-motion-prioritizing-joint-health-for-lifelong-mobility",
    title: "Your Joints Decide How Well You Age",
    description:
      "Joint health quietly sets the limit on how much you can do and for how long. What actually helps maintain it.",
  },
  // --------------------------------------------------------------- products
  {
    type: "product",
    slug: "compression-stockings",
    title: "Compression Stockings, Fitted Properly",
    description:
      "Graduated compression to improve circulation and reduce swelling, fitted at Curate Health in Midtown Toronto.",
  },
  {
    type: "product",
    slug: "custom-foot-orthotics",
    title: "Orthotics Made for Your Feet",
    description:
      "Custom foot orthotics cast and fitted at Curate Health in Midtown Toronto, for comfort and support through the day.",
  },
  {
    type: "product",
    slug: "custom-knee-braces",
    title: "Knee Braces, Fitted to You",
    description:
      "Custom knee braces for support and stability through recovery and activity, fitted at Curate Health in Midtown Toronto.",
  },
  {
    type: "product",
    slug: "profession-grade-supplements",
    title: "Supplements You Cannot Buy Off a Shelf",
    description:
      "Professional grade supplements available through our practitioners at Curate Health in Midtown Toronto.",
  },
  {
    type: "product",
    slug: "tens-machines",
    title: "TENS Machines for Pain at Home",
    description:
      "Portable TENS units for managing muscle and nerve pain between appointments, available at Curate Health.",
  },
  // ------------------------------------------------------------- categories
  {
    type: "service",
    slug: "clinical-care",
    title: "Hands-On Care Under One Roof",
    description:
      "Chiropractic, physiotherapy, massage, acupuncture, naturopathic medicine and psychotherapy at Curate Health in Midtown Toronto.",
  },
  {
    type: "service",
    slug: "movement-and-training",
    title: "Training That Starts Where You Are",
    description:
      "Exercise rehab, fitness training and performance work at Curate Health in Midtown Toronto, built around what your body can do now.",
  },
  {
    type: "service",
    slug: "recovery-sanctuary",
    title: "Inside the Recovery Sanctuary",
    description:
      "Flowpresso, sauna, cold plunge and yoga therapy in our outdoor space in Midtown Toronto.",
  },
  {
    type: "serviceLifestyle",
    slug: "curate-lifestyle",
    // Carried the retired Lifestyle Medicine page's description word for word.
    pageDescription:
      "The Curate Lifestyle program at Curate Health in Midtown Toronto. Group and one-to-one care addressing the root causes of chronic conditions.",
    title: "A Program That Treats the Cause",
    description:
      "Curate Lifestyle brings physicians, naturopaths and therapists around one plan, with small group sessions and one-to-one care.",
  },
  // ------------------------------------------------------------- treatments
  {
    type: "treatments",
    slug: "acupuncture",
    title: "Acupuncture, Traditional and Contemporary",
    description:
      "Integrated acupuncture at Curate Health in Midtown Toronto, drawing on both traditional Chinese medicine and contemporary practice.",
  },
  {
    type: "treatments",
    slug: "breathwork",
    // Its page description was psychotherapy's, word for word. Same class of
    // defect as CH-033, found by the same sweep.
    pageDescription:
      "Breathwork sessions at Curate Health in Midtown Toronto. Guided breathing practice to settle the nervous system and steady your focus.",
    title: "Breathing, Practised Deliberately",
    description:
      "Guided breathwork in the Recovery Sanctuary at Curate Health, to settle the nervous system and steady your focus.",
  },
  {
    type: "treatments",
    slug: "chiropractic-care",
    title: "Chiropractic That Looks Past the Sore Spot",
    description:
      "Assessment and hands-on treatment at Curate Health in Midtown Toronto, aimed at why it hurts rather than only where.",
  },
  {
    type: "treatments",
    slug: "exercise-rehab",
    title: "Getting Back to Full Strength After Injury",
    description:
      "Structured exercise rehabilitation at Curate Health in Midtown Toronto, progressed as your body is ready for it.",
  },
  {
    type: "treatments",
    slug: "fitness-training",
    title: "Training With a Clinician in the Building",
    description:
      "Fitness training at Curate Health in Midtown Toronto, planned with your history and any injuries in mind.",
  },
  {
    type: "treatments",
    slug: "flowpresso-therapy",
    title: "Flowpresso, Compression and Deep Heat",
    description:
      "Flowpresso combines compression and infrared heat in one session. Available at Curate Health in Midtown Toronto.",
  },
  {
    type: "treatments",
    slug: "massage-therapy",
    title: "Registered Massage Therapy in Midtown",
    description:
      "Targeted treatment with a registered massage therapist at Curate Health in Midtown Toronto.",
  },
  {
    type: "treatments",
    slug: "meditation",
    title: "Meditation, Taught Not Just Recommended",
    description:
      "Guided meditation sessions at Curate Health in Midtown Toronto, to build calm and focus alongside your other care.",
  },
  {
    type: "treatments",
    slug: "naturopathy",
    title: "Naturopathic Medicine, Evidence First",
    description:
      "Naturopathic care at Curate Health in Midtown Toronto, working alongside the rest of your care rather than apart from it.",
  },
  {
    type: "treatments",
    slug: "nutritional-counselling",
    title: "Nutrition Advice That Fits Your Life",
    description:
      "Nutritional counselling at Curate Health in Midtown Toronto, built around what you actually eat and what you want to change.",
  },
  {
    type: "treatments",
    slug: "outdoor-cold-plunge",
    title: "Cold Water, Outdoors, Year Round",
    description:
      "The outdoor cold plunge in the Recovery Sanctuary at Curate Health in Midtown Toronto.",
  },
  {
    type: "treatments",
    slug: "outdoor-pilates",
    title: "Pilates in the Open Air",
    description:
      "Mat Pilates in the Recovery Sanctuary at Curate Health in Midtown Toronto, in small groups.",
  },
  {
    type: "treatments",
    slug: "outdoor-sauna",
    title: "The Sauna in the Recovery Sanctuary",
    description:
      "Traditional sauna in the Recovery Sanctuary at Curate Health in Midtown Toronto, on its own or paired with the cold plunge.",
  },
  {
    type: "treatments",
    slug: "outdoor-yoga-therapy",
    title: "Yoga Therapy Outdoors",
    description:
      "Yoga therapy in the Recovery Sanctuary at Curate Health in Midtown Toronto, adapted to what your body needs that day.",
  },
  {
    type: "treatments",
    slug: "performance-training",
    title: "Training for What You Compete In",
    description:
      "Performance training at Curate Health in Midtown Toronto, built for strength and endurance under a specific demand.",
  },
  {
    type: "treatments",
    slug: "physiotherapy",
    title: "Physiotherapy That Follows Through",
    description:
      "Physiotherapy at Curate Health in Midtown Toronto, with the rehab and training space to carry the plan through.",
  },
  {
    type: "treatments",
    slug: "psychotherapy",
    title: "Talking to Someone Who Is Registered",
    description:
      "Psychotherapy at Curate Health in Midtown Toronto, with a registered psychotherapist, in a space set up for it.",
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

/**
 * Length limits.
 *
 * A share title has more room than a search title, because no platform
 * truncates at 60. Facebook and LinkedIn show around 88 characters before
 * cutting, and the layout appends " | Curate Health", 16 more, so 70 is the
 * ceiling here.
 *
 * A share description is cut around 100 characters on a phone and around 200
 * on a desktop feed, so the useful part goes first and 160 is the ceiling.
 */
const TITLE_MAX = 70;
const DESCRIPTION_MAX = 160;

function checkCopy(label, value, max) {
  const problems = [];

  if (value.length > max) problems.push(`${value.length} chars, over ${max}`);
  if (value !== value.trim()) problems.push("leading or trailing whitespace");
  if (/[—–]/.test(value)) problems.push("dash used as punctuation");
  if (/!/.test(value)) problems.push("exclamation mark");
  if (value.includes(BRAND) && label === "share title") {
    problems.push(`contains "${BRAND}", which the layout appends already`);
  }
  if (/\bclinic\b/i.test(value)) {
    problems.push('says "clinic", which is not how the business is described');
  }
  if (/counseling/i.test(value)) problems.push("counseling, should be two Ls");
  for (const word of BANNED) {
    if (new RegExp(`\\b${word}`, "i").test(value)) {
      problems.push(`banned word "${word}"`);
    }
  }

  return problems.map((p) => `${label}: ${p}`);
}

async function main() {
  const apply = process.argv.includes("--apply");

  console.log(RULE);
  console.log("Share card copy");
  console.log(RULE);

  const mutations = [];
  let problems = 0;
  let unchanged = 0;

  for (const item of COPY) {
    const filter = item.slug
      ? `_type == $type && coalesce(slug.current, treatmentSlug.current) == $slug`
      : `_type == $type`;

    const doc = await query(
      `*[${filter} && !(_id in path("drafts.**"))][0]{
        _id, title, name,
        "pageTitle": seo.pageTitle,
        "pageDescription": seo.pageDescription,
        "socialTitle": seo.socialMeta.title,
        "socialDescription": seo.socialMeta.description
      }`,
      { type: item.type, slug: item.slug ?? "" }
    );

    if (!doc) {
      console.error(`\n  NOT FOUND: ${item.type} ${item.slug ?? ""}`);
      process.exit(2);
    }

    const set = {};
    const label = doc.title || doc.name || item.type;
    const lines = [];

    for (const [field, path, human, max] of [
      ["pageTitle", "seo.pageTitle", "page title", 60],
      ["pageDescription", "seo.pageDescription", "page description", 155],
      ["title", "seo.socialMeta.title", "share title", TITLE_MAX],
      [
        "description",
        "seo.socialMeta.description",
        "share description",
        DESCRIPTION_MAX,
      ],
    ]) {
      const value = item[field];
      if (!value) continue;

      const faults = checkCopy(human, value, max);
      problems += faults.length;
      faults.forEach((f) => lines.push(`    PROBLEM ${f}`));

      const currentKey =
        field === "title" || field === "description"
          ? field === "title"
            ? "socialTitle"
            : "socialDescription"
          : field;
      const current = doc[currentKey];

      if (current === value) continue;

      lines.push(`    ${human}`);
      lines.push(`      was: ${JSON.stringify(current)}`);
      lines.push(`      now: ${JSON.stringify(value)}  (${value.length})`);
      set[path] = value;
    }

    if (!Object.keys(set).length) {
      unchanged++;
      continue;
    }

    console.log(`\n  ${label}`);
    lines.forEach((l) => console.log(l));

    mutations.push({
      patch: {
        id: doc._id,
        // Never clobber an seo object that does not exist yet. Our Programs is
        // the one document here with neither.
        setIfMissing: {
          seo: { _type: "seo" },
          "seo.socialMeta": { _type: "socialMeta" },
        },
        set,
      },
    });
  }

  console.log(`\n${RULE}`);

  if (problems) {
    console.error(`${problems} problem(s) with the copy. Nothing written.`);
    process.exit(2);
  }

  console.log(
    `All copy passes: length, no dashes, no banned words, no brand, no "clinic".`
  );
  console.log(
    `${mutations.length} document(s) to change, ${unchanged} already correct.`
  );

  if (!mutations.length) return;

  if (!apply) {
    console.log("Dry run. Nothing written.");
    return;
  }

  const result = await mutate(mutations);
  console.log(`Applied. Transaction ${result.transactionId}`);
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  process.exit(1);
});
