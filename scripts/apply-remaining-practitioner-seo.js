/**
 * The two practitioner meta descriptions that were never written.
 *
 *   node scripts/apply-remaining-practitioner-seo.js            # dry run
 *   node scripts/apply-remaining-practitioner-seo.js --apply
 *
 * Five of seven practitioners got their SEO fields on 2026-09-19. Dr. Nhan was
 * held because the description he had written was 174 characters against the
 * Studio's 160 limit, and that draft is not recorded anywhere, so it could not
 * be trimmed, only rewritten. Safa Karoumi's was simply never done.
 *
 * Both pages were running on the code fallback, "Dr. Frank Nhan, Doctor of
 * Chiropractic at Curate Health in Midtown Toronto.", which passes the audit at
 * 75 characters and says almost nothing.
 *
 * Frank chose Dr. Nhan's wording on 2026-10-12, from three options, and asked
 * for Safa's to follow the house pattern the other five use:
 *
 *   {Name} is a {role} at Curate Health in Midtown Toronto.
 *   Book a {service} appointment with {first name} online.
 *
 * Dr. Nhan's departs from it on purpose: he holds four credentials and the
 * pattern only has room for one, so his names all four and gives up the call to
 * action.
 *
 * SAFA'S PAGE IS SWITCHED OFF AND THIS IS STILL WORTH WRITING
 *
 * "Show on website" has been off since 2026-09-17, so /about/our-team/safa-
 * karoumi is a 404 and was removed from Google by hand. Writing the field now
 * changes nothing a visitor sees and means there is nothing to remember when
 * she is switched back on. The Search Console steps in CLAUDE.md still apply at
 * that point.
 *
 * Only `seo.pageDescription` is written. The share title, share description and
 * share image are still empty on both records, and the page title falls back to
 * the name and credential. Those are a separate decision.
 */

const { query, mutate } = require("./lib/sanity-cli");
const { findBanned, findAmerican } = require("./lib/content-rules");

const DESCRIPTIONS = {
  "Dr. Frank Nhan":
    "Dr. Frank Nhan is a chiropractor and acupuncture provider at Curate Health in Midtown Toronto, also a strength and conditioning specialist and yoga teacher.",
  "Safa Karoumi":
    "Safa Karoumi is a registered psychotherapist (qualifying) at Curate Health in Midtown Toronto. Book a psychotherapy appointment with Safa online.",
};

/** The Studio's own limit, and what Google shows. */
const LIMIT = 160;

function check(name, text) {
  const problems = [];
  if (text.length > LIMIT) problems.push(`${text.length} chars, over ${LIMIT}`);
  for (const h of findBanned(text)) problems.push(`banned: ${h.rule}`);
  for (const h of findAmerican(text)) problems.push(`american: ${h.rule}`);
  if (/[–—]/.test(text)) problems.push("dash");
  if (text.includes("!")) problems.push("exclamation mark");
  if (problems.length) {
    console.error(`  ${name}: ${problems.join(", ")}`);
    return false;
  }
  console.log(`  ${name}: ${text.length} chars, rules pass`);
  return true;
}

async function main() {
  const apply = process.argv.includes("--apply");

  console.log("Content rules\n");
  let clean = true;
  for (const [n, t] of Object.entries(DESCRIPTIONS)) clean = check(n, t) && clean;
  if (!clean) {
    console.error("\nRefusing to write.");
    process.exit(1);
  }

  const rows = await query(
    `*[_type == "practitioner" && name in $names]{_id, _rev, name, isActive,
      "current": seo.pageDescription}`,
    { names: Object.keys(DESCRIPTIONS) }
  );

  console.log("\nRecords\n");
  const mutations = [];
  for (const r of rows) {
    const want = DESCRIPTIONS[r.name];
    if (r.current === want) {
      console.log(`  ${r.name}: already set`);
      continue;
    }
    console.log(`  ${r.name}${r.isActive === false ? "  [switched off]" : ""}`);
    console.log(`    before: ${r.current ? JSON.stringify(r.current) : "(empty, page runs on the code fallback)"}`);
    console.log(`    after:  ${JSON.stringify(want)}`);
    mutations.push({
      patch: {
        id: r._id,
        ifRevisionID: r._rev,
        set: { "seo.pageDescription": want },
      },
    });
  }

  const missing = Object.keys(DESCRIPTIONS).filter(
    (n) => !rows.some((r) => r.name === n)
  );
  if (missing.length) {
    console.error(`\nNo practitioner record named: ${missing.join(", ")}`);
    process.exit(2);
  }

  if (!mutations.length) return console.log("\nNothing to write.");
  if (!apply) return console.log(`\n${mutations.length} patches. Dry run.`);
  const r = await mutate(mutations);
  console.log(`\nApplied ${mutations.length}. Transaction ${r.transactionId || "(none)"}`);
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
