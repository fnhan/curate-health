/**
 * The site's own address, and the single source for it. CH-004.
 *
 * www, because that is the host that serves. The bare domain 308-redirects
 * here. This was the bare domain until 2026-09-11, so the sitemap, robots.txt,
 * llms.txt, every share card's address and every schema @id pointed at an
 * address that immediately redirected: Google was sent on a detour for every
 * URL the site published about itself.
 *
 * Read by app/layout.tsx (as metadataBase, which is what turns every page's
 * relative canonical into an absolute one), app/robots.ts,
 * app/sitemap.xml/route.ts, app/llms.txt/route.ts, lib/structured-data.tsx and
 * lib/links.ts. Changing it here changes all of them.
 */
export const BASEURL = "https://www.curatehealth.ca";
export const BRAND_NAME = "Curate Health";
