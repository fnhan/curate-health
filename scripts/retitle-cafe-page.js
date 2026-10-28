/**
 * The cafe page leads with what it is, not with its own launch. Frank,
 * 2026-10-28.
 *
 *   node scripts/retitle-cafe-page.js
 *   node scripts/retitle-cafe-page.js --apply
 *
 * The h1 and the page title both read "Introducing Curate Cafe", which is
 * grammatical and reads perfectly well. That was never the problem, and
 * saying so cost a round: **"Introducing" simply earns nothing.** Nobody
 * searches it, it spends twelve of the sixty characters Google shows, and it
 * dates the page, which now carries a full menu and its own Google listing.
 * A stranger reading that result also cannot tell whether this is a coffee
 * shop or a restaurant.
 *
 * "Organic cafe" is Frank's own language rather than a new claim: the share
 * card has read "An Organic Cafe Where Food Is Medicine" since 2026-09-10 and
 * the meta description already says "an organic, whole-food menu".
 *
 * The h1 moves with the title because it has to. `titleMatchesHeading`
 * requires the title to carry every significant word of the heading, so
 * leaving "Introducing" in the h1 would drag it back into the title.
 *
 * **The brand is not lost by dropping "Curate Cafe" from the heading.** The
 * page is at /cafe, the navigation says Cafe, the share card still ends in
 * "Curate Cafe" through `shareBrand`, and the page title still ends in
 * "| Curate Health".
 *
 * Every replacement states the text it expects and the run is refused whole
 * if one no longer matches.
 */
const { mutate, query } = require("./lib/sanity-cli");
const { findBanned, findAmerican } = require("./lib/content-rules");

const APPLY = process.argv.includes("--apply");

const BRAND_SUFFIX = " | Curate Health";
const TITLE_MAX = 60;

const CHANGES = [
  {
    path: "introSection.title",
    from: "Introducing Curate Cafe",
    to: "An Organic Cafe in Midtown Toronto",
    why: "the h1, which the title has to agree with",
  },
  {
    path: "seo.pageTitle",
    from: "Introducing Curate Cafe",
    to: "Organic Cafe in Midtown Toronto",
    why: "the title, which now names what it is and where",
  },
];

/** The h1 this run leaves behind, which the title is checked against. */
const HEADING = CHANGES[0].to;
const PAGE_TITLE = CHANGES[1].to;

function significant(text) {
  const stop = new Set([
    "the", "and", "a", "an", "of", "for", "at", "in", "to", "our", "your",
    "with", "on", "by", "is", "are", "from",
  ]);
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stop.has(w));
}

(async () => {
  const problems = [];

  const rendered = PAGE_TITLE + BRAND_SUFFIX;
  if (rendered.length > TITLE_MAX) {
    problems.push(`the title is ${rendered.length} of ${TITLE_MAX}`);
  }

  const titleWords = new Set(significant(rendered));
  const missing = significant(HEADING).filter((w) => !titleWords.has(w));
  if (missing.length) {
    problems.push(`the title misses ${JSON.stringify(missing)} from the h1`);
  }

  for (const change of CHANGES) {
    if (/[—–]/.test(change.to)) problems.push(`${change.path} carries a dash`);
    if (/!/.test(change.to)) problems.push(`${change.path} carries an exclamation mark`);
    if (/\p{Cf}/u.test(change.to)) problems.push(`${change.path} carries invisible characters`);
    const banned = findBanned(change.to);
    if (banned.length) problems.push(`${change.path} uses ${JSON.stringify(banned)}`);
    const american = findAmerican(change.to);
    if (american.length) problems.push(`${change.path} spells ${JSON.stringify(american)}`);
  }

  const doc = await query(
    `*[_type == "cafePage"][0]{
      _id, _rev,
      "introTitle": introSection.title,
      "pageTitle": seo.pageTitle
    }`
  );
  if (!doc) {
    console.error("FAILED: no cafePage document");
    process.exitCode = 1;
    return;
  }

  const live = {
    "introSection.title": doc.introTitle,
    "seo.pageTitle": doc.pageTitle,
  };

  const set = {};
  console.log();
  for (const change of CHANGES) {
    const current = live[change.path];
    if (current === change.to) {
      console.log(`  ${change.path}  already reads the new value`);
      continue;
    }
    if (current !== change.from) {
      problems.push(
        `${change.path} reads ${JSON.stringify(current)}, expected ${JSON.stringify(change.from)}`
      );
      continue;
    }
    console.log(`  ${change.path}   ${change.why}`);
    console.log(`    was  ${JSON.stringify(change.from)}`);
    console.log(`    now  ${JSON.stringify(change.to)}`);
    set[change.path] = change.to;
  }

  console.log();
  console.log(`  rendered title: ${JSON.stringify(rendered)}  (${rendered.length} of ${TITLE_MAX})`);
  console.log();

  if (problems.length) {
    console.error("  REFUSED, nothing written:");
    problems.forEach((p) => console.error(`    ${p}`));
    process.exitCode = 1;
    return;
  }

  if (!Object.keys(set).length) {
    console.log("  Nothing to do.");
    return;
  }

  if (!APPLY) {
    console.log("  Dry run. Nothing written. Re-run with --apply.");
    return;
  }

  const result = await mutate([
    { patch: { id: doc._id, ifRevisionID: doc._rev, set } },
  ]);
  console.log(`  Applied. Transaction ${result.transactionId}.`);

  const after = await query(
    `*[_type == "cafePage"][0]{ "h1": introSection.title, "title": seo.pageTitle }`
  );
  console.log(`  Reading back: h1 ${JSON.stringify(after.h1)}`);
  console.log(`  Reading back: title ${JSON.stringify(after.title)}`);
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exitCode = 1;
});
