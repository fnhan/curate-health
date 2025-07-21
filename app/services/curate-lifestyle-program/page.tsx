import ServiceHeroSection from "@/components/layout/services-pages/service-hero-section";
import ServiceLifestyleProgramContent from "@/components/layout/services-pages/service-lifestyle-program";
import { ServicesNavigation } from "@/components/layout/services-pages/services-navigation";
import {
  ALL_SERVICES_QUERYResult,
  SERVICE_LIFESTYLE_PROGRAM_BY_SLUG_QUERYResult
} from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import {
  ALL_SERVICES_QUERY,
  SERVICE_LIFESTYLE_PROGRAM_BY_SLUG_QUERY
} from "@/sanity/lib/queries";

export default async function ServiceLifestylePage() {
  const services = await sanityFetch<ALL_SERVICES_QUERYResult>({
    query: ALL_SERVICES_QUERY,
  });

  const program = await sanityFetch<SERVICE_LIFESTYLE_PROGRAM_BY_SLUG_QUERYResult>({
    query: SERVICE_LIFESTYLE_PROGRAM_BY_SLUG_QUERY,
    params: { slug: "curate-lifestyle-program" },
  });

  if (!program) {
    return null;
  }

  const { heroImage } = program;

  return (
    <>
      <ServiceHeroSection
        hero_image={{ asset: { url: heroImage?.asset?.url! }, alt: heroImage?.heroAlt! }}
      />
      <ServicesNavigation services={services} />
      <ServiceLifestyleProgramContent program={program} />
    </>
  );
}

export async function generateMetadata() {
  const servicePage = await sanityFetch<SERVICE_LIFESTYLE_PROGRAM_BY_SLUG_QUERYResult>({
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
