import Image from "next/image";
import { notFound } from "next/navigation";

import { CafeCtaBandSection } from "@/components/layout/cafe-page/cafe-cta-band";
import {
  CafeIntroSection,
  CafeQuoteSection,
} from "@/components/layout/cafe-page/cafe-intro-and-quote";
import { CafeMenuDownloadSection } from "@/components/layout/cafe-page/cafe-menu-download";
import { AlternatingSections } from "@/components/shared/alternating-sections";
import { CAFE_PAGE_QUERYResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import { CAFE_PAGE_QUERY } from "@/sanity/lib/queries";

export default async function CafePage() {
  const cafePage = await sanityFetch<CAFE_PAGE_QUERYResult>({
    query: CAFE_PAGE_QUERY,
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
    <main className="font-poppins">
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
    </main>
  );
}

export async function generateMetadata() {
  const cafePage = await sanityFetch<CAFE_PAGE_QUERYResult>({
    query: CAFE_PAGE_QUERY,
  });

  const { seo } = cafePage!;

  return {
    title: seo?.pageTitle,
    description: seo?.pageDescription,
    openGraph: {
      title: seo?.pageTitle,
      description: seo?.pageDescription,
      images: {
        url: seo?.socialMeta?.ogImage?.asset?.url!,
        alt: seo?.socialMeta?.ogImage?.asset?.alt!,
      },
    },
    twitter: {
      title: seo?.pageTitle,
      description: seo?.pageDescription,
      images: {
        url: seo?.socialMeta?.twitterImage?.asset?.url!,
        alt: seo?.socialMeta?.twitterImage?.asset?.alt!,
      },
    },
  };
}
