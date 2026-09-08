import { BASEURL } from "@/app/site-settings";

/**
 * Decides whether a link leaves the site, and returns the anchor props for it.
 *
 * Spread onto any <a> whose href comes from Sanity or is otherwise not a
 * hardcoded internal path:
 *
 *   <a href={ctaLink} {...externalLinkProps(ctaLink)}>
 *
 * Editors paste whatever they like into a link field. Jane, Instagram, a
 * Google Maps URL, a PDF, or a path back into this site. Deciding per link at
 * render time is what makes "external opens a new tab" hold everywhere,
 * including for links that do not exist yet.
 *
 * WHAT COUNTS AS EXTERNAL
 *
 * An absolute http or https URL on a host other than this one. Everything else
 * stays in the current tab:
 *
 *   Relative paths and fragments, which are this site.
 *   Absolute URLs on curatehealth.ca, including the bare domain, which is the
 *   same site even though it redirects to www.
 *   mailto: and tel:, which hand off to a mail or phone app. Opening those in
 *   a new tab leaves an empty tab behind on desktop and does nothing useful.
 *
 * A malformed href is treated as internal. A link that does not parse is
 * already broken, and forcing a new tab would not improve it.
 */

/** Hosts that are this site. Compared without the www prefix. */
function normaliseHost(host: string) {
  return host.toLowerCase().replace(/^www\./, "");
}

const SITE_HOST = (() => {
  try {
    return normaliseHost(new URL(BASEURL).host);
  } catch {
    return "curatehealth.ca";
  }
})();

export function isExternalHref(href: string | null | undefined): boolean {
  const value = href?.trim();
  if (!value) return false;

  // Same document, same site.
  if (value.startsWith("/") || value.startsWith("#")) return false;

  // Hands off to another application rather than to a page.
  if (/^(mailto:|tel:|sms:)/i.test(value)) return false;

  // Protocol-relative, //example.com
  const candidate = value.startsWith("//") ? `https:${value}` : value;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    // Not absolute, so it is a relative path on this site.
    return false;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return false;

  return normaliseHost(url.host) !== SITE_HOST;
}

/**
 * Anchor props for a link that may or may not leave the site.
 *
 * rel travels with target. noopener stops the opened page reaching back
 * through window.opener, and noreferrer withholds the referring URL.
 */
export function externalLinkProps(href: string | null | undefined) {
  return isExternalHref(href)
    ? ({ target: "_blank", rel: "noopener noreferrer" } as const)
    : ({} as const);
}
