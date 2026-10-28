/**
 * Names the neighbourhoods Curate draws from, on /contact. Frank, 2026-10-28.
 *
 *   node scripts/add-catchment-line.js
 *   node scripts/add-catchment-line.js --apply
 *
 * WHY VISIBLE COPY AND NOT ONLY `areaServed`
 *
 * The markup now lists eleven areas, which search engines read. The answer
 * engines mostly do not: CH-101 recorded that ChatGPT and Perplexity pulled
 * planted data out of deliberately invalid JSON-LD, which means they read the
 * visible text and largely ignore the markup. So a catchment that exists only
 * in a script tag is invisible to half of what Frank asked to be found in.
 *
 * One sentence, in the one place on the site where a reader is already asking
 * where Curate is.
 *
 * WHY "THE FORMER CITY OF YORK" AND NOT "YORK"
 *
 * In the GTA the bare word means at least four places, and only one of them
 * is this one. Naming it as the former municipality is both accurate and
 * unambiguous: it tells somebody in the old City of York that this is their
 * neighbourhood, and tells somebody in York Region that it is not. It also
 * does not disturb CH-021, which took "York" out of the address because
 * `addressLocality` is Toronto and must stay Toronto.
 *
 * IT IS INSERTED, NOT APPENDED
 *
 * The sentence belongs with the opening paragraph, which is the one about
 * where the building is. Appending it to the end would put it after the
 * driving directions, where nobody orienting themselves would read it.
 *
 * The run is refused outright if the expected opening paragraph is not found
 * byte for byte, so a Studio edit cannot be silently overwritten, and the
 * sentence is never added twice.
 */
const { mutate, query } = require("./lib/sanity-cli");
const { findBanned, findAmerican } = require("./lib/content-rules");

const APPLY = process.argv.includes("--apply");

/**
 * The paragraph the sentence goes after, quoted exactly as CH-109 left it.
 */
const ANCHOR =
  "Our clinic is at the southeast corner of Eglinton Avenue West and Glen Cedar Road, at the west end of the building, directly across from the Green P parking lot.";

const SENTENCE =
  "We are in Midtown Toronto on Eglinton West, close to Forest Hill, Cedarvale, Humewood and Oakwood Village, in the former City of York.";

(async () => {
  const problems = [];

  for (const [label, text] of [["the sentence", SENTENCE]]) {
    if (/[—–]/.test(text)) problems.push(`${label} carries a dash`);
    if (/!/.test(text)) problems.push(`${label} carries an exclamation mark`);
    if (/\p{Cf}/u.test(text)) problems.push(`${label} carries invisible characters`);
    const banned = findBanned(text);
    if (banned.length) problems.push(`${label} uses ${JSON.stringify(banned)}`);
    const american = findAmerican(text);
    if (american.length) problems.push(`${label} spells ${JSON.stringify(american)}`);
  }

  const doc = await query(
    `*[_type == "contactPage"][0]{ _id, _rev, howToGetHere }`
  );
  if (!doc) problems.push("no contactPage document");

  let next;
  if (doc) {
    const current = doc.howToGetHere || "";

    if (current.includes(SENTENCE)) {
      console.log();
      console.log("  The sentence is already on the page. Nothing to do.");
      return;
    }
    if (!current.includes(ANCHOR)) {
      problems.push(
        "the opening paragraph has changed, so there is nowhere known to put it"
      );
    } else {
      next = current.replace(ANCHOR, `${ANCHOR} ${SENTENCE}`);
    }
  }

  console.log();
  console.log("  contactPage.howToGetHere, first paragraph");
  console.log();
  console.log(`    ${ANCHOR}`);
  console.log(`    >> ${SENTENCE}`);
  console.log();

  if (problems.length) {
    console.error("  REFUSED, nothing written:");
    problems.forEach((p) => console.error(`    ${p}`));
    process.exitCode = 1;
    return;
  }

  if (!APPLY) {
    console.log("  Dry run. Nothing written. Re-run with --apply.");
    return;
  }

  const result = await mutate([
    {
      patch: {
        id: doc._id,
        ifRevisionID: doc._rev,
        set: { howToGetHere: next },
      },
    },
  ]);
  console.log(`  Applied. Transaction ${result.transactionId}.`);

  const after = await query(
    `*[_type == "contactPage"][0].howToGetHere`
  );
  console.log(
    `  Reading back: ${after.includes(SENTENCE) ? "the sentence is on the page" : "NOT FOUND"}`
  );
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exitCode = 1;
});
