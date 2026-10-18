import { SectionNavigation } from "@/components/shared/section-navigation";
import { ALL_SERVICES_QUERYResult } from "@/sanity.types";

/**
 * The services second menu. The look and the behaviour live in
 * components/shared/section-navigation.tsx, which every section uses.
 *
 * Curate Lifestyle is left out on purpose: it is a programme, not a service,
 * and it moved to /our-programs/curate-lifestyle on 2026-09-19.
 */
export function ServicesNavigation({
  services,
}: {
  services: ALL_SERVICES_QUERYResult;
}) {
  return (
    <SectionNavigation
      ariaLabel="Services"
      label="Our Services"
      labelHref="/services"
      items={services
        .filter(
          (service) => service.slug && service.slug !== "curate-lifestyle"
        )
        .map((service) => ({
          title: service.title ?? "",
          href: `/services/${service.slug}`,
        }))}
    />
  );
}
