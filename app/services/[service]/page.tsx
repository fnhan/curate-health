import ServiceContent from "@/components/layout/services-pages/service-content";
import ServiceHeroSection from "@/components/layout/services-pages/service-hero-section";
import { ServicesNavigation } from "@/components/layout/services-pages/services-navigation";
import { ALL_SERVICES_QUERYResult, SERVICE_BY_SLUG_QUERYResult } from "@/sanity.types";
import {
  ALL_SERVICES_QUERY,
  SERVICE_BY_SLUG_QUERY,
} from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/server-client";

export default async function ServicePage({
  params,
}: {
  params: { service: string };
}) {
  const services = await sanityFetch<ALL_SERVICES_QUERYResult>({
    query: ALL_SERVICES_QUERY,
  });

  const service = await sanityFetch<SERVICE_BY_SLUG_QUERYResult>({
    query: SERVICE_BY_SLUG_QUERY,
    params: { slug: params.service },
  });

  if (!service) {
    return null;
  }

  const { hero_image, hero_alt } = service;

  return (
    <>
      <ServiceHeroSection
        hero_image={{ asset: { url: hero_image! }, alt: hero_alt! }}
      />
      <ServicesNavigation services={services} />
      <ServiceContent service={service} />
    </>
  );
}
