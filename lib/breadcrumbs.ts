/**
 * Where every breadcrumb trail on the site is decided. CH-009.
 *
 * ONLY BLOG POSTS CARRY A TRAIL, SINCE 2026-09-20.
 *
 * They were on 43 pages. Frank took them off everything else that day: the
 * service, treatment and product pages already show a section menu under the
 * header, and the about, practitioner and legal pages are reached from a hub
 * that links straight to them. A blog post is the one page with no menu of
 * its own and no obvious way back, so it keeps its trail.
 *
 * What that costs, recorded so nobody rediscovers it the hard way: Google
 * draws the breadcrumb line in a result from this markup, so those results
 * show the bare address instead. Crawling is unaffected, since every page is
 * still linked from its hub. Do not put trails back without asking him.
 *
 * The visible crumbs and the BreadcrumbList markup are both built from the
 * Crumb list below, by components/shared/breadcrumbs.tsx, so they cannot
 * disagree. Google compares the two.
 */

export type Crumb = {
  name: string;
  /** The page this crumb links to, or null for the page being viewed. */
  path: string | null;
};

const HOME: Crumb = { name: "Home", path: "/" };

/**
 * Builds a trail, dropping the link from whatever ends up last.
 *
 * The last crumb is the current page, and a link to the page you are on is a
 * dead control for a sighted visitor and a confusing one for a screen reader.
 * Google says the same about the markup: the final ListItem does not need an
 * item URL. Doing it here rather than at each call site means no page can
 * forget.
 */
function trail(...items: Crumb[]): Crumb[] {
  /*
   * Names are trimmed because titles come from Sanity and some carry trailing
   * whitespace. "Outdoor Pilates " is stored that way today. Untrimmed, the
   * rendered HTML collapses the space and the JSON-LD keeps it, so the visible
   * trail and the markup disagree over a character nobody can see. Google
   * compares those two.
   */
  const all = [HOME, ...items]
    .map((item) => ({ ...item, name: item.name?.trim() ?? "" }))
    .filter((item) => item.name);

  return all.map((item, index) =>
    index === all.length - 1 ? { ...item, path: null } : item
  );
}

/** /blog/{post}, the one trail left on the site. */
export function postCrumbs(title: string, slug: string): Crumb[] {
  return trail(
    { name: "Blog", path: "/blog" },
    { name: title, path: `/blog/${slug}` }
  );
}
