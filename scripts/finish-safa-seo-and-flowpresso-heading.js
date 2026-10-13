/**
 * Safa Karoumi's complete SEO set, and the Flowpresso benefit heading.
 *
 *   node scripts/finish-safa-seo-and-flowpresso-heading.js            # dry run
 *   node scripts/finish-safa-seo-and-flowpresso-heading.js --apply
 *
 * SAFA, WRITTEN WHILE SHE IS SWITCHED OFF
 *
 * Frank asked on 2026-10-12 for the whole set rather than the description
 * alone, "so when we turn it on, it's already there". Her page is a 404 while
 * "Show on website" is off, so none of this is visible and none of it changes
 * what a visitor sees today. The Search Console steps in CLAUDE.md still apply
 * when the switch goes back on.
 *
 * Every value follows the shape the other five practitioners already use:
 * `seo.socialMeta.title` repeats `seo.pageTitle`, `socialMeta.description`
 * repeats `pageDescription`, and both share images are the person's own photo
 * with no crop and the hotspot `{x: 0.5, y: 0.3, width: 1, height: 0.6}`. That
 * y of 0.3 is the one that matters: centred, a 1200x630 band through a portrait
 * cuts the face in half.
 *
 * The alt text was written from the photograph, which was fetched and looked
 * at, per the CH-028 note. It is a portrait rather than the action shots the
 * others carry, because that is what her photograph is.
 *
 * ONE THING FOR SAFA TO CONFIRM, AND IT IS A REGULATORY POINT
 *
 * CRPO authorises "Registered Psychotherapist (Qualifying)" and the
 * abbreviation "RP (Qualifying)". The full form is 53 characters, and with
 * "| Curate Health" costing 15 of the 60 Google shows, a page title has 45. So
 * the title here reads "Psychotherapist (Qualifying)", which keeps the
 * qualifying class visible and claims no full registration, but drops
 * "Registered". **The description carries the designation in full**, so the
 * snippet as a whole is complete. If Safa wants the exact title, "Safa Karoumi,
 * RP (Qualifying)" fits at 44 and is the authorised abbreviation.
 *
 * THE FLOWPRESSO HEADING
 *
 * "State-of-the-Art Technology" sat over the sentence corrected earlier today
 * to "an FDA cleared Class II medical device". Two problems. It is hype against
 * the tone rule, the same category as the "cutting-edge" removed from the
 * sentence below it. And a 510(k) clearance is a finding of substantial
 * equivalence to a device already on the market, so the heading claimed
 * novelty in the same breath the body conceded equivalence.
 *
 * Frank chose "Medical-Grade Technology" on 2026-10-12. Hyphenated, because it
 * is a compound modifier before a noun and the content rules allow those.
 */

const { query, mutate } = require("./lib/sanity-cli");
const { findBanned, findAmerican } = require("./lib/content-rules");

const SAFA = {
  name: "Safa Karoumi",
  pageTitle: "Safa Karoumi, Psychotherapist (Qualifying)",
  pageDescription:
    "Safa Karoumi is a registered psychotherapist (qualifying) at Curate Health in Midtown Toronto. Book a psychotherapy appointment with Safa online.",
  photoAlt:
    "Safa Karoumi in a white collared shirt and round glasses, photographed outdoors under a leafy tree.",
};

/** The share crop every other practitioner uses. */
const SHARE_CROP = { _type: "sanity.imageCrop", top: 0, bottom: 0, left: 0, right: 0 };
const SHARE_HOTSPOT = { _type: "sanity.imageHotspot", x: 0.5, y: 0.3, width: 1, height: 0.6 };

const HEADING_BEFORE = "State-of-the-Art Technology";
const HEADING_AFTER = "Medical-Grade Technology";

/** 60 including "| Curate Health", which costs 15. */
const TITLE_BUDGET = 45;
const DESCRIPTION_LIMIT = 160;

function check(label, text, limit) {
  const problems = [];
  if (limit && text.length > limit) problems.push(`${text.length} chars, over ${limit}`);
  for (const h of findBanned(text)) problems.push(`banned: ${h.rule}`);
  for (const h of findAmerican(text)) problems.push(`american: ${h.rule}`);
  if (/[–—]/.test(text)) problems.push("dash");
  if (text.includes("!")) problems.push("exclamation mark");
  for (const m of text.matchAll(/\p{Cf}/gu)) problems.push(`Cf at ${m.index}`);
  if (problems.length) {
    console.error(`  ${label}: ${problems.join(", ")}`);
    return false;
  }
  console.log(`  ${label}: ${text.length} chars, rules pass`);
  return true;
}

async function main() {
  const apply = process.argv.includes("--apply");

  console.log("Content rules\n");
  let clean = true;
  clean = check("page title", SAFA.pageTitle, TITLE_BUDGET) && clean;
  clean = check("page description", SAFA.pageDescription, DESCRIPTION_LIMIT) && clean;
  clean = check("photo alt", SAFA.photoAlt) && clean;
  clean = check("flowpresso heading", HEADING_AFTER) && clean;
  if (!clean) {
    console.error("\nRefusing to write.");
    process.exit(1);
  }

  const mutations = [];

  // --- Safa ---
  const [safa] = await query(
    `*[_type == "practitioner" && name == $name]{_id, _rev, isActive,
      "photoRef": photo.asset._ref, seo}`,
    { name: SAFA.name }
  );
  if (!safa) throw new Error("no practitioner record for " + SAFA.name);
  if (!safa.photoRef) throw new Error("no photo on " + SAFA.name);

  const shareImage = {
    _type: "image",
    asset: { _type: "reference", _ref: safa.photoRef },
    crop: SHARE_CROP,
    hotspot: SHARE_HOTSPOT,
    alt: SAFA.photoAlt,
  };

  const set = {
    "seo.pageTitle": SAFA.pageTitle,
    "seo.pageDescription": SAFA.pageDescription,
    "seo.socialMeta.title": SAFA.pageTitle,
    "seo.socialMeta.description": SAFA.pageDescription,
    "seo.socialMeta.ogImage": shareImage,
    "seo.socialMeta.twitterImage": shareImage,
  };

  console.log(`\n${SAFA.name}${safa.isActive === false ? "  [switched off]" : ""}`);
  const m = (safa.seo && safa.seo.socialMeta) || {};
  for (const [path, value] of Object.entries(set)) {
    const currentTop = path.split(".").slice(1);
    const current =
      currentTop.length === 1
        ? safa.seo && safa.seo[currentTop[0]]
        : m[currentTop[1]];
    const show = (v) =>
      v == null ? "(empty)" : typeof v === "string" ? JSON.stringify(v) : "(image)";
    console.log(`  ${path}`);
    console.log(`    before: ${show(current)}`);
    console.log(`    after:  ${show(value)}`);
  }
  mutations.push({ patch: { id: safa._id, ifRevisionID: safa._rev, set } });

  // --- the Flowpresso heading ---
  const treatments = await query(
    `*[_type == "treatments" && defined(benefits.benefitsList)]{_id, _rev, benefits}`
  );
  for (const t of treatments) {
    const i = (t.benefits.benefitsList || []).findIndex(
      (b) => b.title === HEADING_BEFORE
    );
    if (i < 0) continue;
    const path = `benefits.benefitsList[${i}].title`;
    console.log(`\n${t._id}  ${path}`);
    console.log(`  before: ${HEADING_BEFORE}`);
    console.log(`  after:  ${HEADING_AFTER}`);
    mutations.push({
      patch: { id: t._id, ifRevisionID: t._rev, set: { [path]: HEADING_AFTER } },
    });
  }

  if (!apply) return console.log(`\n${mutations.length} patches. Dry run.`);
  const r = await mutate(mutations);
  console.log(`\nApplied ${mutations.length}. Transaction ${r.transactionId || "(none)"}`);
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
