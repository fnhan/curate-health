import { treatmentPath } from "@/lib/service-urls";

/**
 * Where every breadcrumb trail on the site is decided. CH-009.
 *
 * One module rather than a builder per page, for the reason service-urls.ts
 * exists: a trail assembled inline on each page drifts from the others, and
 * the visible crumbs and the BreadcrumbList markup drift from each other
 * first. Both come from this, so they cannot disagree.
 *
 * THE TRAIL IS THE HIERARCHY, NOT THE URL
 *
 * These are not the same thing here and the difference is the point.
 * Treatments live flat at /services/physiotherapy, with the category taken out
 * of the URL by the restructure. The category is still real: Physiotherapy is
 * under Clinical Care, and a visitor who lands from search has no other way to
 * learn that. So the trail says Home > Services > Clinical Care >
 * Physiotherapy, four items over a two segment URL.
 *
 * That is allowed. schema.org and Google both treat BreadcrumbList as a
 * statement about position in the site, and Google's own documentation shows
 * trails that do not mirror the path. It is also the whole value here: the
 * flattening threw away a signal, and this is what puts it back.
 *
 * WHAT GETS A TRAIL
 *
 * Anything more than one level deep. The hubs themselves do not: a trail
 * reading Home > About on /about is one link to the page you are already
 * beneath, which is noise.
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

/**
 * The five about pages, by the names the navigation gives them.
 *
 * Not by their own headings, which are different and longer:
 * /about/pillars-of-health carries "Redefining Holistic Wellness with the 5
 * Pillars of Health". A crumb has to match the link the visitor followed to
 * get there, or the trail is describing a different page.
 *
 * These same five strings appear in SITE_SETTINGS_QUERY and ABOUT_INDEX_QUERY,
 * which is where the footer, the nav and the /about hub take them from. If one
 * is renamed, rename it in all three.
 */
const ABOUT_PAGE_NAMES: Record<string, string> = {
  "our-story": "Our Story",
  "our-team": "Our Team",
  "mission-and-values": "Mission and Values",
  "pillars-of-health": "Pillars of Health",
  sustainability: "Sustainability",
};

/** /about/our-team and its four siblings. */
export function aboutCrumbs(slug: string): Crumb[] {
  const name = ABOUT_PAGE_NAMES[slug];

  // An unknown slug means a sixth page was added without being named here.
  // Showing no trail is better than showing one that skips the page itself.
  if (!name) return [];

  return trail(
    { name: "About", path: "/about" },
    { name, path: `/about/${slug}` }
  );
}

/** /services/clinical-care and the other two category hubs. */
export function serviceCrumbs(title: string, slug: string): Crumb[] {
  return trail(
    { name: "Services", path: "/services" },
    { name: title, path: `/services/${slug}` }
  );
}

/**
 * A treatment, flat or nested.
 *
 * The category crumb is here whichever shape the URL takes, so
 * /services/physiotherapy and /services/recovery-sanctuary/outdoor-sauna
 * describe the same three levels. treatmentPath decides the last URL so this
 * cannot disagree with where the page actually lives.
 */
export function treatmentCrumbs(
  title: string,
  slug: string,
  serviceName: string | null | undefined,
  serviceSlug: string | null | undefined
): Crumb[] {
  const category: Crumb[] =
    serviceName && serviceSlug
      ? [{ name: serviceName, path: `/services/${serviceSlug}` }]
      : [];

  return trail({ name: "Services", path: "/services" }, ...category, {
    name: title,
    path: treatmentPath(serviceSlug, slug),
  });
}

/** /products/tens-machines and its four siblings. */
export function productCrumbs(title: string, slug: string): Crumb[] {
  return trail(
    { name: "Products", path: "/products" },
    { name: title, path: `/products/${slug}` }
  );
}

/** /blog/{post}. */
export function postCrumbs(title: string, slug: string): Crumb[] {
  return trail(
    { name: "Blog", path: "/blog" },
    { name: title, path: `/blog/${slug}` }
  );
}

/**
 * /legal/terms-of-use and its two siblings, with the Legal level left out.
 *
 * There is no /legal index. It has never existed and nothing plans one, so a
 * Legal crumb would be either a dangling piece of text among links or a link
 * to a 404.
 *
 * Leaving it out is better than rendering it unlinked. Google's BreadcrumbList
 * guidance expects a URL on every item except the last, and an intermediate
 * item without one risks the trail not being shown at all, which is the only
 * reason to build these. A shorter trail that is complete beats a longer one
 * with a hole in it, and Home > Terms of Use is true: these pages sit directly
 * under the site.
 *
 * If a /legal index is ever built, add the level here and nowhere else.
 */
export function legalCrumbs(title: string, slug: string): Crumb[] {
  return trail({ name: title, path: `/legal/${slug}` });
}

/**
 * /about/our-team/{practitioner}. CH-104.
 *
 * Four levels, because the team page is a real hub with its own address and a
 * visitor who lands on a practitioner from search needs the route back to the
 * rest of the team, not just to /about.
 */
export function practitionerCrumbs(name: string, slug: string): Crumb[] {
  return trail(
    { name: "About", path: "/about" },
    { name: "Our Team", path: "/about/our-team" },
    { name, path: `/about/our-team/${slug}` }
  );
}
