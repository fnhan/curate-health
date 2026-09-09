/**
 * The single source of truth for where a service or treatment page lives.
 *
 * Eleven places in this codebase built these URLs by hand: the hub listings,
 * the site nav, search, the sitemap, llms.txt and the structured data. When
 * treatments flattened out of /services/{category}/{treatment} into
 * /services/{treatment}, any one of them left behind would have gone on
 * emitting links to URLs that now redirect, or worse, 404. Route every one of
 * them through here.
 *
 * THE SHAPE, AND THE ONE EXCEPTION
 *
 * Treatments live at /services/{treatment}. The category is not in the URL,
 * which is the point: the restructure renamed two categories, and a category
 * baked into a child URL makes renaming it a redirect exercise every time.
 *
 * Recovery Sanctuary is the deliberate exception and stays nested. Its
 * children keep /services/recovery-sanctuary/{treatment}. Two reasons, both
 * from the restructure brief: the name is a permanent brand asset that will
 * not be renamed, and /services/recovery-sanctuary/flowpresso-therapy is the
 * strongest ranking URL on the site. It is not worth moving.
 */

/**
 * Categories whose children keep the category in their URL.
 *
 * Adding a slug here moves every child of that category and needs redirects
 * from the old flat URLs. Removing one does the reverse. Neither is a small
 * change, which is why this is a named constant rather than a literal.
 */
export const NESTED_SERVICE_SLUGS = new Set(["recovery-sanctuary"]);

/** Strips stray slashes so a Sanity slug saved as "/foo/" still resolves. */
function clean(slug: string | null | undefined): string {
  return (slug ?? "").trim().replace(/^\/+|\/+$/g, "");
}

export function isNestedService(
  serviceSlug: string | null | undefined
): boolean {
  return NESTED_SERVICE_SLUGS.has(clean(serviceSlug));
}

/** The hub page for a category, /services/{category}. */
export function servicePath(serviceSlug: string | null | undefined): string {
  const service = clean(serviceSlug);

  return service ? `/services/${service}` : "/services";
}

/**
 * Where a treatment page lives.
 *
 * The service slug is still required, because it decides whether the treatment
 * is nested. Passing the wrong one produces a URL that 404s rather than one
 * that quietly points at the wrong page.
 */
export function treatmentPath(
  serviceSlug: string | null | undefined,
  treatmentSlug: string | null | undefined
): string {
  const service = clean(serviceSlug);
  const treatment = clean(treatmentSlug);

  if (!treatment) return servicePath(service);

  return isNestedService(service)
    ? `/services/${service}/${treatment}`
    : `/services/${treatment}`;
}

/**
 * Category slugs that have been renamed, old to new.
 *
 * These exist so the rename never opens a gap. A redirect in next.config.mjs
 * would have to ship either before the Sanity slug changes, pointing at a page
 * that does not exist yet, or after, leaving a live indexed URL on 404 in
 * between. Neither window is acceptable on a category hub.
 *
 * Resolving the alias in the route removes the window entirely. While Sanity
 * still says "rehab", /services/rehab matches a real service and this is never
 * consulted. The moment the slug changes, the same URL stops matching and
 * falls through to here, which redirects it. Nothing is ever broken, in either
 * order, and the deploy and the content change do not have to be simultaneous.
 *
 * Checked before treatments on purpose. "exercise-therapy" is also a treatment
 * slug on the orphaned lifestyle-medicine branch, so without this ordering the
 * old category URL would quietly start serving that treatment page instead of
 * redirecting to the renamed hub.
 *
 * These entries are permanent. The old URLs were indexed, so they keep
 * redirecting rather than being cleaned up later.
 */
export const RENAMED_SERVICE_SLUGS: Record<string, string> = {
  rehab: "one-on-one-care",
  "exercise-therapy": "movement-and-training",
  "one-on-one-care": "clinical-care",
};

/** The new home of a renamed category, or null if the slug was not renamed. */
export function renamedServicePath(
  slug: string | null | undefined
): string | null {
  const target = RENAMED_SERVICE_SLUGS[clean(slug)];

  return target ? servicePath(target) : null;
}
