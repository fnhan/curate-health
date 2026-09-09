import type { Metadata } from "next";

import {
  SHARE_IMAGE_HEIGHT,
  SHARE_IMAGE_WIDTH,
  urlForShareImage,
} from "@/sanity/lib/image";

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
  asset?: {
    _id?: string | null;
    url?: string | null;
    alt?: string | null;
  } | null;
  crop?: Record<string, number> | null;
  hotspot?: Record<string, number> | null;
} | null;

type SeoObject = {
  pageTitle?: string | null;
  pageDescription?: string | null;
  socialMeta?: {
    title?: string | null;
    description?: string | null;
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

  // Sized and cropped to 1200x630, honouring any crop set in the Studio. The
  // raw asset URL is the fallback for the case where the query did not select
  // the asset id, so a missing _id degrades to the old behaviour rather than
  // dropping the tag.
  const shareUrl = image?.asset?._id
    ? urlForShareImage({
        _type: "image",
        asset: { _type: "reference", _ref: image.asset._id },
        ...(image.crop ? { crop: image.crop } : {}),
        ...(image.hotspot ? { hotspot: image.hotspot } : {}),
      } as never) || url
    : url;

  return [
    {
      url: shareUrl,
      alt: image?.asset?.alt?.trim() || alt,
      width: SHARE_IMAGE_WIDTH,
      height: SHARE_IMAGE_HEIGHT,
    },
  ];
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

  /**
   * A share card does a different job from a search result.
   *
   * A search result is answering "is this the thing I typed?", so its title
   * leads with the keyword. A share card is competing with everything else in
   * a feed, where nobody is looking for you, so its title has to give someone
   * a reason to stop. "Our Story" is a fine search result and a dead share
   * card. "The Heart Condition That Started Curate Health" is the reverse.
   *
   * These two fields have existed in the schema all along and nothing read
   * them, so they were free to rot: clinical-care's still said "Rehab" a
   * category rename later, and psychotherapy's held a caption describing a
   * forest. They were corrected and written for sharing before this was
   * wired up, in that order, because wiring them up first would have
   * published every one of those.
   *
   * Empty falls back to the page's own title and description, so a page with
   * nothing written for it still shares correctly rather than sharing blank.
   */
  const socialTitle = stripBrand(seo?.socialMeta?.title) || title;
  const socialDescription = seo?.socialMeta?.description?.trim() || description;

  const ogImages = imageEntry(seo?.socialMeta?.ogImage, socialTitle);
  const twitterImages = imageEntry(seo?.socialMeta?.twitterImage, socialTitle);

  return {
    title,
    description,
    openGraph: {
      title: socialTitle,
      description: socialDescription,
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: {
      title: socialTitle,
      description: socialDescription,
      ...(twitterImages ? { images: twitterImages } : {}),
    },
  };
}
