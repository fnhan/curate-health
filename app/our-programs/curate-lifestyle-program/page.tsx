import { notFound } from "next/navigation";

import ServiceHeroSection from "@/components/layout/services-pages/service-hero-section";
import ServiceLifestyleProgramContent from "@/components/layout/services-pages/service-lifestyle-program";
import { ServicesNavigation } from "@/components/layout/services-pages/services-navigation";
import { buildPageMetadata } from "@/lib/page-metadata";
import { JsonLdScript, buildLifestyleJsonLd } from "@/lib/structured-data";
import {
  ALL_SERVICES_QUERY_RESULT,
  SERVICE_LIFESTYLE_PROGRAM_BY_SLUG_QUERY_RESULT,
} from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import {
  ALL_SERVICES_QUERY,
  SERVICE_LIFESTYLE_PROGRAM_BY_SLUG_QUERY,
} from "@/sanity/lib/queries";

export default async function ServiceLifestylePage() {
  const services = await sanityFetch<ALL_SERVICES_QUERY_RESULT>({
    query: ALL_SERVICES_QUERY,
  });

  const program =
    await sanityFetch<SERVICE_LIFESTYLE_PROGRAM_BY_SLUG_QUERY_RESULT>({
      query: SERVICE_LIFESTYLE_PROGRAM_BY_SLUG_QUERY,
      params: { slug: "curate-lifestyle-program" },
    });

  /*
   * The query asks for isActive, so a switched-off program returns nothing and
   * this page is a real 404 rather than a blank frame. notFound() rather than
   * null, per CH-001: returning null renders the layout around an empty page,
   * which tells a crawler the address is alive.
   */
  if (!program) {
    notFound();
  }

  const { heroImage } = program;

  return (
    <>
      <JsonLdScript
        data={buildLifestyleJsonLd({
          title: program.title,
          path: "/our-programs/curate-lifestyle-program",
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
      <ServicesNavigation services={services} />
      <ServiceLifestyleProgramContent program={program} />
    </>
  );
}

export async function generateMetadata() {
  const servicePage =
    await sanityFetch<SERVICE_LIFESTYLE_PROGRAM_BY_SLUG_QUERY_RESULT>({
      query: SERVICE_LIFESTYLE_PROGRAM_BY_SLUG_QUERY,
      params: { slug: "curate-lifestyle-program" },
    });

  // Same gate as the component. CH-001: fixing only the body leaves this
  // throwing, because it destructures what the query did not return.
  if (!servicePage) {
    notFound();
  }

  const { seo } = servicePage!;

  const fallbackTitle = "Curate Lifestyle Program";
  const fallbackDescription =
    "Explore our comprehensive healthcare services at Curate Health, offering personalized chiropractic care, rehabilitation, and holistic wellness solutions.";

  return buildPageMetadata(seo, {
    path: "/our-programs/curate-lifestyle-program",
  });
}
