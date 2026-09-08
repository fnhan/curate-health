/**
 * Nested treatment pages, for Recovery Sanctuary only.
 *
 * Every other treatment now lives flat at /services/{treatment} and is served
 * by the parent route. Recovery Sanctuary keeps the category in its children
 * URLs deliberately: the name is a permanent brand asset, and
 * /services/recovery-sanctuary/flowpresso-therapy is the strongest ranking URL
 * on the site. See lib/service-urls.ts.
 *
 * This route still matches any /services/{a}/{b}, because two categories have
 * not been moved yet. next.config.mjs redirects the flattened ones, and
 * redirects run before routing, so those never reach here.
 */
import { notFound } from "next/navigation";

import { ServicesNavigation } from "@/components/layout/services-pages/services-navigation";
import TreatmentContent from "@/components/layout/services-pages/treatment-content";
import TreatmentHeroSection from "@/components/layout/services-pages/treatment-hero-section";
import { JsonLdScript, buildTreatmentJsonLd } from "@/lib/structured-data";
import {
  ALL_SERVICES_QUERYResult,
  PRIMARY_CTA_BUTTON_QUERYResult,
  TREATMENT_BY_SLUG_QUERYResult,
} from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import {
  ALL_SERVICES_QUERY,
  PRIMARY_CTA_BUTTON_QUERY,
  TREATMENT_BY_SLUG_QUERY,
} from "@/sanity/lib/queries";

export default async function TreatmentPage({
  params,
}: {
  params: { slug: string; treatment: string };
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
      <JsonLdScript
        data={buildTreatmentJsonLd(treatment)}
        id={`treatment-${params.treatment}-json-ld`}
      />
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
  params: { slug: string; treatment: string };
}) {
  const treatmentPage = await sanityFetch<TREATMENT_BY_SLUG_QUERYResult>({
    query: TREATMENT_BY_SLUG_QUERY,
    params: { slug: params.treatment },
  });

  // generateMetadata runs before the component, so returning null here left
  // the page with no metadata rather than a 404. See CH-001.
  if (!treatmentPage) {
    notFound();
  }

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
