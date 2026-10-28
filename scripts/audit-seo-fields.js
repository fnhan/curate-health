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
 * REQUIRED, because nothing else supplies them:
 *
 *   pageTitle                 What Google shows as the clickable line.
 *   pageDescription           The snippet underneath it.
 *   socialMeta.title          og:title and twitter:title.
 *   socialMeta.description    og:description and twitter:description.
 *
 * REPORTED, NOT REQUIRED, because an empty one is a working default:
 *
 *   socialMeta.ogImage        The picture on a Facebook, LinkedIn or Slack
 *   socialMeta.twitterImage   share, and on X.
 *
 * WHY THE IMAGES ARE NOT REQUIRED. FRANK, 2026-10-28
 *
 * They were, for two days, and the two days are worth recording because the
 * obvious fix was the wrong one.
 *
 * Every field on sanity/schemas/socialMeta.ts was `Rule.required().error()`,
 * and Sanity refuses Publish on an error, so one empty share image locked an
 * editor out of the whole document: not out of that field, out of fixing a
 * typo three fields away. Frank hit it on six documents. The first answer was
 * to fill all six with whatever the page was already rendering, and this file
 * was changed to require all eight fields.
 *
 * That froze six cards that were meant to move. The pages reaching the
 * fallback are precisely the ones whose card is DERIVED: /blog follows the
 * newest post, /about and /products follow their own hero, a post follows its
 * own photograph. His ruling: "use the newest post and not have it fixed on
 * the chard photo. Just simply make it so that studio doesn't require the
 * field to be a requirement to publish."
 *
 * So both images are warnings in the Studio now, all six documents are back on
 * their fallback, and an empty share image is a documented state rather than a
 * gap. The alt text is still an error, but only once an image is chosen, since
 * a required alt on an empty image would reinstate the block sideways.
 *
 * The four that remain required have only a static fallback, so an empty one
 * publishes something generic rather than something derived. `audit-metadata.js`
 * cannot see those either: it reads rendered pages, where the fallback has
 * already filled in. This is the only check that looks at the record.
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
];

/**
 * Reported so the list is visible, never failed. An empty one means the page
 * shares a photograph it already shows, which is the every-page rule working.
 * An image CHOSEN and left without alt is a real fault and is failed below.
 */
const OPTIONAL_IMAGES = [
  ["ogImage", "ogAltAny", "share image"],
  ["twitterImage", "twitterAltAny", "X image"],
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
  const altGaps = [];
  const onFallback = [];
  let clean = 0;

  for (const doc of documents) {
    // Alt can live on the asset or on the image field. Either counts.
    doc.ogAltAny = doc.ogAlt || doc.ogAltField;
    doc.twitterAltAny = doc.twitterAlt || doc.twitterAltField;

    const gaps = REQUIRED.filter(([key]) => blank(doc[key]));

    // A chosen image with no alt text is a fault; an empty image is not.
    for (const [imageKey, altKey, human] of OPTIONAL_IMAGES) {
      if (blank(doc[imageKey])) {
        onFallback.push(`${doc.name} (${human})`);
      } else if (blank(doc[altKey])) {
        gaps.push([altKey, `${human} alt text, on a chosen image`]);
        altGaps.push(doc.name);
      }
    }

    if (!gaps.length) {
      clean++;
      if (!verbose) continue;
    }

    const label = `${doc._type}  ${doc.name}${doc.slug ? `  (${doc.slug})` : ""}`;
    console.log(label);

    for (const [key, human] of gaps) {
      console.log(`  MISSING   ${human}`);
      if (missing.has(key)) missing.get(key).push(doc.name);
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
      for (const [imageKey, altKey, human] of OPTIONAL_IMAGES) {
        if (blank(doc[imageKey])) {
          console.log(
            `  fallback  ${human}: none chosen, so the page shares a photograph it already shows`
          );
        } else if (!blank(doc[altKey])) {
          console.log(
            `  ok        ${human}: chosen, alt ${JSON.stringify(String(doc[altKey]).slice(0, 60))}`
          );
        }
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
  console.log(`  ${String(altGaps.length).padStart(3)} chosen image with no alt text`);
  total += altGaps.length;

  console.log(
    `\n  ${onFallback.length} share image slot(s) are empty and share a photograph the page`
  );
  console.log(
    `  already shows. That is the every-page rule, not a gap, and it is how a`
  );
  console.log(
    `  derived card keeps following what it derives from: /blog the newest post,`
  );
  console.log(`  /about and /products their own hero, a post its own photograph.`);

  if (total) {
    console.log(
      `\n  The four required fields have only a static fallback, so an empty one`
    );
    console.log(
      `  publishes something generic. audit-metadata.js cannot see them: it reads`
    );
    console.log(`  rendered pages, where the fallback has already filled in.`);
  }

  /*
   * `process.exitCode`, never `process.exit()`. This script crashed Node on
   * the way out with "Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)"
   * and returned **127**, which every caller reads as failure, so a clean run
   * and a broken run were indistinguishable from a shell. Setting the code and
   * letting Node drain its handles exits properly.
   */
  process.exitCode = total ? 1 : 0;
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
