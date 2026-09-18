/**
 * Tells IndexNow about every page in the sitemap at once. CH-114.
 *
 *   node scripts/indexnow-submit.js                  dry run, sends nothing
 *   node scripts/indexnow-submit.js --apply          sends every sitemap page
 *   node scripts/indexnow-submit.js --apply /blog /contact    sends only these
 *
 * The Sanity webhook already announces each page as it is published, see
 * lib/indexnow.ts. This is for the other case: a code change that alters many
 * pages at once, such as new share tags on every page, which no publish in the
 * Studio will ever announce. Run it after that kind of change has deployed,
 * not before, or Bing fetches the old pages.
 *
 * The dry run checks what IndexNow will check, and stops if any of it fails:
 * the key file is live on production and holds the key, and every address is
 * on the production host. IndexNow answers a bad key with 403 and an address
 * on another host with 422, and a refused submission is easy to miss.
 *
 * Production only. IndexNow reads the key file from the host named in the
 * submission, and a local server is not a host it can reach.
 */

const fs = require("fs");
const path = require("path");

const BASE = "https://www.curatehealth.ca";
const ENDPOINT = "https://api.indexnow.org/indexnow";

/** The key is read from lib/indexnow.ts, so the two can never disagree. */
function readKey() {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "lib", "indexnow.ts"),
    "utf8"
  );
  const match = source.match(/INDEXNOW_KEY = "([A-Za-z0-9-]{8,128})"/);
  if (!match) throw new Error("Could not find INDEXNOW_KEY in lib/indexnow.ts");
  return match[1];
}

async function sitemapUrls() {
  const response = await fetch(`${BASE}/sitemap.xml`);
  if (response.status !== 200) {
    throw new Error(`sitemap.xml returned ${response.status}`);
  }
  const xml = await response.text();
  return [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1].trim());
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const only = args.filter((a) => a.startsWith("/"));

  const key = readKey();
  const keyLocation = `${BASE}/${key}.txt`;
  const problems = [];

  const local = path.join(__dirname, "..", "public", `${key}.txt`);
  if (!fs.existsSync(local)) {
    problems.push(`public/${key}.txt is missing from the repository`);
  } else if (fs.readFileSync(local, "utf8").trim() !== key) {
    problems.push(`public/${key}.txt does not contain the key`);
  }

  const live = await fetch(keyLocation, { redirect: "manual" });
  const liveText = (await live.text()).trim();
  if (live.status !== 200) {
    problems.push(
      `${keyLocation} returned ${live.status}. Merge and let it deploy first.`
    );
  } else if (liveText !== key) {
    problems.push(`${keyLocation} does not hold the key`);
  }

  const urlList = only.length
    ? only.map((p) => (p === "/" ? BASE : `${BASE}${p}`))
    : await sitemapUrls();

  const offHost = urlList.filter((u) => new URL(u).host !== new URL(BASE).host);
  for (const u of offHost) problems.push(`${u} is not on ${new URL(BASE).host}`);

  console.log(`Key file:  ${keyLocation}  ${live.status}`);
  console.log(`Addresses: ${urlList.length}${only.length ? " (as given)" : " (from the sitemap)"}`);
  for (const u of urlList) console.log(`  ${u}`);

  if (problems.length) {
    console.log(`\nNot sent:`);
    for (const p of problems) console.log(`  ${p}`);
    process.exit(1);
  }

  if (!apply) {
    console.log(`\nDry run. Nothing sent. Add --apply to send.`);
    return;
  }

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(BASE).host,
      key,
      keyLocation,
      urlList,
    }),
  });

  const meaning = {
    200: "accepted",
    202: "accepted, key still being checked",
    400: "refused, the request was malformed",
    403: "refused, the key file could not be read or did not match",
    422: "refused, an address is not on this host",
    429: "refused, too many submissions, try again later",
  };

  console.log(
    `\nIndexNow answered ${response.status}: ${meaning[response.status] || "unexpected"}`
  );
  if (response.status !== 200 && response.status !== 202) process.exit(1);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
