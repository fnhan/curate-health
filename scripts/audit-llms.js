/**
 * Checks /llms.txt against the sitemap.
 *
 *   node scripts/audit-llms.js                        production
 *   node scripts/audit-llms.js http://localhost:3000  a local build
 *
 * Read-only. Exits 1 if anything fails.
 *
 * llms.txt is the summary AI assistants read to find their way round the
 * site. On 2026-09-18 it was missing 25 of the 49 pages in the sitemap,
 * every page built that year among them, and it printed "[object Object]"
 * in place of every practitioner's credentials. Nobody reads the file by eye,
 * so neither showed.
 *
 * WHAT IT CHECKS
 *
 *   Every sitemap page is listed    A page missing here is invisible to the
 *                                   assistants that start from this file.
 *   Every listed page answers 200   A link that redirects or 404s sends them
 *                                   somewhere else, or nowhere.
 *   No template debris              "[object Object]", "undefined" and "null"
 *                                   are what a field read the wrong way prints.
 *   Content rules                   Dashes and banned words, as on the pages.
 */

const DEFAULT_BASE = "https://www.curatehealth.ca";
const SITE = "https://www.curatehealth.ca";

const BANNED = [
  "dive in",
  "unlock",
  "elevate",
  "harness the power of",
  "complimentary",
  "transformative",
  "seamless",
];

const DEBRIS = ["[object Object]", "undefined", ": null", "NaN"];

function normalise(url) {
  return url.replace(/\/$/, "");
}

async function main() {
  const base = (process.argv[2] || DEFAULT_BASE).replace(/\/$/, "");

  const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
  const pages = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) =>
    normalise(m[1].trim())
  );

  const response = await fetch(`${base}/llms.txt`);
  const text = await response.text();

  const problems = [];
  const add = (severity, detail) => problems.push({ severity, detail });

  if (response.status !== 200) {
    add("FAIL", `/llms.txt returned ${response.status}`);
  }

  const listed = new Set(
    [...text.matchAll(/https:\/\/www\.curatehealth\.ca[^\s)\]]*/g)].map((m) =>
      normalise(m[0])
    )
  );

  for (const page of pages) {
    if (!listed.has(page)) add("FAIL", `not listed: ${page}`);
  }

  for (const url of listed) {
    const path = url.slice(SITE.length) || "/";
    const res = await fetch(`${base}${path}`, { redirect: "manual" });
    if (res.status !== 200) {
      add("FAIL", `listed but returns ${res.status}: ${url}`);
    }
  }

  const lines = text.split("\n");
  lines.forEach((line, i) => {
    for (const token of DEBRIS) {
      if (line.includes(token)) {
        add("FAIL", `line ${i + 1} carries "${token}": ${line.slice(0, 100)}`);
      }
    }
    if (/[–—]/.test(line)) {
      add("WARN", `line ${i + 1} carries a dash: ${line.slice(0, 100)}`);
    }
    for (const word of BANNED) {
      if (new RegExp(`\\b${word}`, "i").test(line)) {
        add("WARN", `line ${i + 1} carries "${word}": ${line.slice(0, 100)}`);
      }
    }
  });

  console.log(
    `${pages.length} sitemap pages, ${listed.size} links in /llms.txt on ${base}\n`
  );

  for (const { severity, detail } of problems) {
    console.log(`  ${severity.padEnd(5)} ${detail}`);
  }

  const fails = problems.filter((p) => p.severity === "FAIL").length;
  if (!problems.length) {
    console.log("Every sitemap page is listed, every link answers 200, nothing garbled.");
  }
  process.exit(fails ? 1 : 0);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
