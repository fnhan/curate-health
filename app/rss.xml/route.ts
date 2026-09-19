import { NextResponse } from "next/server";

import { BASEURL } from "@/app/site-settings";
import { getBlogAuthorDisplayName } from "@/lib/author-team-link";
import {
  BLOG_DESCRIPTION,
  BLOG_FEED_PATH,
  BLOG_FEED_TITLE,
} from "@/lib/blog-feed";
import { sanityFetch } from "@/sanity/lib/client";

/**
 * The blog's RSS feed, at /rss.xml. CH-105.
 *
 * Feed readers and aggregators follow a site through this rather than by
 * revisiting its pages, and every blog page points to it with a link tag. It
 * lists every published post, newest first.
 *
 * pubDate comes from the post's publishedAt, which the Studio stores as a bare
 * date. It is pinned to noon in Toronto, so no reader's time zone moves a post
 * onto the day before or after.
 */
export const revalidate = 3600;

// Deliberately not tagged with groq, so Sanity TypeGen skips it. The route
// declares its own FeedPost type, and a fourth file of tagged queries reorders
// the whole of sanity.types.ts, which buries the real change in a diff of
// thousands of lines.
//
// The description is the blog page's own, from the Studio when it is set
// there, so the feed and /blog keep saying the same thing.
const RSS_QUERY = `{
  "description": *[_type == "blogSection"][0].seo.pageDescription,
  "posts": *[_type == "post" && published == true && defined(slug.current)] | order(publishedAt desc){
    title,
    "slug": slug.current,
    excerpt,
    publishedAt,
    "byline": author->linkedTeamMemberName
  }
}`;

type FeedPost = {
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  publishedAt: string | null;
  byline: string | null;
};

type Feed = {
  description: string | null;
  posts: FeedPost[] | null;
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function pubDate(date: string) {
  const parsed = new Date(`${date.slice(0, 10)}T12:00:00-05:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toUTCString();
}

function buildFeed(posts: FeedPost[], description: string) {
  const items = posts
    .filter((post) => post.title && post.slug)
    .map((post) => {
      const link = `${BASEURL}/blog/${post.slug}`;
      const date = post.publishedAt ? pubDate(post.publishedAt) : null;
      const creator = getBlogAuthorDisplayName(post.byline);

      return [
        "    <item>",
        `      <title>${escapeXml(post.title!)}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="true">${link}</guid>`,
        date ? `      <pubDate>${date}</pubDate>` : "",
        post.excerpt
          ? `      <description>${escapeXml(post.excerpt)}</description>`
          : "",
        creator ? `      <dc:creator>${escapeXml(creator)}</dc:creator>` : "",
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    });

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">`,
    "  <channel>",
    `    <title>${escapeXml(BLOG_FEED_TITLE)}</title>`,
    `    <link>${BASEURL}/blog</link>`,
    `    <description>${escapeXml(description)}</description>`,
    "    <language>en-ca</language>",
    `    <atom:link href="${BASEURL}${BLOG_FEED_PATH}" rel="self" type="application/rss+xml"/>`,
    ...items,
    "  </channel>",
    "</rss>",
  ].join("\n");
}

export async function GET() {
  const feed = await sanityFetch<Feed>({
    query: RSS_QUERY,
    revalidate,
  });

  const description = feed?.description?.trim() || BLOG_DESCRIPTION;

  return new NextResponse(`${buildFeed(feed?.posts ?? [], description)}\n`, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
