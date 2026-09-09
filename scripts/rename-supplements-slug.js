/**
 * Renames the supplements product slug, fixing the typo in its address.
 *
 *   node scripts/rename-supplements-slug.js            dry run
 *   node scripts/rename-supplements-slug.js --apply    writes
 *
 *   /products/profession-grade-supplements
 *   /products/professional-grade-supplements
 *
 * The page could not agree with itself about the name of the thing it sells:
 * heading "Profession Grade Supplements", title "Professional Grade
 * Supplements", URL "profession-grade". The heading and title are fixed as
 * content. This is the URL.
 *
 * RUN THE CODE FIRST. THIS CHECKS THAT YOU DID.
 *
 * The Sanity dataset is shared by every deployment, so this rename is live on
 * the real site the instant it is applied, while the alias that redirects the
 * old URL only exists once the branch is merged and deployed.
 *
 * Apply this before that deploy and /products/profession-grade-supplements
 * 404s in the gap. That is not hypothetical: it is precisely what happened to
 * the acupuncture URL, which sat on 404 for two weeks because a slug change
 * shipped ahead of its redirect.
 *
 * So --apply refuses to run until it has fetched the new URL from production
 * and seen it resolve. A timeline is not evidence. The check is.
 */

const { mutate, query } = require("./lib/sanity-cli");

const RULE = "=".repeat(78);

const OLD_SLUG = "profession-grade-supplements";
const NEW_SLUG = "professional-grade-supplements";
const BASE = process.env.CURATE_BASE_URL || "https://www.curatehealth.ca";

/**
 * Is the alias live?
 *
 * Asks for the new URL. Before the deploy no product has that slug and the
 * route has no alias for it either, so it 404s. After the deploy the alias
 * exists, so the same URL redirects to the old one, which still resolves. A
 * 301 or a 200 both mean the code that protects the old URL is in place; a
 * 404 means it is not.
 */
async function aliasIsDeployed() {
  const url = `${BASE}/products/${NEW_SLUG}`;

  try {
    const response = await fetch(url, { redirect: "manual" });
    const location = response.headers.get("location") || "";

    console.log(`  GET ${url}`);
    console.log(`      ${response.status}${location ? ` -> ${location}` : ""}`);

    return response.status !== 404;
  } catch (error) {
    console.log(`  GET ${url} failed: ${error.message}`);

    return false;
  }
}

async function main() {
  const apply = process.argv.includes("--apply");

  console.log(RULE);
  console.log("Supplements slug");
  console.log(RULE);

  const doc = await query(
    `*[_type == "product" && slug.current == $slug && !(_id in path("drafts.**"))][0]{_id, title, "slug": slug.current}`,
    { slug: OLD_SLUG }
  );

  if (!doc) {
    const already = await query(
      `*[_type == "product" && slug.current == $slug && !(_id in path("drafts.**"))][0]{_id}`,
      { slug: NEW_SLUG }
    );

    if (already) {
      console.log("Already renamed. Nothing to do.");
      return;
    }

    console.error(`NOT FOUND: no product with slug ${OLD_SLUG}`);
    process.exit(2);
  }

  console.log(`\n  ${doc.title}`);
  console.log(`  was: /products/${OLD_SLUG}`);
  console.log(`  now: /products/${NEW_SLUG}`);

  console.log(`\n${RULE}`);
  console.log("PRECONDITION: is the redirect deployed?");

  const deployed = await aliasIsDeployed();

  if (!deployed) {
    console.log(
      `\n  Not yet. ${BASE} still 404s the new URL, which means the alias in\n` +
        `  lib/service-urls.ts has not shipped. Applying now would take the old\n` +
        `  URL to 404 until it does.`
    );
  } else {
    console.log(
      `\n  Yes. The alias is serving, so the old URL keeps working after the\n` +
        `  rename rather than dying in the gap.`
    );
  }

  console.log(`\n${RULE}`);

  if (!apply) {
    console.log("Dry run. Nothing written.");
    return;
  }

  if (!deployed) {
    console.error("Refusing to apply: merge and deploy the branch first.");
    process.exit(3);
  }

  const result = await mutate([
    { patch: { id: doc._id, set: { "slug.current": NEW_SLUG } } },
  ]);

  console.log(`Applied. Transaction ${result.transactionId}`);
  console.log(
    `\nCheck both, the old one should 301 and the new one should 200:\n` +
      `  ${BASE}/products/${OLD_SLUG}\n` +
      `  ${BASE}/products/${NEW_SLUG}`
  );
}

main().catch((error) => {
  console.error(`\n${error.message}`);
  process.exit(1);
});
