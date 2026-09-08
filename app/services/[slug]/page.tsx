import { notFound } from "next/navigation";

import ServiceContent from "@/components/layout/services-pages/service-content";
import ServiceHeroSection from "@/components/layout/services-pages/service-hero-section";
import { ServicesNavigation } from "@/components/layout/services-pages/services-navigation";
import TreatmentContent from "@/components/layout/services-pages/treatment-content";
import TreatmentHeroSection from "@/components/layout/services-pages/treatment-hero-section";
import {
  JsonLdScript,
  buildServiceJsonLd,
  buildTreatmentJsonLd,
} from "@/lib/structured-data";
import {
  ALL_SERVICES_QUERYResult,
  PRIMARY_CTA_BUTTON_QUERYResult,
  SERVICE_BY_SLUG_QUERYResult,
  TREATMENT_BY_SLUG_QUERYResult,
} from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import {
  ALL_SERVICES_QUERY,
  PRIMARY_CTA_BUTTON_QUERY,
  SERVICE_BY_SLUG_QUERY,
  TREATMENT_BY_SLUG_QUERY,
} from "@/sanity/lib/queries";

/**
 * One segment, two kinds of page.
 *
 * /services/one-on-one-care is a category hub. /services/physiotherapy is a
 * treatment. Both sit at /services/{slug} because the restructure took the
 * category out of child URLs, so this route has to work out which it is.
 *
 * Categories win. A category slug and a treatment slug can collide, and one
 * pair does today: "exercise-therapy" is both a category and a treatment under
 * the orphaned lifestyle-medicine branch. Resolving categories first keeps the
 * hub reachable, and that treatment is being retired into the hub anyway.
 * Adding a treatment whose slug matches a category would make it unreachable
 * rather than break the hub, which is the safer of the two failures.
 *
 * Recovery Sanctuary treatments do not come through here. They stay nested and
 * are served by [slug]/[treatment]. See lib/service-urls.ts.
 */
async function resolve(slug: string) {
  const service = await sanityFetch<SERVICE_BY_SLUG_QUERYResult>({
    query: SERVICE_BY_SLUG_QUERY,
    params: { slug },
  });

  if (service) return { kind: "service" as const, service };

  const treatment = await sanityFetch<TREATMENT_BY_SLUG_QUERYResult>({
    query: TREATMENT_BY_SLUG_QUERY,
    params: { slug },
  });

  if (treatment) return { kind: "treatment" as const, treatment };

  return { kind: "none" as const };
}

export default async function ServiceOrTreatmentPage({
  params,
}: {
  params: { slug: string };
}) {
  const services = await sanityFetch<ALL_SERVICES_QUERYResult>({
    query: ALL_SERVICES_QUERY,
  });

  const resolved = await resolve(params.slug);

  // An unknown slug is a 404, not an empty 200. See CH-001.
  if (resolved.kind === "none") {
    notFound();
  }

  if (resolved.kind === "treatment") {
    const { treatment } = resolved;
    const primaryCTA = await sanityFetch<PRIMARY_CTA_BUTTON_QUERYResult>({
      query: PRIMARY_CTA_BUTTON_QUERY,
    });

    return (
      <>
        <JsonLdScript
          data={buildTreatmentJsonLd(treatment)}
          id={`treatment-${params.slug}-json-ld`}
        />
        <TreatmentHeroSection
          hero_image={{
            asset: { url: treatment.heroImage?.asset?.url! },
            alt: treatment.heroImage?.heroAlt!,
          }}
        />
        <ServicesNavigation services={services} />
        <TreatmentContent treatment={treatment} primaryCTA={primaryCTA} />
      </>
    );
  }

  const { service } = resolved;
  const { hero_image, hero_alt } = service;

  return (
    <>
      <JsonLdScript
        data={buildServiceJsonLd(service)}
        id={`service-${params.slug}-json-ld`}
      />
      <ServiceHeroSection
        hero_image={{ asset: { url: hero_image! }, alt: hero_alt! }}
      />
      <ServicesNavigation services={services} />
      <ServiceContent service={service} />
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const resolved = await resolve(params.slug);

  // generateMetadata runs before the component, so an unguarded destructure
  // here throws a 500 before the 404 can happen. See CH-001.
  if (resolved.kind === "none") {
    notFound();
  }

  const seo =
    resolved.kind === "treatment"
      ? resolved.treatment.seo
      : resolved.service.seo;

  const fallbackTitle = "Services";
  const fallbackDescription =
    "Explore our comprehensive healthcare services at Curate Health, offering personalized chiropractic care, rehabilitation, and holistic wellness solutions.";

  return {
    title: seo?.pageTitle || fallbackTitle,
    description: seo?.pageDescription || fallbackDescription,
    openGraph: {
      title: seo?.pageTitle || fallbackTitle,
      description: seo?.pageDescription || fallbackDescription,
      images: {
        url: seo?.socialMeta?.ogImage?.asset?.url!,
        alt: seo?.socialMeta?.ogImage?.asset?.alt!,
      },
    },
    twitter: {
      title: seo?.pageTitle || fallbackTitle,
      description: seo?.pageDescription || fallbackDescription,
      images: {
        url: seo?.socialMeta?.twitterImage?.asset?.url!,
        alt: seo?.socialMeta?.twitterImage?.asset?.alt!,
      },
    },
  };
}
