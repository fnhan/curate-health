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
 *   socialMeta.title          og:title and twitter:title.
 *   socialMeta.description    og:description and twitter:description.
 *   socialMeta.ogImage        The picture on a Facebook, LinkedIn or Slack
 *                             share. Without it the platform picks something
 *                             or shows nothing.
 *   socialMeta.ogImage alt    Read out by screen readers, and it is the only
 *                             text description of that image anywhere.
 *   socialMeta.twitterImage   The same for X.
 *   socialMeta.twitterImage alt
 *
 * ALL EIGHT ARE REQUIRED, AND THE REASON CHANGED ON 2026-10-26
 *
 * The first six were required because an empty one costs the page something a
 * visitor sees. socialMeta.title and socialMeta.description used to be
 * reported and not required, on the reasoning that SEO_QUERY did not select
 * them so nothing rendered them. Both halves of that are now out of date:
 * SEO_QUERY selects them and buildPageMetadata publishes them.
 *
 * The harder reason is the Studio. Every field on sanity/schemas/socialMeta.ts
 * is `Rule.required().error()`, and Sanity refuses Publish on an error, so one
 * empty share field locks an editor out of the whole document: not just out of
 * that field, out of fixing a typo three fields away. Frank hit it on
 * 2026-10-26 and ruled that these are filled whenever a page is produced.
 *
 * So a gap here is not a missed optimisation, it is an editor who cannot
 * publish. `scripts/audit-metadata.js` cannot see it, because the rendered
 * page looks right: buildPageMetadata substitutes a photo the page already
 * shows. This is the only check that looks.
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
  ["socialTitle", "share title"],
  ["socialDescription", "share description"],
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

  if (total) {
    console.log(
      `\n  A gap here is an editor locked out of that document: every socialMeta`
    );
    console.log(
      `  field is Rule.required().error(), so Sanity refuses Publish until it is`
    );
    console.log(
      `  filled. The rendered page still looks right, because buildPageMetadata`
    );
    console.log(`  substitutes a photo the page already shows.`);
  }

  process.exit(total ? 1 : 0);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
