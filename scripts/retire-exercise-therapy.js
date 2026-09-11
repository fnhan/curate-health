/**
 * Switches off the retired Exercise Therapy treatment page.
 *
 *   node scripts/retire-exercise-therapy.js            dry run
 *   node scripts/retire-exercise-therapy.js --apply    writes
 *
 * Frank, 2026-09-11: "Take out old Exercise Therapy page."
 *
 * WHY IT WAS STILL SHOWING
 *
 * The treatment was switched on, but it hangs off Lifestyle Medicine, a
 * category retired in the restructure. Its addresses already forward to
 * Movement & Training, so nobody could reach the page itself. The sitemap and
 * site search both only checked the treatment's own switch, never its
 * category's, so each kept offering an address that forwards somewhere else.
 *
 * Both of those checks were fixed in code in #220, which covers any category
 * switched off in future. This switches the treatment itself off as well, so
 * the Studio shows the truth about it too.
 *
 * NOT DELETED
 *
 * Switching it off takes it off the site completely: sitemap, search, and the
 * treatment route, which only serves active treatments. The document and its
 * copy stay in Sanity, so it can be read or brought back. Deleting it would
 * gain nothing a visitor could see and could not be undone from the Studio.
 *
 * The redirects are untouched and must stay. /services/exercise-therapy and
 * /services/lifestyle-medicine/exercise-therapy were indexed, and they keep
 * sending anyone who arrives there to Movement & Training.
 */

const { mutate, query } = require("./lib/sanity-cli");

const RULE = "=".repeat(78);
const SLUG = "exercise-therapy";
const BASE = process.env.CURATE_BASE_URL || "https://www.curatehealth.ca";

async function main() {
  const apply = process.argv.includes("--apply");

  console.log(RULE);
  console.log("Retire the Exercise Therapy treatment page");
  console.log(RULE);

  const doc = await query(
    `*[_type == "treatments" && treatmentSlug.current == $slug && !(_id in path("drafts.**"))][0]{
      _id, _rev, title, isActive, "category": service->title, "categoryActive": service->isActive
    }`,
    { slug: SLUG }
  );

  if (!doc) {
    console.error(`NOT FOUND: treatment ${SLUG}`);
    process.exit(2);
  }

  console.log(`\n  ${doc.title}, under ${doc.category}`);
  console.log(`    treatment switched on: ${doc.isActive}`);
  console.log(`    category switched on:  ${doc.categoryActive}`);

  // The addresses must keep forwarding. Check before and after, not just trust
  // that they do: switching the treatment off must not turn a redirect into a
  // 404 for anyone following an old link.
  for (const path of [
    `/services/${SLUG}`,
    `/services/lifestyle-medicine/${SLUG}`,
  ]) {
    const r = await fetch(`${BASE}${path}`, { redirect: "manual" });
    console.log(
      `    ${path}  ${r.status} -> ${r.headers.get("location") || "-"}`
    );
  }

  if (doc.isActive === false) {
    console.log("\nAlready switched off.");
    return;
  }

  console.log(`\n${RULE}`);

  if (!apply) {
    console.log("Dry run. Nothing written.");
    return;
  }

  const result = await mutate([
    {
      patch: { id: doc._id, ifRevisionID: doc._rev, set: { isActive: false } },
    },
  ]);

  console.log(`Applied. Transaction ${result.transactionId}`);
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  process.exit(1);
});
