/**
 * Audits the metadata on every page of the live site.
 *
 *   node scripts/audit-metadata.js                        production
 *   node scripts/audit-metadata.js http://localhost:3000  a local build
 *
 * Read-only. Exits 1 if anything fails.
 *
 * WHY THIS EXISTS
 *
 * Frank spotted that the Outdoor Cold Plunge page had a heading reading
 * "Outdoor Cold Plunge" and a browser tab still reading "Cold Plunge". The tab
 * title is what Google shows in its results and what an AI summarising the
 * page leads with, so the two drifting apart means the version people actually
 * see is the stale one. Renaming a page in Sanity changes `title`, and nothing
 * makes `seo.pageTitle` follow.
 *
 * That is a class of defect, not one page, so this checks all of them.
 *
 * WHAT IT CHECKS, AND WHY EACH ONE MATTERS
 *
 *   Title present            No title means Google writes its own. CH-024.
 *   Title length             Over 60 characters gets truncated in results.
 *   Brand not doubled        The layout appends "| Curate Health", so a stored
 *                            title ending in the brand renders it twice. CH-006.
 *   Title matches the H1     The drift Frank found. A heading and a tab title
 *                            describing different things means one is wrong.
 *   Exactly one H1           Zero leaves the page's subject unstated, more than
 *                            one leaves it ambiguous. CH-011.
 *   Description present      Missing means Google invents a snippet. CH-024.
 *   Description length       Over 155 characters is cut mid-sentence.
 *   Description unique       Two pages sharing one is the copy-paste class of
 *                            error in CH-033.
 *   Title unique             Same reasoning.
 *   og and twitter titles    They are what a shared link shows. Should agree
 *                            with the page title.
 *   Canonical                Currently absent everywhere. CH-003.
 *   Banned words             The content rules apply to meta text too.
 *
 * The H1 comparison is deliberately loose. It asks whether the first
 * meaningful words of the heading appear in the title, not whether the strings
 * match. "Outdoor Cold Plunge" against "Cold Plunge Treatment & Services"
 * fails that, which is the point. "Physiotherapy" against "Physiotherapy
 * Toronto | Curate Health" passes, which is also the point.
 */

const DEFAULT_BASE = "https://www.curatehealth.ca";

const BRAND = "Curate Health";
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 155;

const BANNED = [
  "journey",
  "dive in",
  "unlock",
  "elevate",
  "harness the power of",
  "complimentary",
  "transformative",
  "seamless",
];

function decode(value) {
  return (value || "")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&apos;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tagText(html, tag) {
  const matches = [
    ...html.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "gi")),
  ];

  return matches.map((m) => decode(m[1].replace(/<[^>]+>/g, " ")));
}

function meta(html, key) {
  const patterns = [
    new RegExp(`<meta[^>]*name="${key}"[^>]*content="([^"]*)"`, "i"),
    new RegExp(`<meta[^>]*content="([^"]*)"[^>]*name="${key}"`, "i"),
    new RegExp(`<meta[^>]*property="${key}"[^>]*content="([^"]*)"`, "i"),
    new RegExp(`<meta[^>]*content="([^"]*)"[^>]*property="${key}"`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decode(match[1]);
  }

  return null;
}

/** Words worth comparing. Drops filler that appears in every title. */
function significant(text) {
  const stop = new Set([
    "the",
    "and",
    "a",
    "an",
    "of",
    "for",
    "at",
    "in",
    "to",
    "our",
    "your",
    "with",
    "treatment",
    "treatments",
    "services",
    "service",
    "curate",
    "health",
    "toronto",
  ]);

  return decode(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stop.has(w));
}

/**
 * Does the title describe the same thing as the heading?
 *
 * Loose on purpose: every significant word of the heading has to appear
 * somewhere in the title. Extra words in the title are fine, that is what a
 * title is for.
 */
function titleMatchesHeading(title, heading) {
  const headingWords = significant(heading);
  if (!headingWords.length) return true;

  const titleWords = new Set(significant(title));

  return headingWords.every((w) => titleWords.has(w));
}

async function collectUrls(base) {
  const response = await fetch(`${base}/sitemap.xml`);
  const xml = await response.text();
  const locs = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);

  const paths = new Set(["/"]);
  for (const loc of locs) {
    try {
      paths.add(new URL(loc).pathname || "/");
    } catch {
      /* ignore a malformed entry, the sitemap audit is a separate ticket */
    }
  }

  return [...paths].sort();
}

async function main() {
  const base = (process.argv[2] || DEFAULT_BASE).replace(/\/$/, "");
  const paths = await collectUrls(base);

  console.log(`Auditing ${paths.length} pages on ${base}\n`);

  const pages = [];
  const problems = [];

  for (const path of paths) {
    const response = await fetch(`${base}${path}`, { redirect: "manual" });

    if (response.status !== 200) {
      problems.push({
        path,
        severity: "REDIRECT",
        detail: `sitemap lists this but it returns ${response.status}${
          response.headers.get("location")
            ? ` -> ${response.headers.get("location")}`
            : ""
        }`,
      });
      continue;
    }

    const html = await response.text();

    const page = {
      path,
      title: decode(tagText(html, "title")[0] || ""),
      h1s: tagText(html, "h1").filter(Boolean),
      description: meta(html, "description"),
      ogTitle: meta(html, "og:title"),
      twitterTitle: meta(html, "twitter:title"),
      canonical:
        (html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/i) ||
          [])[1] || null,
    };

    pages.push(page);

    const add = (severity, detail) => problems.push({ path, severity, detail });

    if (!page.title) add("FAIL", "no title tag");
    else {
      if (page.title.length > TITLE_MAX) {
        add("WARN", `title is ${page.title.length} chars, over ${TITLE_MAX}`);
      }

      const brandCount = page.title.split(BRAND).length - 1;
      if (brandCount > 1) {
        add(
          "FAIL",
          `title says "${BRAND}" ${brandCount} times: ${JSON.stringify(page.title)}`
        );
      }
    }

    if (!page.h1s.length) add("FAIL", "no H1");
    else if (page.h1s.length > 1) {
      add(
        "WARN",
        `${page.h1s.length} H1s: ${JSON.stringify(page.h1s.slice(0, 3))}`
      );
    }

    if (page.title && page.h1s.length === 1) {
      if (!titleMatchesHeading(page.title, page.h1s[0])) {
        add(
          "FAIL",
          `heading and title describe different things\n` +
            `        heading: ${JSON.stringify(page.h1s[0])}\n` +
            `        title:   ${JSON.stringify(page.title)}`
        );
      }
    }

    if (!page.description) add("FAIL", "no meta description");
    else if (page.description.length > DESCRIPTION_MAX) {
      add(
        "WARN",
        `description is ${page.description.length} chars, over ${DESCRIPTION_MAX}`
      );
    }

    for (const [label, value] of [
      ["og:title", page.ogTitle],
      ["twitter:title", page.twitterTitle],
    ]) {
      if (value && page.title && decode(value) !== page.title) {
        add(
          "WARN",
          `${label} differs from the title\n        ${label}: ${JSON.stringify(value)}`
        );
      }
    }

    if (!page.canonical) add("WARN", "no canonical tag");

    for (const field of ["title", "description"]) {
      const value = page[field];
      if (!value) continue;
      for (const word of BANNED) {
        if (new RegExp(`\\b${word}`, "i").test(value)) {
          add("WARN", `${field} carries the banned word "${word}"`);
        }
      }
    }
  }

  // Duplicates, which only show up across the whole set.
  for (const field of ["title", "description"]) {
    const seen = new Map();
    for (const page of pages) {
      const value = page[field];
      if (!value) continue;
      seen.set(value, [...(seen.get(value) || []), page.path]);
    }
    for (const [value, paths] of seen) {
      if (paths.length > 1) {
        problems.push({
          path: paths[0],
          severity: "FAIL",
          detail:
            `${paths.length} pages share one ${field}: ${paths.join(", ")}\n` +
            `        ${JSON.stringify(value.slice(0, 90))}`,
        });
      }
    }
  }

  const byPath = new Map();
  for (const problem of problems) {
    byPath.set(problem.path, [...(byPath.get(problem.path) || []), problem]);
  }

  const fails = problems.filter((p) => p.severity === "FAIL").length;
  const warns = problems.filter((p) => p.severity === "WARN").length;
  const redirects = problems.filter((p) => p.severity === "REDIRECT").length;

  for (const [path, list] of [...byPath].sort()) {
    console.log(path);
    for (const problem of list) {
      console.log(`  ${problem.severity.padEnd(8)} ${problem.detail}`);
    }
    console.log("");
  }

  console.log("=".repeat(78));
  console.log(`${pages.length} pages checked`);
  console.log(
    `  ${fails} failures, ${warns} warnings, ${redirects} sitemap entries that redirect`
  );
  console.log(
    `  ${pages.filter((p) => !p.canonical).length} pages with no canonical tag (CH-003)`
  );

  process.exit(fails ? 1 : 0);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
