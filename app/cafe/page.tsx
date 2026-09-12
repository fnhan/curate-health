import Image from "next/image";
import { notFound } from "next/navigation";

import { CafeCtaBandSection } from "@/components/layout/cafe-page/cafe-cta-band";
import {
  CafeIntroSection,
  CafeQuoteSection,
} from "@/components/layout/cafe-page/cafe-intro-and-quote";
import { CafeMenuDownloadSection } from "@/components/layout/cafe-page/cafe-menu-download";
import { AlternatingSections } from "@/components/shared/alternating-sections";
import { buildPageMetadata } from "@/lib/page-metadata";
import { JsonLdScript, buildCafeJsonLd } from "@/lib/structured-data";
import {
  CAFE_PAGE_QUERYResult,
  SITE_SETTINGS_QUERYResult,
} from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import { CAFE_PAGE_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";

export default async function CafePage() {
  const cafePage = await sanityFetch<CAFE_PAGE_QUERYResult>({
    query: CAFE_PAGE_QUERY,
  });

  // For the cafe's structured data only: its address, hours and its own
  // Instagram all live on siteSettings. CH-008.
  const siteSettings = await sanityFetch<SITE_SETTINGS_QUERYResult>({
    query: SITE_SETTINGS_QUERY,
  });

  if (!cafePage) {
    return notFound();
  }

  const {
    heroSection,
    introSection,
    quoteSection,
    additionalSections,
    menuDownloadSection,
    ctaBandSection,
  } = cafePage;

  return (
    <div className="font-poppins">
      <JsonLdScript
        data={buildCafeJsonLd(cafePage, siteSettings)}
        id="cafe-json-ld"
      />
      <Image
        width={1920}
        height={1080}
        priority
        quality={100}
        sizes="100vw"
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
      <CafeMenuDownloadSection data={menuDownloadSection} />
      <CafeCtaBandSection data={ctaBandSection} />
    </div>
  );
}

export async function generateMetadata() {
  const cafePage = await sanityFetch<CAFE_PAGE_QUERYResult>({
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
