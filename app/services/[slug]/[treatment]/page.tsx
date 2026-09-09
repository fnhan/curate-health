/**
 * Nested treatment pages, for Recovery Sanctuary only.
 *
 * Every other treatment now lives flat at /services/{treatment} and is served
 * by the parent route. Recovery Sanctuary keeps the category in its children
 * URLs deliberately: the name is a permanent brand asset, and
 * /services/recovery-sanctuary/flowpresso-therapy is the strongest ranking URL
 * on the site. See lib/service-urls.ts.
 *
 * This route matches any /services/{a}/{b}, and used to look the treatment up
 * by its slug alone, ignoring the category segment completely. That meant
 * /services/anything-at-all/physiotherapy served the physiotherapy page, so
 * every treatment was reachable at an unlimited number of URLs. Canonical
 * enforcement below is what closes that.
 */
import { notFound, permanentRedirect } from "next/navigation";

import { ServicesNavigation } from "@/components/layout/services-pages/services-navigation";
import TreatmentContent from "@/components/layout/services-pages/treatment-content";
import TreatmentHeroSection from "@/components/layout/services-pages/treatment-hero-section";
import { renamedTreatmentSlug, treatmentPath } from "@/lib/service-urls";
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

  // One treatment, one canonical URL, decided by its own category rather than
  // by whatever category the visitor happened to type. Anything else redirects.
  //
  // This also means a treatment moving between categories needs no
  // hand-written redirect. Its old URL simply stops being canonical and starts
  // redirecting on its own, which is the whole reason the category came out of
  // child URLs in the first place.
  if (treatment) {
    const canonical = treatmentPath(treatment.serviceSlug, params.treatment);
    const requested = `/services/${params.slug}/${params.treatment}`;

    if (canonical !== requested) {
      permanentRedirect(canonical);
    }
  } else {
    // No treatment by that slug. It may have been renamed, in which case send
    // the visitor wherever it lives now rather than 404ing an indexed URL.
    const newSlug = renamedTreatmentSlug(params.treatment);

    if (newSlug) {
      const renamed = await sanityFetch<TREATMENT_BY_SLUG_QUERYResult>({
        query: TREATMENT_BY_SLUG_QUERY,
        params: { slug: newSlug },
      });

      if (renamed) {
        permanentRedirect(treatmentPath(renamed.serviceSlug, newSlug));
      }
    }
  }

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
