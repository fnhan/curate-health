import CtaSection from "@/components/layout/our-programs-page/cta-section";
import CurateLifestyle from "@/components/layout/our-programs-page/curate-lifestyle";
import EssentialSeries from "@/components/layout/our-programs-page/essential-series";
import ExploreYourOptions from "@/components/layout/our-programs-page/explore-your-options";
import FaqSection from "@/components/layout/our-programs-page/faq-section";
import IntroSection from "@/components/layout/our-programs-page/intro-section";
import MasterHealthBlueprint from "@/components/layout/our-programs-page/master-health-blueprint";
import ThreePaths from "@/components/layout/our-programs-page/three-paths";
import ServiceHeroSection from "@/components/layout/services-pages/service-hero-section";
import { ServicesNavigation } from "@/components/layout/services-pages/services-navigation";
import {
  ALL_SERVICES_QUERYResult,
  OUR_PROGRAMS_QUERYResult,
} from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import { ALL_SERVICES_QUERY, OUR_PROGRAMS_QUERY } from "@/sanity/lib/queries";

export default async function ServiceLifestylePage() {
  const services = await sanityFetch<ALL_SERVICES_QUERYResult>({
    query: ALL_SERVICES_QUERY,
  });

  const program = await sanityFetch<OUR_PROGRAMS_QUERYResult>({
    query: OUR_PROGRAMS_QUERY,
  });

  if (!program) {
    return null;
  }

  const { heroImage } = program;

  return (
    <>
      <ServiceHeroSection
        hero_image={{
          asset: { url: heroImage?.asset?.url! },
          alt: heroImage?.heroAlt!,
        }}
      />
      <ServicesNavigation services={services} />
      <IntroSection program={program} />
      <EssentialSeries program={program} />
      <CurateLifestyle program={program} />
      <MasterHealthBlueprint program={program} />
      <ThreePaths program={program} />
      <ExploreYourOptions program={program} />
      <FaqSection program={program} />
      <CtaSection program={program} />
    </>
  );
}
