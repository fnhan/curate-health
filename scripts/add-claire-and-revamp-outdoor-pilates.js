/**
 * Claire Kim's record, and the Outdoor Pilates page.
 *
 *   node scripts/add-claire-and-revamp-outdoor-pilates.js            # dry run
 *   node scripts/add-claire-and-revamp-outdoor-pilates.js --apply
 *
 * CLAIRE IS CREATED SWITCHED OFF, AND SHE HAS NO PHOTOGRAPH
 *
 * Frank asked on 2026-09-14 to keep her off the site until she was up and
 * running, and on 2026-10-13 sent her bio and booking link. The record is built
 * now with `isActive: false`, the same way Safa's SEO was written while she was
 * off, so switching her on is one click.
 *
 * **She cannot go on the team page until there is a photograph.** The hub
 * renders a fixed 300px frame per card and an empty one is a hole in the grid,
 * so the `ourTeam.teamMembers` entry is deliberately not added here. That is
 * the remaining half of CH-030.
 *
 * "Pilates Instructor", not "STOTT PILATES Instructor Trainer", by Frank's
 * decision: "some may not know what that is or may not look for that
 * specifically". The STOTT training stays in the bio, where it reads as
 * provenance rather than jargon.
 *
 * `commonlyTreatsLabel` is "Class focus", as Rooj's is. Claire is a Pilates
 * instructor rather than a regulated health professional, and "Commonly treats"
 * over a list of class focuses would read as a clinical claim nobody made.
 *
 * The focus list leads with what every class covers and puts her particular
 * areas after, deliberately. Frank's note on 2026-10-13: "let's not try to
 * pigeonhole what the class is good for, as some people who don't have these
 * conditions may not want to come."
 *
 * THE OUTDOOR PILATES PAGE
 *
 * It was entirely benefit language. Nothing on it said how many people are in a
 * class, what happens when it rains, what to bring, or who teaches it, and
 * those are the questions a search actually asks. Flat facts also outrank
 * adjectives for an answer engine, which quotes text rather than reading
 * markup.
 *
 * **The practical copy is folded into the existing section rather than given
 * one of its own.** `AlternatingSections` renders
 * `src={sectionImage?.image || ""}`, so a section with no photograph publishes
 * a bare `<img>` with an empty source. That is the defect recorded under
 * CH-028, and the library has no usable second photograph: the only two
 * candidates are a watermarked stock beach and a screenshot of a sauna. Give
 * this page a second real photograph and the practical copy can become its own
 * section.
 *
 * The two benefit rewrites are Claire's own, trimmed. Her copies came from an
 * older version of the page: the em dash she flagged in "philosophy-supporting"
 * went in the dash sweep on 2026-10-11.
 *
 * Housekeeping in the same pass: `title` was "Outdoor Pilates " with a trailing
 * space, which CH-009 already records as breaking the breadcrumb check, one
 * benefit title carried two trailing spaces, three subtitles began with one,
 * and the section ended with an empty block.
 */

const crypto = require("crypto");
const { query, mutate } = require("./lib/sanity-cli");
const { findBanned, findAmerican } = require("./lib/content-rules");

const key = () => crypto.randomBytes(6).toString("hex");

const block = (text) => ({
  _key: key(),
  _type: "block",
  style: "normal",
  markDefs: [],
  children: [{ _key: key(), _type: "span", marks: [], text }],
});

const lead = (boldText, rest) => ({
  _key: key(),
  _type: "block",
  style: "normal",
  markDefs: [],
  children: [
    { _key: key(), _type: "span", marks: ["strong"], text: boldText },
    { _key: key(), _type: "span", marks: [], text: rest },
  ],
});

// ----------------------------------------------------------------- Claire

const CLAIRE_BIO = [
  "Claire Kim is a STOTT PILATES® Instructor Trainer whose approach to movement is rooted in precision, curiosity, and a deep respect for how the body moves as a whole.",
  "Claire's relationship with movement has evolved through years of exploring Pilates, running, strength training, yoga, ballet, and boxing. With an educational background in Nutrition, Health and Wellness, she was drawn to Pilates for its unique ability to connect anatomy and movement with mindful, intentional practice. She completed her STOTT PILATES® Comprehensive training in 2020 and has since developed her career as both an instructor and educator.",
  "Now a STOTT PILATES® Instructor Trainer, Claire teaches across a range of settings, from group and private sessions to instructor education. Her work is informed by a strong understanding of functional anatomy, biomechanics, and movement programming, while remaining grounded in the individuality of the person in front of her.",
  "At Curate Health, Claire offers both group Pilates classes and one-on-one private sessions. Her group classes combine thoughtful sequencing, clear and precise instruction, and an approachable energy, creating an environment where clients can challenge themselves while staying connected to their own bodies. For those looking for a more individualized approach, Claire's private sessions are tailored to each client's movement needs, abilities, and goals, with a particular focus on pre- and postnatal Pilates, active aging, and working with clients with osteoporosis.",
  "Claire believes effective movement does not need to be complicated. Her teaching emphasizes quality over quantity, helping clients develop greater body awareness, control, strength, mobility, and confidence through purposeful movement. Rather than simply guiding clients through exercises, she encourages them to understand what they are doing, why they are doing it, and how their bodies respond.",
  "For Claire, teaching is ultimately about sharing a practice she genuinely loves. She finds the greatest reward in helping people discover that movement can be intelligent and challenging, while still feeling joyful, empowering, and uniquely their own.",
];

const CLAIRE_DESCRIPTION =
  "Claire Kim teaches Pilates at Curate Health in Midtown Toronto, in small outdoor classes in the Recovery Sanctuary and in one-on-one sessions.";

const CLAIRE = {
  _id: "practitioner-claire-kim",
  _type: "practitioner",
  name: "Claire Kim",
  slug: { _type: "slug", current: "claire-kim" },
  isActive: false,
  credentials: ["Pilates Instructor"],
  languages: ["English", "Korean"],
  commonlyTreatsLabel: "Class focus",
  commonlyTreats: [
    "Posture and alignment",
    "Core strength and control",
    "Mobility and balance",
    "Prenatal Pilates",
    "Postnatal recovery",
    "Active aging",
    "Osteoporosis and bone health",
  ],
  janeBookingUrl:
    "https://curatehealth.janeapp.com/#/discipline/22/treatment/78",
  fullBio: CLAIRE_BIO.map((t) => block(t)),
  seo: {
    _type: "seo",
    pageTitle: "Claire Kim, Pilates Instructor",
    pageDescription: CLAIRE_DESCRIPTION,
    socialMeta: {
      _type: "socialMeta",
      title: "Claire Kim, Pilates Instructor",
      description: CLAIRE_DESCRIPTION,
    },
  },
};

// --------------------------------------------------- the Outdoor Pilates page

const PAGE = {
  title: "Outdoor Pilates",
  seoTitle: "Outdoor Pilates Classes Toronto",
  seoDescription:
    "Mat Pilates in the Recovery Sanctuary at Curate Health in Midtown Toronto. Small outdoor classes of up to 12, and one-on-one sessions, at any level.",
  benefits: {
    "Sessions Tailored to Your Needs":
      "Whether you prefer slow, controlled progressions or more dynamic sequences, each class can be adapted to your individual strength and mobility goals.",
    "Holistic Movement Approach":
      "Outdoor Pilates integrates with Curate Health's whole-body philosophy, supporting strength, mobility and body awareness while connecting you to the space around you.",
  },
};

/** Appended to the one section the page has, since a new one needs a photo. */
const PRACTICAL = [
  lead(
    "In a class: ",
    "Groups run to a maximum of 12, so you are seen rather than lost in a room. The Recovery Sanctuary sits under a pergola that closes when it rains, and when the weather is against us altogether the class moves indoors to our gym space.",
  ),
  lead(
    "What to bring: ",
    "Workout clothes, and layers you can add or peel off to suit the weather that day. Mats are here.",
  ),
  lead(
    "One-on-one sessions: ",
    "Claire also teaches privately, built around what you are working on rather than a class plan. That suits anyone returning to movement, working around a condition, or wanting the detail a group cannot give.",
  ),
];

// ------------------------------------------------------------------- checks

function ruleCheck(label, text) {
  const problems = [];
  for (const h of findBanned(text)) problems.push(`banned: ${h.rule}`);
  for (const h of findAmerican(text)) problems.push(`american: ${h.rule}`);
  if (/[–—]/.test(text)) problems.push("dash");
  if (text.includes("!")) problems.push("exclamation mark");
  if (/café/i.test(text)) problems.push("accented cafe");
  if (/outdoor terrace/i.test(text)) problems.push("outdoor terrace");
  for (const m of text.matchAll(/\p{Cf}/gu)) problems.push(`Cf at ${m.index}`);
  if (text !== text.trim()) problems.push("leading or trailing whitespace");
  if (problems.length) {
    console.error(`  ${label}: ${problems.join(", ")}`);
    return false;
  }
  return true;
}

const flatten = (blocks) =>
  blocks.map((b) => b.children.map((c) => c.text).join("")).join("\n");

async function main() {
  const apply = process.argv.includes("--apply");

  console.log("Content rules\n");
  let clean = true;
  clean = ruleCheck("Claire bio", CLAIRE_BIO.join("\n")) && clean;
  clean = ruleCheck("Claire title", CLAIRE.seo.pageTitle) && clean;
  clean = ruleCheck("Claire description", CLAIRE.seo.pageDescription) && clean;
  for (const f of CLAIRE.commonlyTreats) {
    clean = ruleCheck(`focus "${f}"`, f) && clean;
  }
  clean = ruleCheck("page title", PAGE.seoTitle) && clean;
  clean = ruleCheck("page description", PAGE.seoDescription) && clean;
  for (const [k, v] of Object.entries(PAGE.benefits)) {
    clean = ruleCheck(`benefit "${k}"`, v) && clean;
  }
  clean = ruleCheck("practical copy", flatten(PRACTICAL)) && clean;
  if (!clean) {
    console.error("\nRefusing to write.");
    process.exit(1);
  }
  console.log("  all pass");
  console.log(
    `\n  page title with brand: ${(PAGE.seoTitle + " | Curate Health").length} of 60`,
  );
  console.log(`  page description:      ${PAGE.seoDescription.length} of 155`);
  console.log(
    `  Claire title w/ brand: ${(CLAIRE.seo.pageTitle + " | Curate Health").length} of 60`,
  );
  console.log(
    `  Claire description:    ${CLAIRE.seo.pageDescription.length} of 155`,
  );

  // ---- Claire
  const existing = await query(
    `*[_type == "practitioner" && name == "Claire Kim"]{_id}`,
  );
  console.log(
    `\nClaire Kim: ${existing.length ? "record exists, leaving it alone" : "creating, switched off, no photograph"}`,
  );
  if (!existing.length) {
    console.log(`  credentials: ${JSON.stringify(CLAIRE.credentials)}`);
    console.log(`  languages:   ${JSON.stringify(CLAIRE.languages)}`);
    console.log(
      `  ${CLAIRE.commonlyTreatsLabel}: ${CLAIRE.commonlyTreats.join(", ")}`,
    );
    console.log(`  booking:     ${CLAIRE.janeBookingUrl}`);
    console.log(
      `  bio:         ${CLAIRE_BIO.length} paragraphs, ${CLAIRE_BIO.join(" ").split(/\s+/).length} words`,
    );
  }

  // ---- the page
  const [t] = await query(
    `*[_type == "treatments" && treatmentSlug.current == "outdoor-pilates"]{_id,_rev,title,benefits,additionalSections,seo,practitioners}`,
  );
  if (!t) throw new Error("no outdoor-pilates treatment");

  const set = {};
  if (t.title !== PAGE.title) {
    console.log(
      `\ntitle: ${JSON.stringify(t.title)} -> ${JSON.stringify(PAGE.title)}`,
    );
    set.title = PAGE.title;
  }
  if (t.seo && t.seo.pageTitle !== PAGE.seoTitle) {
    console.log(
      `seo.pageTitle: ${JSON.stringify(t.seo.pageTitle)}\n            -> ${JSON.stringify(PAGE.seoTitle)}`,
    );
    set["seo.pageTitle"] = PAGE.seoTitle;
  }
  if (t.seo && t.seo.pageDescription !== PAGE.seoDescription) {
    console.log(
      `seo.pageDescription: ${JSON.stringify(t.seo.pageDescription)}\n                  -> ${JSON.stringify(PAGE.seoDescription)}`,
    );
    set["seo.pageDescription"] = PAGE.seoDescription;
  }

  // benefits: trim every title and subtitle, and take Claire's two rewrites
  const benefitsList = (t.benefits.benefitsList || []).map((b) => {
    const title = (b.title || "").trim();
    const subtitle =
      PAGE.benefits[title] !== undefined
        ? PAGE.benefits[title]
        : (b.subtitle || "").trim();
    if (title !== b.title || subtitle !== b.subtitle) {
      console.log(`\nbenefit ${JSON.stringify(b.title)}`);
      if (title !== b.title) console.log(`  title    -> ${JSON.stringify(title)}`);
      if (subtitle !== b.subtitle) {
        console.log(`  subtitle -> ${JSON.stringify(subtitle)}`);
      }
    }
    return Object.assign({}, b, { title, subtitle });
  });
  set.benefits = Object.assign({}, t.benefits, {
    title: (t.benefits.title || "").trim(),
    benefitsList,
  });

  // The one section, with the empty trailing block dropped and the practical
  // copy appended. Written whole, per the CH-028 note.
  const sections = (t.additionalSections || []).map((s, i) => {
    if (i !== 0) return s;
    const kept = (s.sectionParagraph || []).filter(
      (b) =>
        (b.children || [])
          .map((c) => c.text)
          .join("")
          .trim() !== "",
    );
    const dropped = (s.sectionParagraph || []).length - kept.length;
    if (dropped) console.log(`\nsection: dropped ${dropped} empty block(s)`);
    console.log(`section: appending ${PRACTICAL.length} practical blocks`);
    return Object.assign({}, s, { sectionParagraph: kept.concat(PRACTICAL) });
  });
  set.additionalSections = sections;

  const alreadyListed = (t.practitioners || []).some(
    (p) => p._ref === CLAIRE._id,
  );
  if (!alreadyListed) {
    console.log(
      `\npractitioners: adding Claire (was ${(t.practitioners || []).length} listed)`,
    );
    set.practitioners = (t.practitioners || []).concat([
      { _key: key(), _type: "reference", _ref: CLAIRE._id },
    ]);
  }

  if (!apply) {
    console.log("\nDry run. Nothing written.");
    return;
  }

  const mutations = [];
  if (!existing.length) mutations.push({ createIfNotExists: CLAIRE });
  mutations.push({ patch: { id: t._id, ifRevisionID: t._rev, set } });
  const r = await mutate(mutations);
  console.log(
    `\nApplied ${mutations.length}. Transaction ${r.transactionId || "(none)"}`,
  );
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
