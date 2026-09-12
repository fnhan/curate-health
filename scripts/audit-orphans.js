/**
 * CH-010 acceptance check: is every sitemap URL reachable by internal link
 * from the homepage, and in how many hops?
 *
 *   node scripts/audit-orphans.js                        # localhost:3000
 *   node scripts/audit-orphans.js http://localhost:3111
 *   node scripts/audit-orphans.js https://www.curatehealth.ca
 *
 * Exits 1 if anything in the sitemap is unreachable within MAX_HOPS.
 *
 * WHY A CRAWL AND NOT A GREP
 *
 * The five product pages were orphaned while two things that looked exactly
 * like links to them existed: the Products entry in the nav and in the footer.
 * Both pointed at /#products, an anchor back to the homepage. A grep for
 * "products" in the navigation data would have found them and concluded the
 * pages were linked. Only following the link shows that it goes nowhere.
 *
 * Three hops because that is roughly the depth past which a crawler stops
 * treating a page as part of the site rather than a leftover.
 */

const { assertChecked } = require("./lib/assert-checked");

const DEFAULT_BASE = "http://localhost:3000";
const MAX_HOPS = 3;

const clean = (href, base) => {
  try {
    const u = new URL(href, base);
    if (u.origin !== new URL(base).origin) return null;
    // An anchor is not a page. This is the distinction the whole check exists
    // for: /#products and / are the same destination.
    u.hash = "";
    u.search = "";
    let path = u.pathname.replace(/\/$/, "");
    return path === "" ? "/" : path;
  } catch {
    return null;
  }
};

async function linksOn(base, path) {
  const res = await fetch(base + path, { redirect: "follow" });
  if (!res.ok) return [];
  const html = await res.text();
  // Markup only. Following URLs out of the React payload would credit the site
  // with links a crawler never sees.
  const markup = html.replace(/<script[\s\S]*?<\/script>/g, "");
  return [...markup.matchAll(/<a[^>]+href="([^"]+)"/g)]
    .map((m) => clean(m[1], base + "/"))
    .filter(Boolean);
}

async function main() {
  const base = (process.argv[2] || DEFAULT_BASE).replace(/\/$/, "");

  const sitemapXml = await (await fetch(`${base}/sitemap.xml`)).text();

  // The sitemap always publishes the production host, whatever host served it,
  // because that is the canonical address. So take the path and ignore the
  // origin rather than running these through clean(), whose origin check would
  // reject every one of them and leave nothing to test. An earlier version did
  // exactly that and reported success against an empty list.
  const sitemap = [
    ...new Set(
      [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)]
        .map((m) => {
          try {
            const p = new URL(m[1]).pathname.replace(/\/$/, "");
            return p === "" ? "/" : p;
          } catch {
            return null;
          }
        })
        .filter(Boolean)
    ),
  ];

  assertChecked({
    label: "sitemap URLs",
    count: sitemap.length,
    atLeast: 30,
    hint:
      "The sitemap publishes the production host whatever host served it, so " +
      "filtering its URLs by origin discards every one of them.",
  });

  const hops = new Map([["/", 0]]);
  let frontier = ["/"];

  for (let depth = 1; depth <= MAX_HOPS && frontier.length; depth++) {
    const next = [];
    for (const path of frontier) {
      for (const href of await linksOn(base, path)) {
        if (hops.has(href)) continue;
        hops.set(href, depth);
        next.push(href);
      }
    }
    frontier = next;
  }

  const unreachable = sitemap.filter((p) => !hops.has(p));
  const byDepth = new Map();
  for (const p of sitemap) {
    const d = hops.get(p);
    if (d === undefined) continue;
    byDepth.set(d, (byDepth.get(d) ?? 0) + 1);
  }

  console.log(`${sitemap.length} sitemap URLs, crawled ${hops.size} pages\n`);
  console.log("reachable in:");
  for (const d of [...byDepth.keys()].sort()) {
    console.log(`  ${d} hop${d === 1 ? " " : "s"}  ${byDepth.get(d)}`);
  }

  if (unreachable.length) {
    console.log(`\nUnreachable within ${MAX_HOPS} hops: ${unreachable.length}`);
    unreachable.forEach((p) => console.log("  " + p));
    process.exitCode = 1;
    return;
  }

  console.log(`\nEvery sitemap URL is reachable within ${MAX_HOPS} hops.`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 2;
});
