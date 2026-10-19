import SectionHero from "@/components/shared/section-hero";
import { toParagraphs } from "@/components/shared/section-intro";
import { SERVICES_PAGE_QUERY_RESULT } from "@/sanity.types";

/**
 * The /services hero. The layout lives in components/shared/section-hero.tsx,
 * which /products uses too.
 */
export default function ServicesHeroSection({
  servicesHeroSection,
}: {
  servicesHeroSection: SERVICES_PAGE_QUERY_RESULT;
}) {
  if (!servicesHeroSection?.heroSection?.image) {
    return null;
  }

  const { image, alt, title, subtitle } = servicesHeroSection.heroSection;

  /**
   * The standing line is the first paragraph of the intro, the way /about
   * takes its own. One field then holds the whole of the page's prose and the
   * two sections read the same.
   *
   * `subtitle` is the fallback rather than dead weight: it is what this page
   * showed before the intro existed, so the hero keeps a line if the intro is
   * ever emptied in the Studio.
   */
  const lead = toParagraphs(servicesHeroSection.intro)[0] ?? subtitle;

  return (
    <SectionHero
      image={image}
      alt={alt ?? ""}
      title={title ?? "Our Services"}
      subtitle={lead}
    />
  );
}
