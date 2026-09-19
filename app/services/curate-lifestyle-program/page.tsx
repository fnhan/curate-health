import ServiceHeroSection from "@/components/layout/services-pages/service-hero-section";
import ServiceLifestyleProgramContent from "@/components/layout/services-pages/service-lifestyle-program";
import { ServicesNavigation } from "@/components/layout/services-pages/services-navigation";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { lifestyleProgramCrumbs } from "@/lib/breadcrumbs";
import { buildPageMetadata } from "@/lib/page-metadata";
import { JsonLdScript, buildLifestyleJsonLd } from "@/lib/structured-data";
import {
  ALL_SERVICES_QUERYResult,
  SERVICE_LIFESTYLE_PROGRAM_BY_SLUG_QUERYResult,
} from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import {
  ALL_SERVICES_QUERY,
  SERVICE_LIFESTYLE_PROGRAM_BY_SLUG_QUERY,
} from "@/sanity/lib/queries";

export default async function ServiceLifestylePage() {
  const services = await sanityFetch<ALL_SERVICES_QUERYResult>({
    query: ALL_SERVICES_QUERY,
  });

  const program =
    await sanityFetch<SERVICE_LIFESTYLE_PROGRAM_BY_SLUG_QUERYResult>({
      query: SERVICE_LIFESTYLE_PROGRAM_BY_SLUG_QUERY,
      params: { slug: "curate-lifestyle-program" },
    });

  if (!program) {
    return null;
  }

  const { heroImage } = program;

  return (
    <>
      <JsonLdScript
        data={buildLifestyleJsonLd({
          title: program.title,
          path: "/services/curate-lifestyle-program",
          description: program.seo?.pageDescription,
          image: heroImage?.asset?.url,
        })}
        id="curate-lifestyle-program-json-ld"
      />
      <ServiceHeroSection
        hero_image={{
          asset: { url: heroImage?.asset?.url! },
          alt: heroImage?.heroAlt!,
        }}
      />
      <Breadcrumbs
        crumbs={lifestyleProgramCrumbs(
          program.title?.trim() || "Curate Lifestyle Program"
        )}
      />
      <ServicesNavigation services={services} />
      <ServiceLifestyleProgramContent program={program} />
    </>
  );
}

export async function generateMetadata() {
  const servicePage =
    await sanityFetch<SERVICE_LIFESTYLE_PROGRAM_BY_SLUG_QUERYResult>({
      query: SERVICE_LIFESTYLE_PROGRAM_BY_SLUG_QUERY,
      params: { slug: "curate-lifestyle-program" },
    });

  if (!servicePage) {
    return null;
  }

  const { seo } = servicePage!;

  const fallbackTitle = "Curate Lifestyle Program";
  const fallbackDescription =
    "Explore our comprehensive healthcare services at Curate Health, offering personalized chiropractic care, rehabilitation, and holistic wellness solutions.";

  return buildPageMetadata(seo, { path: "/services/curate-lifestyle-program" });
}
