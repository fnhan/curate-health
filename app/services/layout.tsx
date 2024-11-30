import ServicesHeroSection from "@/components/layout/services-pages/services-hero-section";
import { ServicesNavigation } from "@/components/layout/services-pages/services-navigation";
import {
  ALL_SERVICES_QUERYResult,
  SERVICES_HERO_SECTION_QUERYResult,
} from "@/sanity.types";
import {
  ALL_SERVICES_QUERY,
  SERVICES_HERO_SECTION_QUERY,
} from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/server-client";

export default async function ServicesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { service?: string; treatment?: string };
}) {
  const servicesHeroSection =
    await sanityFetch<SERVICES_HERO_SECTION_QUERYResult>({
      query: SERVICES_HERO_SECTION_QUERY,
    });

  const services = await sanityFetch<ALL_SERVICES_QUERYResult>({
    query: ALL_SERVICES_QUERY,
  });

  return (
    <div>
      {/* Hero section renders differently per route */}
      {params.treatment ? null : params.service ? null : ( // <TreatmentHero /> // <ServiceHero />
        <ServicesHeroSection servicesHeroSection={servicesHeroSection} />
      )}

      <ServicesNavigation services={services} />
      {children}
    </div>
  );
}
