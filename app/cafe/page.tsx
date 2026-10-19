import { notFound } from "next/navigation";

import { CafeCtaBandSection } from "@/components/layout/cafe-page/cafe-cta-band";
import { CafeHours } from "@/components/layout/cafe-page/cafe-hours";
import {
  CafeIntroSection,
  CafeQuoteSection,
} from "@/components/layout/cafe-page/cafe-intro-and-quote";
import { CafeMenuBand } from "@/components/layout/cafe-page/cafe-menu-band";
import { AlternatingSections } from "@/components/shared/alternating-sections";
import { SanityImage } from "@/components/shared/sanity-image";
import { buildPageMetadata } from "@/lib/page-metadata";
import {
  CAFE_MENU_PATH,
  JsonLdScript,
  buildCafeJsonLd,
} from "@/lib/structured-data";
import {
  CAFE_MENU_QUERY_RESULT,
  CAFE_PAGE_QUERY_RESULT,
  SITE_SETTINGS_QUERY_RESULT,
} from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import {
  CAFE_MENU_QUERY,
  CAFE_PAGE_QUERY,
  SITE_SETTINGS_QUERY,
} from "@/sanity/lib/queries";

export default async function CafePage() {
  const cafePage = await sanityFetch<CAFE_PAGE_QUERY_RESULT>({
    query: CAFE_PAGE_QUERY,
  });

  // For the cafe's structured data only: its address, hours and its own
  // Instagram all live on siteSettings. CH-008.
  const siteSettings = await sanityFetch<SITE_SETTINGS_QUERY_RESULT>({
    query: SITE_SETTINGS_QUERY,
  });

  /*
   * The menu page, CH-108. Only its presence matters here: whether to link to
   * it, and whether the cafe's hasMenu markup should point at the Menu entity
   * there rather than at the PDF. One gate, the same one the route 404s on and
   * the sitemap lists on, so /cafe can never link to a page that is not there.
   */
  const menu = await sanityFetch<CAFE_MENU_QUERY_RESULT>({
    query: CAFE_MENU_QUERY,
  });

  const hasMenuPage = (menu?.sections ?? []).some(
    (section) => (section.items ?? []).length > 0
  );

  if (!cafePage) {
    return notFound();
  }

  const {
    heroSection,
    introSection,
    quoteSection,
    additionalSections,
    ctaBandSection,
  } = cafePage;

  return (
    <div className="font-poppins">
      <JsonLdScript
        data={buildCafeJsonLd(cafePage, siteSettings, hasMenuPage)}
        id="cafe-json-ld"
      />
      <SanityImage
        width={1920}
        height={1080}
        priority
        quality={100}
        sizes="100vw"
        source={heroSection?.heroImage?.image}
        src={heroSection?.heroImage?.image?.asset?.url || ""}
        alt={heroSection?.heroImage?.alt || ""}
        className="h-[400px] w-full object-cover md:h-[550px]"
      />
      <CafeIntroSection intro={introSection} />
      <CafeQuoteSection quote={quoteSection} />
      <AlternatingSections
        sections={additionalSections!}
        sectionClassName="font-poppins"
        proseClassName="font-poppins prose-headings:font-poppins prose-p:font-poppins"
      />
      {/*
        The menu band, directly under the last alternating section and above
        "Visit the cafe", which is the hours block. Frank, 2026-10-18: "above
        \"Visit the Cafe\" and just below the chia pudding photo".

        It was below the hours before this, because the first reading of
        "before the Visit the cafe section" took that for the CTA band at the
        foot of the page. It is not: CafeHours carries that heading.

        It replaces the What we're serving today card and the PDF download
        that sat in it, so there is one way into the menu rather than three.
      */}
      <CafeMenuBand menuPath={hasMenuPage ? CAFE_MENU_PATH : null} />
      <CafeHours siteSettings={siteSettings} />
      <CafeCtaBandSection data={ctaBandSection} />
    </div>
  );
}

export async function generateMetadata() {
  const cafePage = await sanityFetch<CAFE_PAGE_QUERY_RESULT>({
    query: CAFE_PAGE_QUERY,
  });

  const { seo } = cafePage!;

  // The cafe's share card ends with its own name rather than the site's, per
  // Frank on 2026-09-10. Its page title keeps the usual ending. It is the only
  // page that does either.
  return buildPageMetadata(seo, {
    path: "/cafe",
    shareBrand: "Curate Cafe",
  });
}
