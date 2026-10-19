/**
 * Everything a visitor and a crawler see, page by page, so a change to the
 * framework can be proved to have changed nothing.
 *
 *   node scripts/audit-render-baseline.js http://localhost:3000 --save
 *   node scripts/audit-render-baseline.js http://localhost:3000        # compare
 *
 * WHY THIS EXISTS
 *
 * Frank gave the go-ahead for CH-118, the Next.js 16 upgrade, on 2026-10-19,
 * asking that it not disturb anything currently on the site. That is a promise
 * about output, not about code. A framework major changes how pages are
 * rendered, routed and cached, and almost all of that is invisible in a diff:
 * the source can be correct and a page still lose its canonical, reorder its
 * structured data or drop a paragraph.
 *
 * So this records what every page in the sitemap actually serves today, and
 * compares after. It is the same idea as audit-image-framing.js, which covers
 * images only, widened to the things the every-page rule in CLAUDE.md is
 * about: status, title, description, canonical, share card, headings,
 * structured data, the words on the page, the images, and the links out.
 *
 * It deliberately does NOT compare script and stylesheet URLs. Those carry a
 * build hash that changes on every build, upgrade or not, so including them
 * would make the check cry wolf and get ignored.
 *
 * The baseline sits beside this script and is not committed: it describes one
 * build at one moment.
 */

const fs = require("fs");
const path = require("path");

const BASELINE = path.join(__dirname, ".render-baseline.json");

const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
const save = process.argv.includes("--save");
const verbose = process.argv.includes("--verbose");

const strip = (s) =>
  String(s == null ? "" : s)
    .replace(/\s+/g, " ")
    .trim();

/** Text with the tags taken out, which is what a reader and an answer engine get. */
function visibleText(html) {
  return strip(
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#x27;|&#39;/g, "'")
  );
}

/**
 * Unwrap Next's image optimiser, per the lesson in audit-image-framing.js:
 * every image here is served as /_next/image?url=<the real one>, so comparing
 * the outer path makes every image look identical and the check passes blind.
 */
function normaliseImage(url) {
  if (!url) return null;
  let u = String(url).trim();
  const m = u.match(/\/_next\/image\?([^"'\s]+)/);
  if (m) {
    const q = new URLSearchParams(m[1]);
    const inner = q.get("url");
    if (inner) {
      // keep the quality, which Next 16 changes the default of
      const quality = q.get("q") || "";
      u = decodeURIComponent(inner) + (quality ? `  q=${quality}` : "");
    }
  }
  /*
   * A locally imported asset is served as /_next/static/media/NAME.HASH.ext,
   * and the hash is the bundler's, not the file's: Turbopack and Webpack
   * compute it differently, so every one of them changes on a bundler change
   * while the image is byte for byte the same. Drop it, for the same reason
   * script and stylesheet urls are left out of this check entirely.
   */
  u = u.replace(
    /(\/_next\/static\/media\/[^/?"']+?)\.[A-Za-z0-9_-]{6,}(\.[a-z0-9]+)$/,
    "$1$2"
  );
  // Sanity urls carry the transform in the query, which is the part that matters
  return u.replace(/^https?:\/\//, "");
}

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`, "i")) ||
    tag.match(new RegExp(`${name}\\s*=\\s*'([^']*)'`, "i"));
  return m ? m[1] : null;
};

function metaByName(html, which, value) {
  const re = new RegExp(`<meta[^>]*${which}\\s*=\\s*["']${value}["'][^>]*>`, "i");
  const m = html.match(re);
  return m ? strip(attr(m[0], "content")) : null;
}

function capture(html, status) {
  const titleM = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const canonM = html.match(/<link[^>]*rel\s*=\s*["']canonical["'][^>]*>/i);

  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) =>
    strip(visibleText(m[1]))
  );
  const h2s = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) =>
    strip(visibleText(m[1]))
  );

  // structured data, with keys sorted so a reordering is not reported as a change
  const sortKeys = (v) => {
    if (Array.isArray(v)) return v.map(sortKeys);
    if (v && typeof v === "object") {
      const o = {};
      for (const k of Object.keys(v).sort()) o[k] = sortKeys(v[k]);
      return o;
    }
    return v;
  };
  const jsonLd = [...html.matchAll(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => {
      try {
        return JSON.stringify(sortKeys(JSON.parse(m[1])));
      } catch {
        return "UNPARSEABLE: " + strip(m[1]).slice(0, 120);
      }
    })
    .sort();

  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)]
    .map((m) => {
      const src = normaliseImage(attr(m[0], "src"));
      const alt = attr(m[0], "alt");
      return src ? `${src}  |alt=${alt === null ? "(MISSING)" : strip(alt)}` : null;
    })
    .filter(Boolean)
    .sort();

  // internal links only: an external one can change for reasons that are not ours
  const links = [...html.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["']/gi)]
    .map((m) => m[1])
    .filter((h) => h.startsWith("/") || h.includes("curatehealth.ca"))
    .map((h) => h.replace(/^https?:\/\/(www\.)?curatehealth\.ca/, "").split("#")[0])
    .filter(Boolean);

  const text = visibleText(html);

  return {
    status,
    title: titleM ? strip(visibleText(titleM[1])) : null,
    description: metaByName(html, "name", "description"),
    canonical: canonM ? attr(canonM[0], "href") : null,
    robots: metaByName(html, "name", "robots"),
    ogTitle: metaByName(html, "property", "og:title"),
    ogDescription: metaByName(html, "property", "og:description"),
    ogImage: normaliseImage(metaByName(html, "property", "og:image")),
    ogImageAlt: metaByName(html, "property", "og:image:alt"),
    ogType: metaByName(html, "property", "og:type"),
    ogUrl: metaByName(html, "property", "og:url"),
    h1s,
    h2count: h2s.length,
    jsonLd,
    images: imgs,
    linkCount: links.length,
    uniqueLinks: [...new Set(links)].sort(),
    textLength: text.length,
    textHead: text.slice(0, 400),
    textTail: text.slice(-400),
  };
}

async function fetchPage(url) {
  try {
    const res = await fetch(url, { redirect: "manual" });
    if (res.status >= 300 && res.status < 400) {
      return { status: res.status, location: res.headers.get("location") };
    }
    const html = await res.text();
    return { ...capture(html, res.status) };
  } catch (e) {
    return { status: 0, error: e.message };
  }
}

(async () => {
  const smRes = await fetch(`${base}/sitemap.xml`);
  if (!smRes.ok) throw new Error(`sitemap.xml answered ${smRes.status}`);
  const sm = await smRes.text();
  const paths = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].replace(/^https?:\/\/[^/]+/, "") || "/")
    .sort();

  // the routes that produce no page of their own, which the every-page rule still covers
  const extra = ["/llms.txt", "/robots.txt", "/rss.xml", "/sitemap.xml"];

  const now = {};
  for (const p of paths) now[p] = await fetchPage(`${base}${p}`);
  for (const p of extra) {
    const res = await fetch(`${base}${p}`).catch(() => null);
    const body = res ? await res.text() : "";
    /*
     * lastmod is new Date() at request time, so it differs between any two
     * requests and says nothing about a change to the site.
     */
    const stable = strip(body).replace(/<lastmod>[^<]*<\/lastmod>/gi, "<lastmod/>");
    now[p] = { status: res ? res.status : 0, textLength: stable.length, body: stable };
  }

  if (save) {
    fs.writeFileSync(BASELINE, JSON.stringify({ base, at: new Date().toISOString(), pages: now }, null, 1));
    console.log(`Baseline saved: ${paths.length} pages plus ${extra.length} feeds, from ${base}`);
    console.log(path.relative(process.cwd(), BASELINE));
    return;
  }

  if (!fs.existsSync(BASELINE)) {
    console.error("No baseline. Run with --save against the build you are comparing to first.");
    process.exit(2);
  }
  const before = JSON.parse(fs.readFileSync(BASELINE, "utf8")).pages;

  const gone = Object.keys(before).filter((p) => !(p in now));
  const added = Object.keys(now).filter((p) => !(p in before));
  const changed = [];

  for (const p of Object.keys(now)) {
    if (!(p in before)) continue;
    const a = before[p], b = now[p];
    const fields = [...new Set([...Object.keys(a), ...Object.keys(b)])];
    const diffs = [];
    for (const f of fields) {
      const x = JSON.stringify(a[f]), y = JSON.stringify(b[f]);
      if (x !== y) diffs.push({ field: f, before: a[f], after: b[f] });
    }
    if (diffs.length) changed.push({ path: p, diffs });
  }

  console.log(`${Object.keys(now).length} addresses checked against the baseline taken ${JSON.parse(fs.readFileSync(BASELINE, "utf8")).at}\n`);

  if (gone.length) { console.log(`GONE (${gone.length}):`); gone.forEach((p) => console.log("  " + p)); console.log(""); }
  if (added.length) { console.log(`NEW (${added.length}):`); added.forEach((p) => console.log("  " + p)); console.log(""); }

  if (!changed.length && !gone.length && !added.length) {
    console.log("Nothing changed. Every page serves what it served before.");
    return;
  }

  console.log(`CHANGED (${changed.length} of ${Object.keys(now).length}):\n`);
  for (const c of changed) {
    console.log(`  ${c.path}`);
    for (const d of c.diffs) {
      const show = (v) => {
        const s = typeof v === "string" ? v : JSON.stringify(v);
        if (s == null) return "(none)";
        return s.length > (verbose ? 100000 : 220) ? s.slice(0, verbose ? 100000 : 220) + " ..." : s;
      };
      console.log(`     ${d.field}`);
      console.log(`       was: ${show(d.before)}`);
      console.log(`       now: ${show(d.after)}`);
    }
    console.log("");
  }
  process.exit(1);
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(2);
});
