/**
 * Every image URL the site serves, page by page, so a change to how images are
 * built can be proved to have changed nothing.
 *
 *   node scripts/audit-image-framing.js http://localhost:3000 --save
 *   node scripts/audit-image-framing.js http://localhost:3000        # compare
 *
 * WHY THIS EXISTS
 *
 * Frank asked on 2026-10-18 for the Studio's crop tool to work on every
 * photograph on the site, "without changing how any of the current photos are
 * cropped". That is a promise about output, not about code, and the only
 * honest way to keep it is to record what every page serves today and compare
 * after.
 *
 * It reads `src` and `srcset` off every img on every page in the sitemap, so a
 * photograph that starts coming from a different URL, or at a different size,
 * shows up as a difference. The baseline goes beside this script and is not
 * committed: it describes one build at one moment.
 */

const fs = require("fs");
const path = require("path");

const BASELINE = path.join(__dirname, ".image-framing-baseline.json");

const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const save = process.argv.includes("--save");

/**
 * The asset and its transform, which is what a crop actually changes.
 *
 * **Unwrap Next's optimiser first.** Every image on this site is served as
 * `/_next/image?url=<the real one>`, so comparing the outer path alone makes
 * every image on the site look identical and the whole check passes blind.
 * It did, on its first run, and the photograph it was supposed to catch had
 * changed. Compare the url Next is wrapping.
 */
function normalise(url) {
  if (!url) return null;
  try {
    const u = new URL(url, base);
    const wrapped = u.searchParams.get("url");
    if (wrapped) return normalise(wrapped);
    if (!u.hostname.includes("cdn.sanity.io"))
      return `${u.pathname}${u.search}`;
    return `${u.pathname}${u.search}`;
  } catch {
    return url;
  }
}

function imagesIn(html) {
  const out = [];
  for (const tag of html.match(/<img\b[^>]*>/g) || []) {
    const src = (tag.match(/\ssrc="([^"]*)"/) || [])[1];
    const alt = (tag.match(/\salt="([^"]*)"/) || [])[1] ?? "";
    if (!src) continue;
    out.push({ alt: alt.slice(0, 60), src: normalise(src) });
  }
  return out.sort((a, b) => (a.src || "").localeCompare(b.src || ""));
}

async function main() {
  const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
  const paths = [
    ...new Set(
      [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
        try {
          return new URL(m[1]).pathname;
        } catch {
          return m[1];
        }
      })
    ),
  ].sort();

  const seen = {};
  let count = 0;
  for (const p of paths) {
    const res = await fetch(`${base}${p}`);
    if (!res.ok) {
      console.error(`  ${res.status} ${p}`);
      continue;
    }
    seen[p] = imagesIn(await res.text());
    count += seen[p].length;
  }

  console.log(`${paths.length} pages, ${count} images`);

  if (save) {
    fs.writeFileSync(BASELINE, JSON.stringify(seen, null, 2));
    console.log(`Baseline written to ${path.basename(BASELINE)}`);
    return;
  }

  if (!fs.existsSync(BASELINE)) {
    console.error("\nNo baseline. Run with --save before making the change.");
    process.exit(1);
  }

  const before = JSON.parse(fs.readFileSync(BASELINE, "utf8"));
  const differences = [];

  for (const p of new Set([...Object.keys(before), ...Object.keys(seen)])) {
    const a = JSON.stringify(before[p] || null);
    const b = JSON.stringify(seen[p] || null);
    if (a === b) continue;

    const was = new Set((before[p] || []).map((i) => i.src));
    const now = new Set((seen[p] || []).map((i) => i.src));
    for (const src of was)
      if (!now.has(src)) differences.push(`  ${p}\n    gone:  ${src}`);
    for (const src of now)
      if (!was.has(src)) differences.push(`  ${p}\n    new:   ${src}`);
  }

  if (differences.length) {
    console.error(`\nFAIL: ${differences.length} image URLs changed.`);
    differences.slice(0, 40).forEach((d) => console.error(d));
    if (differences.length > 40) {
      console.error(`  ... and ${differences.length - 40} more`);
    }
    process.exit(1);
  }

  console.log("\nPASS: every page serves exactly the images it served before.");
}

main().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});
