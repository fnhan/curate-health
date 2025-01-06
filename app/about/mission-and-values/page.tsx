import Image from "next/image";
import { notFound } from "next/navigation";

import { AlternatingSections } from "@/components/shared/alternating-sections";
import { MISSION_AND_VALUES_QUERYResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import { MISSION_AND_VALUES_QUERY } from "@/sanity/lib/queries";

export default async function MissionAndValuesPage() {
  const missionAndValues = await sanityFetch<MISSION_AND_VALUES_QUERYResult>({
    query: MISSION_AND_VALUES_QUERY,
  });

  if (!missionAndValues) {
    return notFound();
  }

  const { heroSection, additionalSections } = missionAndValues;

  return (
    <>
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
      <AlternatingSections sections={additionalSections!} />
    </>
  );
}

export async function generateMetadata() {
  const missionAndValues = await sanityFetch<MISSION_AND_VALUES_QUERYResult>({
    query: MISSION_AND_VALUES_QUERY,
  });

  const { seo } = missionAndValues!;

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
