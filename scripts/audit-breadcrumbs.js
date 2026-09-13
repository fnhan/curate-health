/**
 * Acceptance check for CH-009.
 *
 *   node scripts/audit-breadcrumbs.js http://localhost:3000
 *   node scripts/audit-breadcrumbs.js https://www.curatehealth.ca
 *
 * Checks the rendered page rather than the source, because every failure this
 * guards against is invisible in the components: a trail whose markup says
 * something else, an intermediate item with no URL, a crumb pointing at a 404.
 *
 * Seven rules, and the ones that matter most are the last three.
 *
 *   1 Every page more than one level deep shows a trail.
 *   2 No hub and not the homepage shows one. Home > About on /about is a link
 *     to the page you are already beneath.
 *   3 The trail starts at Home.
 *   4 The visible names and the BreadcrumbList names match, in order. Google
 *     asks that the markup describe what the page shows.
 *   5 Every item except the last carries an item URL. An intermediate ListItem
 *     without one is the case where Google may decline to show the trail at
 *     all, which is the entire reason to build these.
 *   6 Every one of those URLs answers 200. A crumb to a 404 is worse than no
 *     crumb.
 *   7 The last item is text, not a link, and says which page it is.
 *
 * Exits 1 on any failure.
 */

const { assertChecked } = require("./lib/assert-checked");

const target = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");

/** Depth 0 means one segment: /about, /services. These get no trail. */
function depth(pathname) {
  return pathname.split("/").filter(Boolean).length - 1;
}

async function get(url) {
  const res = await fetch(url, {
    headers: { "user-agent": "curate-breadcrumbs/1.0" },
    redirect: "manual",
  });
  return { status: res.status, html: res.ok ? await res.text() : "" };
}

/** The names in <nav aria-label="Breadcrumb">, in order, and whether linked. */
function visibleTrail(html) {
  const nav = html.match(
    /<nav[^>]*aria-label="Breadcrumb"[^>]*>([\s\S]*?)<\/nav>/
  );
  if (!nav) return null;

  const items = [...nav[1].matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)];

  return items.map((item) => {
    const inner = item[1];
    const link = inner.match(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/);
    const text = inner
      .replace(/<svg[\s\S]*?<\/svg>/g, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .trim();
    return { name: text, href: link ? link[1] : null };
  });
}

/** The BreadcrumbList, if the page publishes one. */
function markupTrail(html) {
  for (const m of html.matchAll(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
  )) {
    let data;
    try {
      data = JSON.parse(m[1]);
    } catch {
      continue;
    }
    const nodes = Array.isArray(data) ? data : [data];
    for (const node of nodes) {
      if (node && node["@type"] === "BreadcrumbList") {
        return (node.itemListElement || []).map((i) => ({
          name: i.name,
          item: i.item ?? null,
          position: i.position,
        }));
      }
    }
  }
  return null;
}

async function main() {
  const sitemap = await get(`${target}/sitemap.xml`);
  const urls = [...sitemap.html.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1])
    .map((u) => new URL(u).pathname);

  assertChecked({
    label: "sitemap URLs",
    count: urls.length,
    atLeast: 20,
    hint: `Fetched ${target}/sitemap.xml and got ${urls.length} entries. Every check below would pass by looking at nothing.`,
  });

  const deep = urls.filter((u) => depth(u) >= 1);
  const shallow = urls.filter((u) => depth(u) < 1);

  assertChecked({ label: "pages more than one level deep", count: deep.length, atLeast: 10 });

  const failures = [];
  const seen200 = new Map();

  async function resolves(path) {
    if (!seen200.has(path)) {
      const { status } = await get(`${target}${path}`);
      seen200.set(path, status);
    }
    return seen200.get(path);
  }

  for (const path of deep) {
    const { status, html } = await get(`${target}${path}`);
    if (status !== 200) {
      failures.push(`${path}: HTTP ${status}`);
      continue;
    }

    const visible = visibleTrail(html);
    const markup = markupTrail(html);

    if (!visible) {
      failures.push(`${path}: no breadcrumb nav`);
      continue;
    }
    if (!markup) {
      failures.push(`${path}: trail shown but no BreadcrumbList markup`);
      continue;
    }
    if (visible[0].name !== "Home") {
      failures.push(`${path}: trail starts at "${visible[0].name}", not Home`);
    }

    const vNames = visible.map((c) => c.name).join(" > ");
    const mNames = markup.map((c) => c.name).join(" > ");
    if (vNames !== mNames) {
      failures.push(`${path}: shown "${vNames}" but markup says "${mNames}"`);
    }

    for (let i = 0; i < markup.length - 1; i += 1) {
      if (!markup[i].item) {
        failures.push(`${path}: markup item ${i + 1} "${markup[i].name}" has no URL`);
      }
    }
    const last = markup[markup.length - 1];
    if (last.item) {
      failures.push(`${path}: last markup item "${last.name}" carries a URL`);
    }
    if (visible[visible.length - 1].href) {
      failures.push(`${path}: last visible crumb "${last.name}" is a link`);
    }
    if (!/aria-current="page"/.test(html)) {
      failures.push(`${path}: no aria-current="page" on the last crumb`);
    }

    for (const crumb of visible.slice(0, -1)) {
      if (!crumb.href) {
        failures.push(`${path}: visible crumb "${crumb.name}" is not a link`);
        continue;
      }
      const code = await resolves(crumb.href);
      if (code !== 200) {
        failures.push(`${path}: crumb "${crumb.name}" -> ${crumb.href} is ${code}`);
      }
    }
  }

  for (const path of shallow) {
    const { html } = await get(`${target}${path}`);
    if (visibleTrail(html)) {
      failures.push(`${path}: hub page shows a trail, it should not`);
    }
  }

  console.log(
    `${urls.length} sitemap URLs: ${deep.length} more than one level deep, ` +
      `${shallow.length} hubs.\n`
  );

  for (const path of deep.slice(0, 8)) {
    const { html } = await get(`${target}${path}`);
    const v = visibleTrail(html);
    console.log(
      `  ${path.padEnd(48)} ${v ? v.map((c) => c.name).join(" > ") : "(none)"}`
    );
  }
  if (deep.length > 8) console.log(`  ... and ${deep.length - 8} more`);

  if (failures.length) {
    console.error(`\n${failures.length} failures:`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }

  console.log(`\nAll ${deep.length} deep pages carry a matching trail. Hubs carry none.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(2);
});
