/**
 * Acceptance check for CH-113.
 *
 *   node scripts/audit-conversion-events.js http://localhost:3000
 *   node scripts/audit-conversion-events.js https://www.curatehealth.ca
 *
 * WHAT THIS CAN AND CANNOT PROVE
 *
 * The tracking is a click listener, so nothing about it appears in the HTML:
 * the component renders null. What this checks is that the code is still
 * shipped and still reachable from every page, by finding the event names in
 * the JavaScript the page loads. Delete the component, drop it from the
 * layout, or rename an event, and this fails.
 *
 * It cannot prove an event fires. That needs a browser, and the procedure is
 * in CLAUDE.md under CH-113: stub window.gtag, click a booking link, read
 * what was captured. Run that after changing the listener.
 *
 * It also checks that every page carries at least one booking link, since a
 * page with no way to book is a page that can never convert, and that gtag
 * itself loads outside the Studio.
 *
 * Exits 1 on a failure.
 */

const { assertChecked } = require("./lib/assert-checked");

const target = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");

/** Every event name the component can emit. Keep in step with it. */
const EVENTS = [
  "book_now",
  "call_click",
  "email_click",
  "directions_click",
  "file_download",
];

async function get(url) {
  const res = await fetch(url, {
    headers: { "user-agent": "curate-events/1.0" },
  });
  return { status: res.status, body: res.ok ? await res.text() : "" };
}

async function main() {
  const sitemap = await get(`${target}/sitemap.xml`);
  const urls = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    m[1].replace(/^https?:\/\/[^/]+/, target)
  );

  assertChecked({
    label: "sitemap URLs",
    count: urls.length,
    atLeast: 20,
    hint: "With no pages, every check below passes by looking at nothing.",
  });

  const failures = [];
  const chunkCache = new Map();

  /** Fetches a JS chunk once, however many pages reference it. */
  async function chunk(url) {
    if (!chunkCache.has(url)) chunkCache.set(url, (await get(url)).body);
    return chunkCache.get(url);
  }

  let pagesWithBooking = 0;

  for (const url of urls) {
    const { status, body } = await get(url);
    const path = new URL(url).pathname;

    if (status !== 200) {
      failures.push(`${path}: HTTP ${status}`);
      continue;
    }

    if (!body.includes("googletagmanager.com/gtag/js")) {
      failures.push(`${path}: gtag is not loaded`);
    }

    if (/janeapp\.com/.test(body)) pagesWithBooking += 1;

    // The listener lives in a client chunk, so look through the scripts this
    // page pulls rather than at the HTML.
    const scripts = [...body.matchAll(/<script[^>]+src="([^"]+)"/g)]
      .map((m) => m[1])
      .filter((src) => src.includes("/_next/"))
      .map((src) => (src.startsWith("http") ? src : `${target}${src}`));

    let found = [];
    for (const src of scripts) {
      const code = await chunk(src);
      found = EVENTS.filter((e) => found.includes(e) || code.includes(`"${e}"`));
      if (found.length === EVENTS.length) break;
    }

    const missing = EVENTS.filter((e) => !found.includes(e));
    if (missing.length) {
      failures.push(`${path}: event names absent from the bundle: ${missing.join(", ")}`);
    }
  }

  console.log(
    `${urls.length} pages checked, ${chunkCache.size} JavaScript chunks read.`
  );
  console.log(`${pagesWithBooking} of ${urls.length} carry a booking link.\n`);

  if (failures.length) {
    console.error(`${failures.length} failures:`);
    for (const f of failures.slice(0, 20)) console.error(`  ${f}`);
    process.exit(1);
  }

  console.log(
    `Every page loads gtag and ships all ${EVENTS.length} conversion events.`
  );
  console.log(
    "\nThis does not prove an event fires. Run the browser procedure in\n" +
      "CLAUDE.md under CH-113 after changing the listener."
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(2);
});
