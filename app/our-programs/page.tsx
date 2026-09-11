import CtaSection from "@/components/layout/our-programs-page/cta-section";
import CurateLifestyle from "@/components/layout/our-programs-page/curate-lifestyle";
import EssentialSeries from "@/components/layout/our-programs-page/essential-series";
import ExploreYourOptions from "@/components/layout/our-programs-page/explore-your-options";
import FaqSection from "@/components/layout/our-programs-page/faq-section";
import IntroSection from "@/components/layout/our-programs-page/intro-section";
import MasterHealthBlueprint from "@/components/layout/our-programs-page/master-health-blueprint";
import { OurProgramsNavigation } from "@/components/layout/our-programs-page/our-programs-navigation";
import ThreePaths from "@/components/layout/our-programs-page/three-paths";
import ServiceHeroSection from "@/components/layout/services-pages/service-hero-section";
import HoverLink from "@/components/shared/hover-link";
import { buildPageMetadata } from "@/lib/page-metadata";
import { OUR_PROGRAMS_QUERYResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import { OUR_PROGRAMS_QUERY } from "@/sanity/lib/queries";

export default async function OurProgramsPage() {
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
      <OurProgramsNavigation />
      <IntroSection program={program} />
      <EssentialSeries program={program} />
      <CurateLifestyle program={program} />
      <MasterHealthBlueprint program={program} />
      <ThreePaths program={program} />
      <ExploreYourOptions program={program} />
      <FaqSection program={program} />
      <CtaSection program={program} />
      {/* The mirror of Explore Our Programs at the foot of /services. Programs
          and services are separate now, so each hub offers the way across.

          Wrapped in bg-primary for the same reason as the other one: HoverLink
          draws white text and needs a dark section under it. */}
      <div className="bg-primary">
        <HoverLink href="/services" text="Explore Our Services" />
      </div>
    </>
  );
}

/**
 * Reads the page's own seo object from Sanity, like every other page.
 *
 * It used to pass null here with the title and description written into the
 * code, because the ourPrograms document had no seo object at the time. It has
 * one now, holding a title, a description, share copy and a share photo Frank
 * approved on 2026-09-10, and none of it was reaching the page: the share card
 * had no image at all. That was only caught by fetching the live page, because
 * every check up to then had read what was stored rather than what rendered.
 *
 * The values that used to be hard-coded stay as fallbacks, so an empty field
 * in the Studio still produces a sensible title rather than the site default.
 */
export async function generateMetadata() {
  const program = await sanityFetch<OUR_PROGRAMS_QUERYResult>({
    query: OUR_PROGRAMS_QUERY,
  });

  return buildPageMetadata(program?.seo ?? null, {
    title: "Health Programs Toronto",
    description:
      "Three structured health programs at Curate Health in Midtown Toronto, from self-directed access to physician-led care.",
  });
}
