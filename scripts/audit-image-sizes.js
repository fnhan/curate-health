/**
 * CH-007 acceptance check: every next/image on a rendered page carries both a
 * `sizes` and a `srcset` attribute.
 *
 *   node scripts/audit-image-sizes.js                          # localhost:3000
 *   node scripts/audit-image-sizes.js http://localhost:3111
 *   node scripts/audit-image-sizes.js https://www.curatehealth.ca
 *   node scripts/audit-image-sizes.js --bytes                  # also weigh them
 *
 * Exits 0 when every image is covered, 1 when any is not.
 *
 * WHY THIS FETCHES PAGES AND DOES NOT GREP THE SOURCE
 *
 * A `sizes` prop in the JSX only becomes a srcset if next/image is what ends up
 * rendering that element. A source grep counts the prop and cannot tell you
 * whether the browser was ever offered a choice, which is the only thing that
 * changes what gets downloaded.
 *
 * It also cannot tell you the value is right. A `sizes` that is too small is
 * worse than no `sizes` at all: the browser picks a candidate narrower than the
 * space it actually paints and the photo renders blurry, while the grep still
 * reports the image as fixed. --bytes is the check for that, since a candidate
 * that drops to almost nothing is usually one whose `sizes` understates the
 * layout.
 */

const DEFAULT_BASE = "http://localhost:3000";

/**
 * A cross-section, not a crawl: one page per template. Every image on the site
 * comes from one of these components, so a template that regressed shows up
 * here, and a 44 page crawl would mostly re-check the same four layouts.
 */
const PAGES = [
  "/",
  "/our-programs",
  "/services",
  "/services/rehab",
  "/services/recovery-sanctuary/flowpresso-therapy",
  "/about/our-story",
  "/about/our-team",
  "/blog",
  "/cafe",
  "/contact",
  "/products/custom-foot-orthotics",
];

/** What a real browser sends, so the optimiser returns webp rather than the original. */
const IMAGE_ACCEPT = "image/avif,image/webp,image/*";

const IMG_TAG = /<img\b[^>]*>/gi;

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`${name}="([^"]*)"`, "i"));
  return m ? m[1] : null;
};

/**
 * Vercel Deployment Protection answers 200 on its SSO page, so a script that
 * counts elements reports "0 found" rather than failing. That reads like a page
 * with nothing on it instead of a page you were never shown, so check for it
 * explicitly rather than trusting a zero.
 */
async function fetchPage(url) {
  const res = await fetch(url, { redirect: "manual" });

  if (res.status >= 300 && res.status < 400) {
    const location = res.headers.get("location") || "";
    if (location.includes("sso-api") || location.includes("vercel.com/login")) {
      throw new Error(
        `${url} is behind Vercel Deployment Protection. Verify on a local dev server instead, or add a Protection Bypass for Automation token.`
      );
    }
    return fetchPage(new URL(location, url).toString());
  }

  return { status: res.status, html: await res.text() };
}

async function weigh(url) {
  const res = await fetch(url, { headers: { accept: IMAGE_ACCEPT } });
  return (await res.arrayBuffer()).byteLength;
}

/** Candidates a 390px phone at DPR 2 can choose between for a full-width image. */
const PHONE_TARGET_WIDTH = 780;

async function main() {
  const args = process.argv.slice(2);
  const withBytes = args.includes("--bytes");
  const base = (args.find((a) => !a.startsWith("--")) || DEFAULT_BASE).replace(
    /\/$/,
    ""
  );

  let images = 0;
  let covered = 0;
  let widest = 0;
  let phone = 0;
  let weighed = 0;
  const uncovered = [];

  for (const page of PAGES) {
    const { status, html } = await fetchPage(base + page);
    const tags = (html.match(IMG_TAG) || []).filter((t) =>
      (attr(t, "src") || "").includes("/_next/image")
    );

    let pageCovered = 0;

    for (const tag of tags) {
      images++;
      const sizes = attr(tag, "sizes");
      const srcset = attr(tag, "srcset");

      if (sizes && srcset) {
        covered++;
        pageCovered++;
      } else {
        uncovered.push(
          `${page}  sizes=${sizes ?? "MISSING"}  srcset=${srcset ? "present" : "MISSING"}  ${decodeURIComponent(attr(tag, "src") || "").slice(0, 80)}`
        );
      }

      // Only the first few per page. This fetches real image bytes, and
      // weighing every image on every page turns a check into a download.
      if (
        withBytes &&
        srcset &&
        weighed < 3 * PAGES.length &&
        pageCovered <= 3
      ) {
        const candidates = srcset
          .split(",")
          .map((s) => s.trim().split(/\s+/))
          .map(([u, w]) => ({
            u: u.replace(/&amp;/g, "&"),
            w: Number(w.replace("w", "")),
          }))
          .filter((c) => c.u && c.w);

        if (candidates.length) {
          const largest = candidates[candidates.length - 1];
          const chosen =
            candidates.find((c) => c.w >= PHONE_TARGET_WIDTH) || largest;
          widest += await weigh(base + largest.u);
          phone += await weigh(base + chosen.u);
          weighed++;
        }
      }
    }

    console.log(
      `${status} ${page.padEnd(48)} images=${String(tags.length).padStart(2)}  covered=${String(pageCovered).padStart(2)}`
    );
  }

  console.log(
    `\nnext/image tags: ${images}   with sizes and srcset: ${covered}`
  );

  if (withBytes && weighed) {
    const mb = (b) => (b / 1024 / 1024).toFixed(2);
    console.log(
      `\n${weighed} images weighed:  ${mb(widest)} MB widest candidate  ->  ${mb(phone)} MB at phone width`
    );
  }

  if (uncovered.length) {
    console.log(`\n${uncovered.length} without a sizes hint:`);
    uncovered.forEach((u) => console.log("  " + u));
    process.exit(1);
  }

  if (!images) {
    console.log("\nNo next/image tags found at all. That is not a pass.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
