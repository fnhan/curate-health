/**
 * Runs every search and AI-answer check at once. The acceptance check for the
 * "every page ships complete" rule in CLAUDE.md.
 *
 *   node scripts/audit-seo-complete.js                        production
 *   node scripts/audit-seo-complete.js http://localhost:3000  a local build
 *
 * Read-only. Exits 1 if any check fails, and prints that check's output.
 *
 * A page is not finished until this passes against a local build with the
 * page in it. Each check below covers one part of the rule, and each can be
 * run on its own for detail.
 */

const { spawnSync } = require("child_process");
const path = require("path");

const CHECKS = [
  ["audit-metadata.js", "titles, descriptions, headings, canonicals, share cards"],
  ["audit-llms.js", "llms.txt lists every page, cleanly"],
  ["audit-breadcrumbs.js", "breadcrumb trails and their markup"],
  ["audit-orphans.js", "every page reachable within three clicks"],
  ["audit-alt-text.js", "alt text on every image"],
  ["audit-image-sizes.js", "images sized for the screen"],
  ["audit-practitioners.js", "practitioner pages and their markup"],
  ["audit-blog.js", "blog markup and the feed"],
  ["audit-content-rules.js", "the content rules, in the words on every page"],
];

const base = (process.argv[2] || "https://www.curatehealth.ca").replace(/\/$/, "");
let failed = 0;

console.log(`Checking ${base}\n`);

for (const [script, covers] of CHECKS) {
  const started = Date.now();
  const run = spawnSync(process.execPath, [path.join(__dirname, script), base], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  const seconds = ((Date.now() - started) / 1000).toFixed(0);
  const ok = run.status === 0;
  if (!ok) failed += 1;

  console.log(`${ok ? "PASS" : "FAIL"}  ${script.padEnd(24)} ${covers} (${seconds}s)`);
  if (!ok) {
    const output = `${run.stdout || ""}${run.stderr || ""}`.trim();
    console.log(output.replace(/^/gm, "      "));
    console.log("");
  }
}

console.log(
  failed
    ? `\n${failed} of ${CHECKS.length} checks failed. The page is not finished.`
    : `\nAll ${CHECKS.length} checks passed.`
);
process.exit(failed ? 1 : 0);
