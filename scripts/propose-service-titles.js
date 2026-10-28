/**
 * Geo-targets the service and treatment titles that never named Toronto.
 *
 *   node scripts/propose-service-titles.js            dry run, prints every word
 *   node scripts/propose-service-titles.js --apply
 *
 * WHY THESE TWELVE
 *
 * Ten service pages already carried "Toronto" in the title. Twelve did not,
 * and among them were the three highest-volume searches Curate competes for:
 * physiotherapy, chiropractic care and massage therapy. Those three carried
 * "Treatment & Services" instead, a 2024 template that matches nothing anyone
 * types and spends characters Google counts.
 *
 * `/services` itself was titled "Services", which says nothing about what is
 * offered or where.
 *
 * THE NOUN PEOPLE SEARCH IS NOT ALWAYS THE ONE ON THE PAGE
 *
 * People search for the practitioner more than the discipline: "chiropractor"
 * over "chiropractic", "naturopathic doctor" over "naturopathy". The title
 * cannot carry both, because `titleMatchesHeading` requires every significant
 * word of the h1 and the h1 is the discipline. So the noun goes in the meta
 * description, which has room and which Google reads.
 *
 * WHAT IS DELIBERATELY NOT CHANGED
 *
 * Six descriptions are already correct and are left exactly as they are:
 * rewriting a good sentence to look busy is how Frank's September decisions
 * got overwritten by the dash sweep. Only a description that fails to name
 * Toronto, or opens on filler, is touched.
 *
 * EVERY DRAFT IS CHECKED BEFORE IT CAN BE WRITTEN
 *
 * Against the audits' own limits, against `titleMatchesHeading` lifted from
 * `audit-metadata.js`, and against the content rules. The tricolon rule caught
 * three of these drafts: "assessment, hands-on treatment and targeted
 * exercise" is a rule of three, and so were two others.
 */
const { mutate, query } = require("./lib/sanity-cli");
const { findBanned, findAmerican } = require("./lib/content-rules");

const APPLY = process.argv.includes("--apply");

/** What buildPageMetadata appends, and what Google counts with it. */
const BRAND_SUFFIX = " | Curate Health";
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 155;
const DESCRIPTION_MIN = 70;

/**
 * `heading` is the page's rendered h1, read off production rather than
 * assumed, because the title has to carry every significant word of it.
 * `description: null` means the live one is already right and is left alone.
 */
const PAGES = [
  {
    type: "treatments",
    slug: "physiotherapy",
    heading: "Physiotherapy",
    title: "Physiotherapy in Midtown Toronto",
    description:
      "Physiotherapy at Curate Health in Midtown Toronto. Hands-on treatment and targeted exercise to restore how you move and relieve pain.",
  },
  {
    type: "treatments",
    slug: "chiropractic-care",
    heading: "Chiropractic Care",
    title: "Chiropractic Care in Midtown Toronto",
    // Leads on "chiropractor", which the title cannot carry.
    description:
      "See a chiropractor at Curate Health in Midtown Toronto. Assessment and hands-on treatment to relieve pain and restore mobility.",
  },
  {
    type: "treatments",
    slug: "massage-therapy",
    heading: "Massage Therapy",
    title: "Massage Therapy in Midtown Toronto",
    // "Registered massage therapy" is accurate: Andrew Huynh is an RMT, and
    // it is also what people search.
    description:
      "Registered massage therapy at Curate Health in Midtown Toronto. Targeted treatment for pain and tension, bookable online.",
  },
  {
    type: "treatments",
    slug: "naturopathy",
    heading: "Naturopathy",
    title: "Naturopathy in Midtown Toronto",
    description:
      "Naturopathic medicine at Curate Health in Midtown Toronto. Evidence-based care from a naturopathic doctor, to restore balance and vitality.",
  },
  {
    type: "treatments",
    slug: "exercise-rehab",
    heading: "Exercise Rehab",
    title: "Exercise Rehab in Midtown Toronto",
    description:
      "Exercise rehab at Curate Health in Midtown Toronto. Supervised, progressive movement to rebuild strength and confidence after an injury.",
  },
  {
    type: "treatments",
    slug: "fitness-training",
    heading: "Fitness Training",
    title: "Fitness Training in Midtown Toronto",
    description:
      "Fitness training at Curate Health in Midtown Toronto. Personalized programs built around your goals and how you actually move.",
  },
  {
    type: "treatments",
    slug: "performance-training",
    heading: "Performance Training",
    title: "Performance Training in Midtown Toronto",
    description:
      "Performance training at Curate Health in Midtown Toronto. Strength and conditioning for athletes and anyone training with intent.",
  },
  {
    type: "treatments",
    slug: "breathwork",
    heading: "Breathwork",
    title: "Breathwork in Midtown Toronto",
    description: null,
  },
  {
    type: "treatments",
    slug: "meditation",
    heading: "Meditation",
    title: "Meditation in Midtown Toronto",
    description: null,
  },
  {
    type: "treatments",
    slug: "outdoor-sauna",
    heading: "Outdoor Sauna",
    title: "Outdoor Sauna in Midtown Toronto",
    description:
      "Outdoor sauna in the Recovery Sanctuary at Curate Health in Midtown Toronto. Heat therapy for recovery and a settled mind.",
  },
  {
    type: "service",
    slug: "recovery-sanctuary",
    heading: "Recovery Sanctuary",
    title: "Recovery Sanctuary in Midtown Toronto",
    description: null,
  },
  {
    type: "servicesHeroSection",
    slug: null,
    heading: "Our Services",
    title: "Health and Wellness Services Toronto",
    description: null,
  },

  /*
   * The products, which carried no geography at all. These are local-intent
   * searches in exactly the way a blog post is not: somebody looking for
   * custom orthotics or a knee brace needs to be fitted in person, so the
   * city belongs in the title.
   *
   * "Fitted" rather than "buy" throughout, per CH-010: these are fitted by a
   * practitioner rather than added to a basket, which is also why the Product
   * markup carries no Offer.
   */
  {
    type: "product",
    slug: "tens-machines",
    heading: "TENS Machines",
    title: "TENS Machines in Midtown Toronto",
    description:
      "TENS machines fitted at Curate Health in Midtown Toronto. Portable units for managing muscle and nerve pain at home.",
  },
  {
    type: "product",
    slug: "compression-stockings",
    heading: "Compression Stockings",
    title: "Compression Stockings in Midtown Toronto",
    description:
      "Compression stockings fitted at Curate Health in Midtown Toronto. Graduated support to improve circulation and relieve swelling.",
  },
  {
    type: "product",
    slug: "custom-foot-orthotics",
    heading: "Custom Foot Orthotics",
    title: "Custom Foot Orthotics in Midtown Toronto",
    description:
      "Custom foot orthotics fitted at Curate Health in Midtown Toronto. Made from your own assessment to support how you stand and walk.",
  },
  {
    type: "product",
    slug: "professional-grade-supplements",
    heading: "Professional Grade Supplements",
    // "in Midtown Toronto" would run to 64. The bare city fits.
    title: "Professional Grade Supplements Toronto",
    description: null,
  },
  {
    type: "product",
    slug: "custom-knee-braces",
    heading: "Custom Knee Braces",
    title: "Custom Knee Braces in Midtown Toronto",
    description:
      "Custom knee braces fitted at Curate Health in Midtown Toronto. Support and stability for recovery, and for returning to activity.",
  },
  {
    type: "productsPage",
    slug: null,
    heading: "Products",
    title: "Health Products in Midtown Toronto",
    description: null,
  },

  {
    type: "ourTeam",
    slug: null,
    heading: "Our Team",
    title: "Our Team in Midtown Toronto",
    description: null,
  },
  {
    type: "serviceLifestyle",
    slug: null,
    heading: "Curate Lifestyle",
    title: "Curate Lifestyle Program in Midtown Toronto",
    description: null,
  },
];

/*
 * /cafe IS DELIBERATELY NOT HERE.
 *
 * Its h1 is "Introducing Curate Cafe", so `titleMatchesHeading` requires the
 * title to carry "introducing", and "Introducing Curate Cafe in Midtown
 * Toronto" reads as badly as it sounds. Fixing it properly means changing the
 * heading, which is visible copy and Frank's call rather than a side effect of
 * a geo pass.
 *
 * It also loses least by waiting: its description already names Midtown
 * Toronto, and the cafe has its own Google listing, which is what answers a
 * local search for it. See CH-008.
 */

/* ------------------------------------------------------------------ checks */

/** Lifted from audit-metadata.js so a draft is held to the same rule. */
function significant(text) {
  const stop = new Set([
    "the", "and", "a", "an", "of", "for", "at", "in", "to", "our", "your",
    "with", "on", "by", "is", "are", "from",
  ]);
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stop.has(w));
}

function titleMatchesHeading(title, heading) {
  const headingWords = significant(heading);
  if (!headingWords.length) return true;
  const titleWords = new Set(significant(title));
  return headingWords.every((w) => titleWords.has(w));
}

/**
 * A rule-of-three list, which the content rules ban and no audit checks for,
 * because no regex can tell one from an ordinary list. This is deliberately
 * narrow: "a, b and c" between commas. It is a prompt to read the line, not a
 * verdict, so it prints rather than refusing.
 */
function looksLikeTricolon(text) {
  return /\b[\w'-]+(?:\s+[\w'-]+){0,3},\s+[\w'-]+(?:\s+[\w'-]+){0,3}\s+and\s+[\w'-]+/i.test(
    String(text || "")
  );
}

function checkCopy(label, value, { max, min }) {
  const problems = [];
  const notes = [];
  const length = value.length;

  if (length > max) problems.push(`${label} is ${length} of ${max}`);
  if (min && length < min) problems.push(`${label} is ${length}, under ${min}`);
  if (/[—–]/.test(value)) problems.push(`${label} carries a dash`);
  if (/!/.test(value)) problems.push(`${label} carries an exclamation mark`);
  if (/\p{Cf}/u.test(value)) problems.push(`${label} carries invisible characters`);

  const banned = findBanned ? findBanned(value) : [];
  if (banned && banned.length) problems.push(`${label} uses ${JSON.stringify(banned)}`);

  const american = findAmerican ? findAmerican(value) : [];
  if (american && american.length) problems.push(`${label} spells ${JSON.stringify(american)}`);

  if (looksLikeTricolon(value)) notes.push(`${label} reads as a rule of three`);

  return { problems, notes };
}

(async () => {
  const problems = [];
  const patches = [];

  for (const page of PAGES) {
    const doc = await query(
      page.slug
        ? `*[_type == $type && coalesce(treatmentSlug.current, slug.current) == $slug][0]{
             _id, _rev, title,
             "pageTitle": seo.pageTitle,
             "description": seo.pageDescription
           }`
        : `*[_type == $type][0]{
             _id, _rev, title,
             "pageTitle": seo.pageTitle,
             "description": seo.pageDescription
           }`,
      { type: page.type, slug: page.slug }
    );

    if (!doc) {
      problems.push(`${page.type}/${page.slug}: not found`);
      continue;
    }

    const rendered = page.title + BRAND_SUFFIX;
    // The singletons have no slug, so they are named by their type rather
    // than all printing as the same hard-coded path.
    const label = page.slug || page.type;

    console.log();
    console.log(`  ${label}   h1 "${page.heading}"`);
    console.log(`    was    ${JSON.stringify(doc.pageTitle)}`);
    console.log(`    now    ${JSON.stringify(rendered)}  (${rendered.length} of ${TITLE_MAX})`);

    const titleCheck = checkCopy("title", rendered, { max: TITLE_MAX });
    titleCheck.problems.forEach((p) => problems.push(`${label}: ${p}`));
    titleCheck.notes.forEach((n) => console.log(`    note   ${n}`));

    if (!titleMatchesHeading(rendered, page.heading)) {
      problems.push(
        `${label}: the title misses a significant word of the h1 "${page.heading}"`
      );
    }

    const set = { "seo.pageTitle": page.title };

    if (page.description) {
      console.log(`    desc was (${(doc.description || "").length}): ${doc.description}`);
      console.log(`    desc now (${page.description.length}): ${page.description}`);
      const d = checkCopy("description", page.description, {
        max: DESCRIPTION_MAX,
        min: DESCRIPTION_MIN,
      });
      d.problems.forEach((p) => problems.push(`${label}: ${p}`));
      d.notes.forEach((n) => console.log(`    note   ${n}`));
      set["seo.pageDescription"] = page.description;
    } else {
      console.log(`    desc   left alone, already names Midtown Toronto`);
    }

    patches.push({ patch: { id: doc._id, ifRevisionID: doc._rev, set } });
  }

  console.log();

  if (problems.length) {
    console.error("  REFUSED, nothing written:");
    problems.forEach((p) => console.error(`    ${p}`));
    process.exitCode = 1;
    return;
  }

  console.log(`  ${patches.length} document(s) check out.`);

  if (!APPLY) {
    console.log("  Dry run. Nothing written. Re-run with --apply.");
    return;
  }

  const result = await mutate(patches);
  console.log(`  Applied. Transaction ${result.transactionId}.`);
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exitCode = 1;
});
