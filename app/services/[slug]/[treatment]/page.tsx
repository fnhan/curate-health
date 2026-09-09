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
import { buildPageMetadata } from "@/lib/page-metadata";
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

/**
 * Resolves one nested URL, shared by the component and by generateMetadata.
 *
 * It has to be shared. These two ran their own logic before, and the alias
 * below existed only in the component, so generateMetadata reached its
 * notFound() first and a renamed treatment 404'd instead of redirecting. Two
 * live indexed URLs went down that way. generateMetadata runs before the
 * component, which is the same ordering trap as CH-001.
 */
async function resolve(slug: string, treatmentSlug: string) {
  const treatment = await sanityFetch<TREATMENT_BY_SLUG_QUERYResult>({
    query: TREATMENT_BY_SLUG_QUERY,
    params: { slug: treatmentSlug },
  });

  // One treatment, one canonical URL, decided by its own category rather than
  // by whatever category the visitor happened to type. Anything else
  // redirects. This also means a treatment moving between categories needs no
  // hand-written redirect: its old URL stops being canonical and starts
  // redirecting on its own.
  if (treatment) {
    const canonical = treatmentPath(treatment.serviceSlug, treatmentSlug);

    if (canonical !== `/services/${slug}/${treatmentSlug}`) {
      return { kind: "redirect" as const, to: canonical };
    }

    return { kind: "treatment" as const, treatment };
  }

  // No treatment by that slug. It may have been renamed, in which case send
  // the visitor wherever it lives now rather than 404ing an indexed URL.
  const newSlug = renamedTreatmentSlug(treatmentSlug);

  if (newSlug) {
    const renamed = await sanityFetch<TREATMENT_BY_SLUG_QUERYResult>({
      query: TREATMENT_BY_SLUG_QUERY,
      params: { slug: newSlug },
    });

    if (renamed) {
      return {
        kind: "redirect" as const,
        to: treatmentPath(renamed.serviceSlug, newSlug),
      };
    }
  }

  return { kind: "none" as const };
}

export default async function TreatmentPage({
  params,
}: {
  params: { slug: string; treatment: string };
}) {
  const services = await sanityFetch<ALL_SERVICES_QUERYResult>({
    query: ALL_SERVICES_QUERY,
  });

  const resolved = await resolve(params.slug, params.treatment);

  if (resolved.kind === "redirect") {
    permanentRedirect(resolved.to);
  }

  if (resolved.kind === "none") {
    notFound();
  }

  const { treatment } = resolved;

  const primaryCTA = await sanityFetch<PRIMARY_CTA_BUTTON_QUERYResult>({
    query: PRIMARY_CTA_BUTTON_QUERY,
  });

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
  // Same resolution as the component, deliberately. This runs first, so any
  // logic it does not share is logic the component never gets to apply.
  const resolved = await resolve(params.slug, params.treatment);

  if (resolved.kind === "redirect") {
    permanentRedirect(resolved.to);
  }

  if (resolved.kind === "none") {
    notFound();
  }

  const { seo } = resolved.treatment;

  return buildPageMetadata(seo);
}
