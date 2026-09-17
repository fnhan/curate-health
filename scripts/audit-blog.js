/**
 * Acceptance check for CH-105: BlogPosting markup and the RSS feed.
 *
 *   node scripts/audit-blog.js http://localhost:3000
 *   node scripts/audit-blog.js https://www.curatehealth.ca
 *
 *   1 Every published post returns 200 and carries exactly one BlogPosting
 *     node.
 *   2 Its headline is the page's h1 and the record's title, and its dates are
 *     the dates the page shows: datePublished against the record,
 *     dateModified against the "Last reviewed" line.
 *   3 Its author is whoever the byline names, and a post with no byline
 *     carries no author.
 *   4 /rss.xml returns 200 as XML, lists every published post exactly once,
 *     escapes its text, and every link in it returns 200.
 *   5 The blog index and every post point to the feed with a link tag.
 *
 * Exits 1 on any failure.
 */

const { assertChecked } = require("./lib/assert-checked");
const { query } = require("./lib/sanity-cli");

const target = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");

/** Stored as the byline when it should read "Curate Health Team". */
const TEAM_BYLINE = "__CURATE_HEALTH_TEAM_PAGE__";

async function get(path) {
  const res = await fetch(`${target}${path}`, {
    headers: { "user-agent": "curate-blog-audit/1.0" },
  });
  return {
    status: res.status,
    type: res.headers.get("content-type") || "",
    text: res.ok ? await res.text() : "",
  };
}

function blogPostingNodes(html) {
  const nodes = [];
  for (const m of html.matchAll(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g
  )) {
    try {
      const data = JSON.parse(m[1]);
      const list = Array.isArray(data) ? data : data["@graph"] || [data];
      nodes.push(...list.filter((n) => n && n["@type"] === "BlogPosting"));
    } catch {
      /* a malformed block is a finding for the schema audit, not this one */
    }
  }
  return nodes;
}

function decodeEntities(text) {
  return text
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

const FEED_LINK =
  /<link(?=[^>]*rel="alternate")(?=[^>]*type="application\/rss\+xml")[^>]*>/;

async function main() {
  const posts = await query(
    `*[_type == "post" && published == true && defined(slug.current)]{
      title,
      "slug": slug.current,
      publishedAt,
      "byline": author->linkedTeamMemberName
    }`
  );

  assertChecked({
    label: "published posts in Sanity",
    count: posts.length,
    atLeast: 1,
    hint: "With none, every check below passes by looking at nothing.",
  });

  const failures = [];

  const index = await get("/blog");
  if (index.status !== 200) {
    failures.push(`/blog returned ${index.status}`);
  } else if (!FEED_LINK.test(index.text)) {
    failures.push("/blog does not point to the feed");
  }

  for (const post of posts) {
    const path = `/blog/${post.slug}`;
    const page = await get(path);

    if (page.status !== 200) {
      failures.push(`${path}: HTTP ${page.status}`);
      continue;
    }

    if (!FEED_LINK.test(page.text)) {
      failures.push(`${path}: does not point to the feed`);
    }

    const nodes = blogPostingNodes(page.text);
    if (nodes.length !== 1) {
      failures.push(`${path}: ${nodes.length} BlogPosting nodes, expected 1`);
      continue;
    }
    const node = nodes[0];

    const h1 = (page.text.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1];
    const h1Text = h1
      ? decodeEntities(h1.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, "")).trim()
      : null;
    if (node.headline !== h1Text) {
      failures.push(`${path}: headline "${node.headline}", but the h1 reads "${h1Text}"`);
    }
    if (node.headline !== post.title) {
      failures.push(`${path}: headline "${node.headline}", but the record says "${post.title}"`);
    }

    if (node.datePublished !== post.publishedAt) {
      failures.push(
        `${path}: datePublished ${node.datePublished}, but the record says ${post.publishedAt}`
      );
    }

    const shown = (page.text.match(
      /Last reviewed[\s\S]{0,80}?<time[^>]*datetime="([^"]+)"/i
    ) || [])[1];
    const modified = node.dateModified
      ? new Date(node.dateModified).toISOString().slice(0, 10)
      : null;
    if (!shown) {
      failures.push(`${path}: no "Last reviewed" date on the page`);
    } else if (modified !== shown) {
      failures.push(`${path}: dateModified ${node.dateModified}, but the page shows ${shown}`);
    }

    const author = node.author;
    const byline = post.byline && post.byline.trim();
    if (!byline) {
      if (author) failures.push(`${path}: markup names an author, but the page shows no byline`);
    } else if (byline === TEAM_BYLINE) {
      if (!author || author["@type"] !== "Organization" || author.name !== "Curate Health Team") {
        failures.push(
          `${path}: the byline reads Curate Health Team, but the markup author is ${JSON.stringify(author)}`
        );
      }
    } else if (!author || author["@type"] !== "Person" || author.name !== byline) {
      failures.push(
        `${path}: the byline names ${byline}, but the markup author is ${JSON.stringify(author)}`
      );
    }
  }

  const feed = await get("/rss.xml");
  if (feed.status !== 200) {
    failures.push(`/rss.xml returned ${feed.status}`);
  } else {
    if (!/xml/.test(feed.type)) {
      failures.push(`/rss.xml is served as "${feed.type}", not XML`);
    }
    if (/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-f]+;)/i.test(feed.text)) {
      failures.push("/rss.xml has an unescaped ampersand, so it is not valid XML");
    }
    if (!/<atom:link[^>]*rel="self"/.test(feed.text)) {
      failures.push("/rss.xml does not name its own address");
    }

    const links = [
      ...feed.text.matchAll(/<item>[\s\S]*?<link>([^<]+)<\/link>/g),
    ].map((m) => new URL(m[1]).pathname);
    const expected = posts.map((p) => `/blog/${p.slug}`);

    const missing = expected.filter((p) => !links.includes(p));
    const extra = links.filter((p) => !expected.includes(p));
    if (missing.length) failures.push(`/rss.xml leaves out ${missing.join(", ")}`);
    if (extra.length) failures.push(`/rss.xml lists unpublished or unknown ${extra.join(", ")}`);
    if (links.length !== new Set(links).size) failures.push("/rss.xml lists a post twice");

    for (const link of links) {
      const r = await get(link);
      if (r.status !== 200) failures.push(`/rss.xml links to ${link}, which returned ${r.status}`);
    }
  }

  console.log(`${posts.length} published posts, the blog index and /rss.xml checked.`);

  if (failures.length) {
    console.error(`${failures.length} failures:`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }

  console.log(
    "Every post carries BlogPosting markup that agrees with the page, and the feed lists every post."
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(2);
});
