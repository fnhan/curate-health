import ServiceHeroSection from "@/components/layout/services-pages/service-hero-section";
import ServiceLifestyleContent from "@/components/layout/services-pages/service-lifestyle";
import { ServicesNavigation } from "@/components/layout/services-pages/services-navigation";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { serviceCrumbs } from "@/lib/breadcrumbs";
import { buildPageMetadata } from "@/lib/page-metadata";
import { JsonLdScript, buildLifestyleJsonLd } from "@/lib/structured-data";
import {
  ALL_SERVICES_QUERYResult,
  SERVICE_LIFESTYLE_BY_SLUG_QUERYResult,
} from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import {
  ALL_SERVICES_QUERY,
  SERVICE_LIFESTYLE_BY_SLUG_QUERY,
} from "@/sanity/lib/queries";

export default async function ServiceLifestylePage() {
  const services = await sanityFetch<ALL_SERVICES_QUERYResult>({
    query: ALL_SERVICES_QUERY,
  });

  const service = await sanityFetch<SERVICE_LIFESTYLE_BY_SLUG_QUERYResult>({
    query: SERVICE_LIFESTYLE_BY_SLUG_QUERY,
    params: { slug: "curate-lifestyle" },
  });

  if (!service) {
    return null;
  }

  const { hero_image, hero_alt } = service;

  return (
    <>
      <JsonLdScript
        data={buildLifestyleJsonLd({
          title: service.title,
          path: "/services/curate-lifestyle",
          description: service.seo?.pageDescription,
          image: hero_image,
        })}
        id="curate-lifestyle-json-ld"
      />
      <ServiceHeroSection
        hero_image={{ asset: { url: hero_image! }, alt: hero_alt! }}
      />
      <Breadcrumbs
        crumbs={serviceCrumbs(
          service.title?.trim() || "Curate Lifestyle",
          "curate-lifestyle"
        )}
      />
      <ServicesNavigation services={services} />
      <ServiceLifestyleContent service={service} />
    </>
  );
}

export async function generateMetadata() {
  const servicePage = await sanityFetch<SERVICE_LIFESTYLE_BY_SLUG_QUERYResult>({
    query: SERVICE_LIFESTYLE_BY_SLUG_QUERY,
    params: { slug: "curate-lifestyle" },
  });

  const { seo } = servicePage!;

  const fallbackTitle = "Services";
  const fallbackDescription =
    "Explore our comprehensive healthcare services at Curate Health, offering personalized chiropractic care, rehabilitation, and holistic wellness solutions.";

  return buildPageMetadata(seo, { path: "/services/curate-lifestyle" });
}
