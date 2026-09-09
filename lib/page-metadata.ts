import type { Metadata } from "next";

/**
 * Builds the metadata block for a page from its Sanity `seo` object.
 *
 * Fifteen pages assembled this by hand, each repeating the same title three
 * times for the tab, the Open Graph card and the X card. That is 45 places for
 * the three to drift apart, and they had: the Outdoor Cold Plunge page carried
 * a heading reading "Outdoor Cold Plunge" and a tab reading "Cold Plunge",
 * because renaming the page in Sanity changes `title` and nothing makes
 * `seo.pageTitle` follow.
 *
 * One function instead. It is also the single place to add canonical tags when
 * CH-003 is done, rather than fifteen.
 *
 * THE BRAND IS APPENDED ONCE, NEVER TWICE
 *
 * app/layout.tsx sets a title template of "%s | Curate Health", so Next adds
 * the brand to whatever a page returns. Sixteen stored titles already ended
 * with it, so they rendered as "... | Curate Health | Curate Health". That is
 * CH-006, and it is also why so many titles ran past the 60 characters Google
 * shows before truncating.
 *
 * Stripping here fixes every one of them at once and, unlike correcting the
 * stored values, keeps working when someone types the brand into the field
 * again next year. Both were done: the data was corrected too, so the Studio
 * shows what actually renders.
 */

const BRAND = "Curate Health";

/** Matches a trailing brand with any of the separators editors actually use. */
const TRAILING_BRAND = new RegExp(`\\s*[|\\-–—:]\\s*${BRAND}\\s*$`, "i");

export function stripBrand(title: string | null | undefined): string {
  let out = (title ?? "").trim();

  // Loop, because a value can already carry it twice.
  while (TRAILING_BRAND.test(out)) {
    out = out.replace(TRAILING_BRAND, "").trim();
  }

  return out;
}

type SeoImage = {
  asset?: { url?: string | null; alt?: string | null } | null;
} | null;

type SeoObject = {
  pageTitle?: string | null;
  pageDescription?: string | null;
  socialMeta?: {
    ogImage?: SeoImage;
    twitterImage?: SeoImage;
  } | null;
} | null;

type Fallbacks = {
  title?: string;
  description?: string;
};

/**
 * Used only when a page has no title or description of its own.
 *
 * Deliberately generic. A page reaching these is a page that needs its own
 * copy written, and scripts/audit-seo-fields.js is what finds them. Something
 * neutral rendering is better than Google inventing a snippet, which is what
 * happened on /about/pillars-of-health while its title was empty.
 */
// Deliberately does not contain the brand. The layout appends it, so a
// fallback of "Curate Health" renders as "Curate Health | Curate Health",
// which is the defect this file exists to prevent.
const DEFAULT_TITLE = "Health and Wellness in Midtown Toronto";
const DEFAULT_DESCRIPTION =
  "A curated health and wellness destination in Midtown Toronto.";

/**
 * An image entry only if there is actually an image.
 *
 * The hand-written versions passed `url: undefined!` when the field was empty,
 * which publishes an og:image tag pointing at nothing. A platform that follows
 * it shows a broken card, which is worse than showing none.
 */
function imageEntry(image: SeoImage | undefined, alt: string) {
  const url = image?.asset?.url?.trim();
  if (!url) return undefined;

  return [{ url, alt: image?.asset?.alt?.trim() || alt }];
}

export function buildPageMetadata(
  seo: SeoObject,
  fallbacks: Fallbacks = {}
): Metadata {
  const title = stripBrand(seo?.pageTitle) || fallbacks.title || DEFAULT_TITLE;
  const description =
    seo?.pageDescription?.trim() ||
    fallbacks.description ||
    DEFAULT_DESCRIPTION;

  const ogImages = imageEntry(seo?.socialMeta?.ogImage, title);
  const twitterImages = imageEntry(seo?.socialMeta?.twitterImage, title);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: {
      title,
      description,
      ...(twitterImages ? { images: twitterImages } : {}),
    },
  };
}
