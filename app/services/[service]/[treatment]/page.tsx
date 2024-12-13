import { notFound } from "next/navigation";

import { ServicesNavigation } from "@/components/layout/services-pages/services-navigation";
import TreatmentContent from "@/components/layout/services-pages/treatment-content";
import TreatmentHeroSection from "@/components/layout/services-pages/treatment-hero-section";
import {
  ALL_SERVICES_QUERYResult,
  PRIMARY_CTA_BUTTON_QUERYResult,
  TREATMENT_BY_SLUG_QUERYResult,
} from "@/sanity.types";
import {
  ALL_SERVICES_QUERY,
  PRIMARY_CTA_BUTTON_QUERY,
  TREATMENT_BY_SLUG_QUERY,
} from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/server-client";

export default async function TreatmentPage({
  params,
}: {
  params: { service: string; treatment: string };
}) {
  const services = await sanityFetch<ALL_SERVICES_QUERYResult>({
    query: ALL_SERVICES_QUERY,
  });

  const treatment = await sanityFetch<TREATMENT_BY_SLUG_QUERYResult>({
    query: TREATMENT_BY_SLUG_QUERY,
    params: { slug: params.treatment },
  });

  const primaryCTA = await sanityFetch<PRIMARY_CTA_BUTTON_QUERYResult>({
    query: PRIMARY_CTA_BUTTON_QUERY,
  });

  if (!treatment) {
    return notFound();
  }

  const { heroImage } = treatment;

  return (
    <>
      <TreatmentHeroSection
        hero_image={{
          asset: { url: heroImage?.asset?.url! },
          alt: heroImage?.heroAlt!,
        }}
      />
      <ServicesNavigation services={services} />
      <TreatmentContent treatment={treatment} primaryCTA={primaryCTA} />
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { service: string; treatment: string };
}) {
  const treatmentPage = await sanityFetch<TREATMENT_BY_SLUG_QUERYResult>({
    query: TREATMENT_BY_SLUG_QUERY,
    params: { slug: params.treatment },
  });

  const { seo } = treatmentPage!;

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
