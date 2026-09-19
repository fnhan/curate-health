/**
 * Checks the words on every page against the content rules in CLAUDE.md.
 *
 *   node scripts/audit-content-rules.js                        production
 *   node scripts/audit-content-rules.js http://localhost:3000  a local build
 *
 * Read-only. Exits 1 if anything breaks a rule.
 *
 * The other audits check what a crawler reads from a page's head: titles,
 * descriptions, share cards. None of them read the body. On 2026-09-18 the
 * body copy of about 25 pages still broke the rules, most of it written in
 * 2024 before they existed: 46 dashes, 37 banned words, "complimentary"
 * for a Flowpresso session, and two exclamation marks.
 *
 * Reads each page's <main>, so the header and footer are not reported on
 * every page. They are checked once, from the homepage.
 *
 * WHAT IT CHECKS
 *
 *   Em and en dashes      Used as punctuation. Hyphens are fine.
 *   Banned words          The list in CLAUDE.md. "journey" is allowed.
 *   Exclamation marks
 *   "cafe" with an accent
 *   "outdoor terrace"     The space is the Recovery Sanctuary.
 *
 * It reports; it cannot fix. The copy lives in Sanity, and every change to it
 * is Frank's to approve, and a practitioner's where it makes a health claim.
 */

const DEFAULT_BASE = "https://www.curatehealth.ca";

const BANNED = [
  "dive in",
  "dive into",
  "unlock",
  "elevate",
  "harness the power of",
  "complimentary",
  "transformative",
  "seamless",
];

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
}

function snippet(text, index, length) {
  return text
    .slice(Math.max(0, index - 45), index + length + 35)
    .trim();
}

function check(text) {
  const found = [];

  for (const m of text.matchAll(/[–—]/g)) {
    found.push(["dash", snippet(text, m.index, 1)]);
  }

  const lower = text.toLowerCase();
  for (const word of BANNED) {
    let i = lower.indexOf(word);
    while (i >= 0) {
      const before = i === 0 ? " " : lower[i - 1];
      if (!/[a-z]/.test(before)) found.push([word, snippet(text, i, word.length)]);
      i = lower.indexOf(word, i + 1);
    }
  }

  for (const m of text.matchAll(/[A-Za-z)]!(?=\s|$)/g)) {
    found.push(["exclamation mark", snippet(text, m.index, 2)]);
  }

  for (const m of text.matchAll(/café/gi)) {
    found.push(["café", snippet(text, m.index, 4)]);
  }

  for (const m of text.matchAll(/outdoor terrace/gi)) {
    found.push(["outdoor terrace", snippet(text, m.index, 15)]);
  }

  // "dive into" also matches "dive in"; keep one.
  const seen = new Set();
  return found.filter(([rule, text]) => {
    const key = `${rule === "dive into" ? "dive in" : rule}|${text}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function main() {
  const base = (process.argv[2] || DEFAULT_BASE).replace(/\/$/, "");

  const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
  const paths = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map(
    (m) => new URL(m[1]).pathname || "/"
  );

  if (paths.length < 20) {
    console.error(`Only ${paths.length} pages in ${base}/sitemap.xml. Not checking a site that did not render.`);
    process.exit(1);
  }

  const report = [];

  for (const path of paths) {
    const html = await (await fetch(`${base}${path}`)).text();
    const main = html.match(/<main[\s\S]*?<\/main>/i);
    const text = visibleText(main ? main[0] : html);
    const found = check(text);
    if (found.length) report.push([path, found]);

    // The shared header and footer, once.
    if (path === "/" && main) {
      const shell = visibleText(html.replace(main[0], " "));
      const shellFound = check(shell);
      if (shellFound.length) report.push(["header and footer, every page", shellFound]);
    }
  }

  let total = 0;
  for (const [path, found] of report) {
    console.log(path);
    for (const [rule, text] of found) {
      console.log(`  ${rule.padEnd(17)} ...${text}...`);
      total += 1;
    }
  }

  console.log(
    total
      ? `\n${total} breaks of the content rules on ${report.length} of ${paths.length} pages.`
      : `\n${paths.length} pages, no breaks of the content rules.`
  );
  process.exit(total ? 1 : 0);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
