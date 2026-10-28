/**
 * Every page in the sitemap serves a complete share card, whatever the Studio
 * holds.
 *
 *   node scripts/audit-share-cards.js http://localhost:3000
 *   node scripts/audit-share-cards.js https://www.curatehealth.ca
 *   node scripts/audit-share-cards.js http://localhost:3000 --all
 *
 * Read-only. Exits 1 on a page missing any of the tags below, or whose share
 * image does not load.
 *
 * WHY THIS EXISTS, AND WHY audit-metadata.js IS NOT IT
 *
 * Frank, 2026-10-28, on making the Studio's share image optional: "can you
 * make sure that if those fields are not filled, that it will still be
 * represented through default settings of that page. I want to make sure that
 * we still optimize SEO and llm searches. This should be a rule throughout the
 * whole website. And every new page we make moving forward."
 *
 * Until that day both share images were `Rule.required().error()`, so in
 * practice every page had one and **fifteen routes passing no fallback went
 * unnoticed**, among them every treatment page, every service category, the
 * five About children, /contact and /cafe. They had a card only because an
 * editor could not publish without filling the field. The moment those became
 * warnings, clearing one would have stripped that page's card silently.
 *
 * Two things close it and they are different in kind:
 *
 *   the type   `buildPageMetadata` requires `image` on any indexed page, so
 *              TypeScript refuses a new page that skips it. That is the part
 *              that binds "every new page we make moving forward".
 *   this       proves the rendered output, which a type cannot: that the tag
 *              is present, that the picture actually loads, and which of the
 *              three sources it came from.
 *
 * `audit-metadata.js` fails a page with no `og:image`, so it overlaps here,
 * and deliberately: this one also reads WHERE the image came from, which is
 * the question Frank asked and the one a missing-tag check cannot answer. A
 * page on the house card is reported rather than failed, because that is a
 * working default and not a defect, but it is a page whose own photograph
 * nobody has chosen, so the list stays in front of somebody.
 */

const { query } = require("./lib/sanity-cli");

const TARGET = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const VERBOSE = process.argv.includes("--all");
const RULE = "=".repeat(78);

/** The house card in lib/page-metadata.ts. Kept in step by the check below. */
const SITE_SHARE_ASSET = "6dfb6e8c7b46336c007db415d1a447f197213e83";

/**
 * /about's own hero IS the house card's picture, so the two are the same URL
 * and nothing in the rendered page can tell them apart.
 *
 * That is deliberate rather than a coincidence: Frank asked on 2026-10-12 for
 * /about's share card and its hero to match, and the cork-mats photograph was
 * then the obvious choice for the site-wide default too. /about reaches it as
 * its own hero through `fallbacks.image`, never as the backstop, so counting
 * it as a page with no picture of its own would be wrong.
 *
 * Only this path. If the house card is ever pointed at a different asset,
 * delete this line rather than adding to it.
 */
const OWNS_THE_HOUSE_CARD_PICTURE = new Set(["/about"]);

/** Every tag a share card needs to render as a card rather than a bare link. */
const REQUIRED_TAGS = [
  "og:title",
  "og:description",
  "og:type",
  "og:site_name",
  "og:locale",
  "og:url",
  "og:image",
  "og:image:alt",
  "twitter:title",
  "twitter:description",
  "twitter:image",
];

function meta(html, prop) {
  const pattern = new RegExp(
    `<meta[^>]*(?:property|name)="${prop}"[^>]*content="([^"]*)"` +
      `|<meta[^>]*content="([^"]*)"[^>]*(?:property|name)="${prop}"`,
    "i"
  );
  const match = html.match(pattern);
  if (!match) return null;
  const raw = match[1] ?? match[2];
  return raw
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&apos;/g, "'");
}

/** The content hash inside a Sanity image URL, which identifies the file. */
function assetHash(url) {
  if (!url) return null;
  const match = url.match(/\/production\/([0-9a-f]{40})-/);
  return match ? match[1] : null;
}

/**
 * The source file's own dimensions, which Sanity writes into the filename.
 *
 * A source smaller than the card is upscaled to fill it and arrives soft. The
 * three legal pages were sharing a 180x180 PNG, the favicon, blown up 6.7
 * times, and every check passed it: the tag was present, the picture loaded,
 * and a picture had been chosen in the Studio, so nothing was technically
 * wrong. It was still a blurred icon wherever those links were pasted.
 */
function sourceSize(url) {
  if (!url) return null;
  const match = url.match(/\/production\/[0-9a-f]{40}-(\d+)x(\d+)\./);
  return match
    ? { width: Number(match[1]), height: Number(match[2]) }
    : null;
}

async function sitemapPaths() {
  const res = await fetch(`${TARGET}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml answered ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => new URL(m[1]).pathname)
    .sort();
}

/**
 * The share image each document holds in the Studio, so a rendered card can
 * be told apart from a fallback. Keyed by the asset hash, because that is the
 * only part of the URL that survives cropping to 1200x630.
 */
async function studioImages() {
  const rows = await query(`*[
    defined(seo.socialMeta.ogImage.asset) &&
    !(_id in path("drafts.**")) && !(_id in path("sanity.**"))
  ]{ "url": seo.socialMeta.ogImage.asset->url }`);
  return new Set(rows.map((r) => assetHash(r.url)).filter(Boolean));
}

async function main() {
  console.log(RULE);
  console.log(`Share cards on ${TARGET}`);
  console.log(RULE);

  const [paths, chosen] = await Promise.all([sitemapPaths(), studioImages()]);
  console.log(`${paths.length} pages in the sitemap\n`);

  const failures = [];
  const onHouseCard = [];
  const onPageFallback = [];
  const undersized = [];
  let fromStudio = 0;
  const imageChecked = new Map();

  for (const path of paths) {
    const res = await fetch(`${TARGET}${path}`);
    const html = await res.text();

    const gaps = [];

    if (!res.ok) {
      gaps.push(`page answered ${res.status}`);
    } else {
      for (const tag of REQUIRED_TAGS) {
        const value = meta(html, tag);
        if (!value || !value.trim()) gaps.push(`no ${tag}`);
      }
    }

    const image = meta(html, "og:image");
    const hash = assetHash(image);

    // Fetch each distinct picture once. A tag pointing at a 404 is a bare
    // card with extra steps, which is the thing this is here to prevent.
    if (image && !imageChecked.has(image)) {
      let ok = false;
      try {
        const head = await fetch(image, { method: "HEAD" });
        ok = head.ok;
      } catch {
        ok = false;
      }
      imageChecked.set(image, ok);
    }
    if (image && imageChecked.get(image) === false) {
      gaps.push("og:image does not load");
    }

    /*
     * Two thresholds, because "smaller than the card" covers two different
     * problems and only one of them is a failure.
     *
     *   under 200x200    Facebook and LinkedIn refuse the image outright, so
     *                    the link renders with no picture at all. A failure.
     *   under 1200x630   it renders, as a soft upscale, and on most platforms
     *                    as the small thumbnail rather than the wide card.
     *                    Reported, because fixing it needs a bigger
     *                    photograph that may simply not exist, and a gate
     *                    nobody can turn green is a gate people stop reading.
     *
     * Read off the SOURCE dimensions in the filename, not the served width,
     * which is always 1200 because that is what was asked for.
     */
    const size = sourceSize(image);
    if (size && (size.width < 200 || size.height < 200)) {
      gaps.push(
        `og:image source is ${size.width}x${size.height}, below the 200x200 platforms accept`
      );
    } else if (size && (size.width < 1200 || size.height < 630)) {
      undersized.push(`${path}  ${size.width}x${size.height}`);
    }

    let source;
    if (!image) {
      source = "none";
    } else if (
      hash === SITE_SHARE_ASSET &&
      !chosen.has(SITE_SHARE_ASSET) &&
      !OWNS_THE_HOUSE_CARD_PICTURE.has(path)
    ) {
      source = "house card";
    } else if (hash && chosen.has(hash)) {
      source = "Studio";
    } else {
      source = "page fallback";
    }

    if (source === "house card") onHouseCard.push(path);
    else if (source === "page fallback") onPageFallback.push(path);
    else if (source === "Studio") fromStudio++;

    if (gaps.length) {
      failures.push({ path, gaps });
      console.log(`FAIL  ${path}`);
      gaps.forEach((g) => console.log(`        ${g}`));
    } else if (VERBOSE) {
      console.log(`ok    ${path.padEnd(52)} ${source}`);
    }
  }

  console.log(`\n${RULE}`);
  console.log(
    `${paths.length - failures.length} of ${paths.length} pages serve a complete share card\n`
  );
  console.log(`  ${String(fromStudio).padStart(3)} from a picture chosen in the Studio`);
  console.log(
    `  ${String(onPageFallback.length).padStart(3)} from a photograph the page already shows`
  );
  console.log(`  ${String(onHouseCard.length).padStart(3)} from the house card`);

  if (onHouseCard.length) {
    console.log(
      `\n  On the house card, so no photograph of their own has been chosen:`
    );
    onHouseCard.forEach((p) => console.log(`    ${p}`));
    console.log(
      `  Not a failure. A legal page has nothing to illustrate it; a page that`
    );
    console.log(`  does is worth a picture when somebody has one.`);
  }

  if (undersized.length) {
    console.log(
      `\n  ${undersized.length} page(s) share a picture smaller than the 1200x630 card,`
    );
    console.log(`  so it is upscaled and most platforms show the small thumbnail:`);
    undersized.forEach((u) => console.log(`    ${u}`));
    console.log(`  Not a failure. Fixing one needs a bigger photograph.`);
  }

  if (failures.length) {
    console.log(`\n  ${failures.length} page(s) failed. A page here is one whose`);
    console.log(`  link renders as a bare rectangle wherever it is pasted.`);
  }

  process.exitCode = failures.length ? 1 : 0;
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
