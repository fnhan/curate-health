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
 * Same gap as /blog: no metadata of its own, so it inherited the homepage's
 * title and description. See CH-006.
 *
 * The ourPrograms document has no seo object either, which is why
 * scripts/audit-seo-fields.js missed it at first: that audit only looked at
 * documents that already had one, so a document missing it entirely was
 * invisible. Frank caught that.
 */
export async function generateMetadata() {
  return buildPageMetadata(null, {
    title: "Health Programs Toronto",
    description:
      "Three structured health programs at Curate Health in Midtown Toronto, from self-directed access to physician-led care.",
  });
}
