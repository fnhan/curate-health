import Image from "next/image";
import { notFound } from "next/navigation";

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

  const { heroSection, additionalSections } = cafePage;

  return (
    <>
      <Image
        width={1440}
        height={1080}
        src={heroSection?.heroImage?.image?.asset?.url || ""}
        alt={heroSection?.heroImage?.alt || ""}
        className="h-[400px] w-full object-cover md:h-[550px]"
      />
      <AlternatingSections sections={additionalSections!} />
    </>
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
