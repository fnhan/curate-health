/**
 * Audits the SEO object on every document in Sanity that backs a page.
 *
 *   node scripts/audit-seo-fields.js            summary
 *   node scripts/audit-seo-fields.js --all      every field on every document
 *
 * Read-only. Exits 1 if any required field is empty.
 *
 * WHY THIS IS SEPARATE FROM scripts/audit-metadata.js
 *
 * That one reads rendered HTML, which is the right way to catch what a visitor
 * and a crawler actually get. It cannot tell an empty field from one filled by
 * a fallback: app/services/[slug]/page.tsx substitutes a generic title and
 * description whenever seo.pageTitle is missing, so the page looks fine and
 * the field is still blank.
 *
 * This reads the source instead, so an unfilled field is visible as unfilled.
 * Run both.
 *
 * WHAT IT CHECKS
 *
 *   pageTitle                 What Google shows as the clickable line.
 *   pageDescription           The snippet underneath it.
 *   socialMeta.ogImage        The picture on a Facebook, LinkedIn or Slack
 *                             share. Without it the platform picks something
 *                             or shows nothing.
 *   socialMeta.ogImage alt    Read out by screen readers, and it is the only
 *                             text description of that image anywhere.
 *   socialMeta.twitterImage   The same for X.
 *   socialMeta.twitterImage alt
 *
 * socialMeta.title and socialMeta.description are reported but not required.
 * SEO_QUERY does not select them, so nothing renders them today: og:title and
 * twitter:title both come from pageTitle. They are worth knowing about because
 * a future query change would suddenly start publishing whatever is in them,
 * which is how the "Flowpesso" typo survived in one of them for months.
 */

const { query } = require("./lib/sanity-cli");

const RULE = "=".repeat(78);

/** Document types that back a page and carry an seo object. */
const QUERY = `*[
  defined(seo) && !(_id in path("drafts.**")) && !(_id in path("sanity.**"))
]{
  _id,
  _type,
  "name": coalesce(title, name, "(untitled)"),
  "slug": coalesce(slug.current, treatmentSlug.current),
  "pageTitle": seo.pageTitle,
  "pageDescription": seo.pageDescription,
  "socialTitle": seo.socialMeta.title,
  "socialDescription": seo.socialMeta.description,
  "ogImage": seo.socialMeta.ogImage.asset->url,
  "ogAlt": seo.socialMeta.ogImage.asset->alt,
  "ogAltField": seo.socialMeta.ogImage.alt,
  "twitterImage": seo.socialMeta.twitterImage.asset->url,
  "twitterAlt": seo.socialMeta.twitterImage.asset->alt,
  "twitterAltField": seo.socialMeta.twitterImage.alt
} | order(_type asc, name asc)`;

const REQUIRED = [
  ["pageTitle", "page title"],
  ["pageDescription", "meta description"],
  ["ogImage", "share image"],
  ["ogAltAny", "share image alt text"],
  ["twitterImage", "X image"],
  ["twitterAltAny", "X image alt text"],
];

function blank(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

async function main() {
  const verbose = process.argv.includes("--all");
  const documents = await query(QUERY);

  console.log(RULE);
  console.log("SEO fields in Sanity");
  console.log(RULE);
  console.log(`${documents.length} documents carry an seo object\n`);

  const missing = new Map(REQUIRED.map(([key]) => [key, []]));
  let clean = 0;

  for (const doc of documents) {
    // Alt can live on the asset or on the image field. Either counts.
    doc.ogAltAny = doc.ogAlt || doc.ogAltField;
    doc.twitterAltAny = doc.twitterAlt || doc.twitterAltField;

    const gaps = REQUIRED.filter(([key]) => blank(doc[key]));

    if (!gaps.length) {
      clean++;
      if (!verbose) continue;
    }

    const label = `${doc._type}  ${doc.name}${doc.slug ? `  (${doc.slug})` : ""}`;
    console.log(label);

    for (const [key, human] of gaps) {
      console.log(`  MISSING   ${human}`);
      missing.get(key).push(doc.name);
    }

    if (verbose) {
      for (const [key] of REQUIRED) {
        if (!blank(doc[key])) {
          const value = String(doc[key]);
          console.log(
            `  ok        ${key}: ${JSON.stringify(value.slice(0, 70))}`
          );
        }
      }
      if (!blank(doc.socialTitle)) {
        console.log(
          `  note      socialMeta.title is set but nothing renders it: ${JSON.stringify(doc.socialTitle)}`
        );
      }
      if (!blank(doc.socialDescription)) {
        console.log(
          `  note      socialMeta.description is set but nothing renders it`
        );
      }
    }

    console.log("");
  }

  console.log(RULE);
  console.log(
    `${clean} of ${documents.length} documents have every required field filled\n`
  );

  let total = 0;
  for (const [key, human] of REQUIRED) {
    const list = missing.get(key);
    total += list.length;
    console.log(`  ${String(list.length).padStart(3)} missing ${human}`);
  }

  const socialSet = documents.filter(
    (d) => !blank(d.socialTitle) || !blank(d.socialDescription)
  );
  if (socialSet.length) {
    console.log(
      `\n  ${socialSet.length} document(s) have socialMeta title or description filled in.`
    );
    console.log(
      `  Nothing renders those: SEO_QUERY does not select them, and og:title`
    );
    console.log(`  and twitter:title both come from pageTitle instead.`);
  }

  process.exit(total ? 1 : 0);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
