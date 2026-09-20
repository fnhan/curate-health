import SectionHero from "@/components/shared/section-hero";
import { SERVICES_PAGE_QUERYResult } from "@/sanity.types";

/**
 * The /services hero. The layout lives in components/shared/section-hero.tsx,
 * which /products uses too.
 */
export default function ServicesHeroSection({
  servicesHeroSection,
}: {
  servicesHeroSection: SERVICES_PAGE_QUERYResult;
}) {
  if (!servicesHeroSection?.heroSection?.image) {
    return null;
  }

  const { image, alt, title, subtitle } = servicesHeroSection.heroSection;

  return (
    <SectionHero
      image={image}
      alt={alt ?? ""}
      title={title ?? "Our Services"}
      subtitle={subtitle}
    />
  );
}
