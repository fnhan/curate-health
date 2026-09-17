import type { Metadata } from "next";

/**
 * The blog's feed, and the words it shares with the blog index. CH-105.
 *
 * The description is the one /blog already carries as its meta description,
 * kept in one place so the feed and the page cannot drift apart.
 */
export const BLOG_FEED_PATH = "/rss.xml";
export const BLOG_FEED_TITLE = "Curate Health Blog";
export const BLOG_DESCRIPTION =
  "Articles on movement, recovery and lifestyle medicine from the practitioners at Curate Health in Midtown Toronto.";

/**
 * Adds the link tag that lets browsers and feed readers find the feed from a
 * blog page. Merged into `alternates` rather than replacing it, because that
 * object also carries the page's canonical address.
 */
export function withBlogFeed(metadata: Metadata): Metadata {
  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      types: {
        "application/rss+xml": [{ url: BLOG_FEED_PATH, title: BLOG_FEED_TITLE }],
      },
    },
  };
}
