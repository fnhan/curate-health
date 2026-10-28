import type { Metadata } from "next";

import type { SanityImageCrop, SanityImageHotspot } from "@/sanity.types";
import {
  SHARE_IMAGE_HEIGHT,
  SHARE_IMAGE_WIDTH,
  wholeShareImageUrl,
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
 * One function instead. It is also where every page's canonical tag comes
 * from, CH-003, so that is one place rather than seventeen.
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
  /**
   * The alt typed against this picture in the Studio, on the image object.
   * Distinct from `asset.alt`, which is the one on the asset document in the
   * media library and is shared by every use of that file.
   */
  alt?: string | null;
  asset?: {
    _id?: string | null;
    url?: string | null;
    alt?: string | null;
  } | null;
  // Sanity's own shapes. These were Record<string, number> until the generated
  // types were refreshed, which exposed that a real crop also carries a
  // _type string and would not have fitted.
  crop?: SanityImageCrop | null;
  hotspot?: SanityImageHotspot | null;
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

/**
 * The site's own share card, for a page with no photograph of its own.
 *
 * The Curate Health mark embossed into cork yoga mats, which /about also
 * shows. It is held here rather than in the Studio for the same reason the
 * Google Business Profile URL is: it is an identity choice rather than
 * editorial copy, and a page reaching it has already run out of its own
 * pictures, so there is nothing for an editor to tune.
 *
 * **Reaching for this is a signal, not a solution.** A page sharing the house
 * card is a page whose own photograph nobody chose. `audit-share-cards.js`
 * names every page in that state so the list stays visible.
 */
export const SITE_SHARE_IMAGE: SeoImage = {
  alt: "The Curate Health logo embossed into cork yoga mats, lit from the side.",
  asset: {
    _id: "image-6dfb6e8c7b46336c007db415d1a447f197213e83-2920x3073-jpg",
    url: "https://cdn.sanity.io/images/rwc5kyvy/production/6dfb6e8c7b46336c007db415d1a447f197213e83-2920x3073.jpg",
  },
};

type BaseFallbacks = {
  /**
   * This page's own address, relative, e.g. "/services/physiotherapy". CH-003.
   *
   * Becomes the canonical tag and the share card's og:url, both resolved to
   * https://www.curatehealth.ca by the metadataBase in app/layout.tsx.
   *
   * Required on purpose. Before 2026-09-11 no page had a canonical, and every
   * page's share address was either missing or, on the homepage, the only
   * one set. Making this required means a new page cannot be added without
   * stating its address; TypeScript refuses the call.
   *
   * Pass the page's CANONICAL address, not whatever the visitor typed. For the
   * dynamic routes that means the one resolve() settled on, since any other
   * spelling of the URL has already been redirected by then.
   */
  path: string;
  title?: string;
  description?: string;
  /**
   * A different name to end the SHARE title with, instead of "Curate Health".
   *
   * The cafe trades under its own name, and Frank asked for its share card to
   * read "An Organic Cafe Where Food Is Medicine | Curate Cafe" on 2026-09-10.
   *
   * Share card only, deliberately. A first version applied this to the page
   * title too, and the cafe's page title is "Introducing Curate Cafe", so the
   * tab and the Google result read "Introducing Curate Cafe | Curate Cafe":
   * the doubled brand CH-006 exists to remove, in a new costume. The request
   * was about the share card, so that is all it touches.
   */
  shareBrand?: string;
  /**
   * Keeps the page out of the index, and drops its canonical with it.
   *
   * Only the 404 uses this, and it needs both halves. A 404 that is
   * indexable competes with the pages that should rank for the same words,
   * and a canonical on it would be worse: this page answers for every dead
   * address on the site, so naming one address as its own tells a crawler
   * that all of them are that page rather than gone.
   *
   * Do not reach for this to hide a thin page. Thin pages get fixed or
   * removed; noindex on one leaves it live for visitors and invisible to the
   * audits, which is how a page rots unnoticed.
   *
   * It is also the one thing that excuses a page from declaring a share
   * image, below, since a page nobody should find does not need a card.
   */
  noindex?: boolean;
  /**
   * A photo the page already shows, used as its share image when nobody has
   * chosen one in the Studio.
   *
   * **REQUIRED on any page that is indexed, since 2026-10-28.** Frank's rule:
   * "if those fields are not filled, that it will still be represented through
   * default settings of that page ... This should be a rule throughout the
   * whole website. And every new page we make moving forward."
   *
   * It matters now in a way it did not before. Both share images in the Studio
   * were `Rule.required().error()` until 2026-10-28, so in practice a page
   * always had one, and eleven routes passing no fallback went unnoticed: they
   * had a card only because an editor could not publish without filling the
   * field. The moment those became warnings, clearing one on /contact or a
   * treatment page would have stripped that page's card with nothing to say
   * so. Making this required is what closes that, and TypeScript refuses a new
   * page that skips it, exactly as it refuses one with no `path`.
   *
   * Pass a photograph the page itself shows. `SITE_SHARE_IMAGE` is the answer
   * only where the page genuinely has no photograph of its own.
   *
   * A share image set in the Studio still wins over this.
   */
  image: SeoImage;
  /**
   * This page's picture is a single object on a plain ground, a product shot
   * or a logo, so it is fitted whole into the 1200x630 card rather than
   * cropped to it.
   *
   * A scene has edges to spare and crops well. An object does not: crop it
   * and you cut the object. Applies to whichever picture ends up being used,
   * the Studio's or the fallback, because on these pages both are the same
   * kind of picture.
   */
  wholeImage?: boolean;
  /**
   * Marks the page as an article for share cards, with its dates. Blog posts
   * only. Every other page is a website, which is what share cards assume
   * when told nothing.
   */
  article?: {
    publishedTime?: string | null;
    modifiedTime?: string | null;
  };
};

/**
 * An indexed page must declare a share image; a noindex page need not.
 *
 * Written as a union rather than an optional field so the compiler states the
 * rule rather than a comment asking nicely. `app/not-found.tsx` is the only
 * caller taking the second branch, and its noindex arm emits no card at all.
 */
type Fallbacks =
  | (Omit<BaseFallbacks, "image" | "noindex"> & {
      noindex?: false;
      /**
       * `SeoImage | undefined` rather than `image?:`, which is the whole
       * trick: the property must be PRESENT, and the value it resolves to may
       * still be empty. So a route cannot forget this, and a route whose hero
       * is missing from the data is not forced to lie about having one. The
       * house card covers that case at render time.
       */
      image: SeoImage | undefined;
    })
  | (Omit<BaseFallbacks, "image" | "noindex"> & {
      noindex: true;
      image?: SeoImage;
    });

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
 * The asset id inside a Sanity image URL, for queries that selected the URL
 * and not the id. The blog post query is one: without this its photo went out
 * at full upload size rather than as a 1200x630 card.
 */
const SANITY_IMAGE_URL =
  /^https:\/\/cdn\.sanity\.io\/images\/[^/]+\/[^/]+\/([a-f0-9]+-\d+x\d+)\.([a-z]+)$/i;

function assetIdFromUrl(url: string) {
  const match = url.split("?")[0].match(SANITY_IMAGE_URL);
  return match ? `image-${match[1]}-${match[2]}` : undefined;
}

/**
 * An image entry only if there is actually an image.
 *
 * The hand-written versions passed `url: undefined!` when the field was empty,
 * which publishes an og:image tag pointing at nothing. A platform that follows
 * it shows a broken card, which is worse than showing none.
 */
export function imageEntry(
  image: SeoImage | undefined,
  alt: string,
  /**
   * The picture is a logo rather than a photograph, so it is letterboxed into
   * 1200x630 instead of cropped to it. Only the homepage passes this: its
   * share image is the Curate mark on transparency, and a 1.91:1 crop of a
   * square mark cuts the circle open at the top and bottom.
   */
  { whole = false } = {}
) {
  const url = image?.asset?.url?.trim();
  if (!url) return undefined;

  // Sized and cropped to 1200x630, honouring any crop set in the Studio. The
  // raw asset URL is the fallback for an image that is not in Sanity at all,
  // so an unexpected URL degrades to the old behaviour rather than dropping
  // the tag.
  const assetId = image?.asset?._id || assetIdFromUrl(url);
  /*
   * A PORTRAIT SOURCE IS CROPPED EVEN WHEN THE PAGE ASKED FOR WHOLE.
   *
   * Fitting works by making the picture small enough that all of it fits, so
   * a source taller than it is wide ends up a narrow strip in the middle of a
   * wide card with white either side. The supplements photograph is 5142x7709
   * and fitting it left the hand stranded in empty space, noticeably worse
   * than the crop it replaced, while the four square-ish cutouts beside it
   * were all improved. Cropping a portrait at least fills the card.
   *
   * Measured off the source dimensions Sanity writes into the filename, so
   * this needs nothing stored and cannot drift from the file.
   */
  const dimensions = url.match(/-(\d+)x(\d+)\.\w+(?:\?|$)/);
  const portrait = dimensions
    ? Number(dimensions[1]) < Number(dimensions[2])
    : false;

  let shareUrl: string;
  if (whole && !portrait) {
    shareUrl = wholeShareImageUrl(url);
  } else if (assetId) {
    shareUrl =
      urlForShareImage({
        _type: "image",
        asset: { _type: "reference", _ref: assetId },
        ...(image?.crop ? { crop: image.crop } : {}),
        ...(image?.hotspot ? { hotspot: image.hotspot } : {}),
      } as never) || url;
  } else {
    shareUrl = url;
  }

  return [
    {
      url: shareUrl,
      /*
       * The image object's own alt first, then the asset document's, then the
       * title handed in.
       *
       * Only the last two were read until 2026-10-13, and every alt written for
       * a share card is on the image object, so **every og:image:alt on the
       * site was the page's share title**. It looked plausible, which is why it
       * went unnoticed, and it was never the sentence anybody wrote. Same shape
       * as the CH-028 blog alt bug.
       */
      alt: image?.alt?.trim() || image?.asset?.alt?.trim() || alt,
      width: SHARE_IMAGE_WIDTH,
      height: SHARE_IMAGE_HEIGHT,
    },
  ];
}

export function buildPageMetadata(
  seo: SeoObject,
  fallbacks: Fallbacks
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

  // Fitted whole rather than cropped, on a page whose picture is one object
  // on a plain ground. The house card is a photograph, so it never takes it.
  const framing = { whole: fallbacks.wholeImage === true };

  const ownOgImages = imageEntry(
    seo?.socialMeta?.ogImage,
    socialTitle,
    framing
  );

  /*
   * Three deep, and the last one cannot fail.
   *
   *   1  the picture chosen in the Studio
   *   2  a photograph the page already shows, which every route now passes
   *   3  the house card
   *
   * Two is required of every indexed page by the type above, so three is
   * reached only when that photograph is itself missing from the data: a hero
   * nobody uploaded, a practitioner with no portrait. That used to publish a
   * page with no card at all, which is worse than a generic one, because a
   * link to it renders as a bare grey rectangle in every feed and chat window
   * it is pasted into.
   */
  const fallbackImages =
    imageEntry(fallbacks.image, socialTitle, framing) ??
    (fallbacks.noindex ? undefined : imageEntry(SITE_SHARE_IMAGE, socialTitle));
  const ogImages = ownOgImages ?? fallbackImages;

  // X reads og:image when a page has no X image of its own, so a page with a
  // chosen share image and no X image already shows the right picture there.
  // Only a page with neither takes the fallback photo on X as well, or X
  // would show the fallback in place of the image somebody chose.
  const twitterImages =
    imageEntry(seo?.socialMeta?.twitterImage, socialTitle, framing) ??
    (ownOgImages ? undefined : fallbackImages);

  /*
   * `absolute` is what stops Next applying the layout's title template, so a
   * share card ending in its own name does not also collect "| Curate
   * Health".
   *
   * A share title that already NAMES the brand mid-sentence is left alone,
   * which stripBrand cannot do for it: that only strips a trailing brand,
   * and "Health Notes From the Curate Health Team" carries it in the middle.
   * Appending anyway gave "... Curate Health Team | Curate Health", which is
   * CH-006 happening somewhere new. The approved wording stands and the
   * template gives way, because the brand is already said.
   */
  const shareTitle = fallbacks.shareBrand
    ? { absolute: `${socialTitle} | ${fallbacks.shareBrand}` }
    : socialTitle.toLowerCase().includes(BRAND.toLowerCase())
      ? { absolute: socialTitle }
      : socialTitle;

  /*
   * The site name and locale are repeated here because Next replaces the
   * layout's openGraph object with the page's rather than merging the two.
   * The layout sets both, and until 2026-09-18 every page but the homepage
   * dropped them, along with the page type, the one of the four required
   * share tags that was missing.
   */
  const shareSite = { siteName: BRAND, locale: "en_CA" };

  if (fallbacks.noindex) {
    return {
      title,
      description,
      robots: { index: false, follow: true },
      openGraph: {
        ...shareSite,
        type: "website",
        title: shareTitle,
        description: socialDescription,
      },
      twitter: { title: shareTitle, description: socialDescription },
    };
  }

  const shareType = fallbacks.article
    ? {
        type: "article" as const,
        ...(fallbacks.article.publishedTime
          ? { publishedTime: fallbacks.article.publishedTime }
          : {}),
        ...(fallbacks.article.modifiedTime
          ? { modifiedTime: fallbacks.article.modifiedTime }
          : {}),
      }
    : { type: "website" as const };

  return {
    title,
    description,
    alternates: { canonical: fallbacks.path },
    openGraph: {
      ...shareSite,
      ...shareType,
      url: fallbacks.path,
      title: shareTitle,
      description: socialDescription,
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: {
      title: shareTitle,
      description: socialDescription,
      ...(twitterImages ? { images: twitterImages } : {}),
    },
  };
}
