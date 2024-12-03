"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import HoverLink from "components/shared/hover-link";
import { MoveRightIcon } from "lucide-react";
import { SERVICES_SECTION_QUERYResult } from "sanity.types";

export default function ServicesSection({
  servicesSection,
}: {
  servicesSection: SERVICES_SECTION_QUERYResult;
}) {
  if (!servicesSection) return null;

  const { sectionTitle, hoverLinkText, hoverLinkHref, services } =
    servicesSection;

  const [hoveredService, setHoveredService] = useState(services?.[0]);

  return (
    <section>
      <div className="container relative flex flex-col gap-6 py-14 md:grid md:grid-cols-2 md:py-24">
        {/* List of Services */}
        <div className="flex flex-col gap-14 md:gap-28 xl:gap-40">
          <h2 className="text-2xl md:text-3xl xl:text-6xl">{sectionTitle}</h2>
          <div className="flex flex-col gap-2 md:gap-4">
            {services?.map((service) => (
              <Link
                key={service.title}
                href={`/services/${service.slug}`}
                className="flex w-fit items-center gap-2 font-light hover:underline md:text-xl xl:text-3xl"
                onMouseEnter={() => setHoveredService(service as any)}
              >
                <span>{service.title}</span>
                <MoveRightIcon strokeWidth={1.5} size={24} />
              </Link>
            ))}
          </div>
        </div>
        {/* Service Image */}
        <div className="md:h-[400px] md:w-[320px] md:justify-self-end xl:h-[678px] xl:w-[546px]">
          <Image
            width={546}
            height={678}
            className="object-cover md:size-full"
            src={hoveredService?.hero_image!}
            alt={hoveredService?.title!}
          />
        </div>
      </div>
      <HoverLink href={hoverLinkHref!} text={hoverLinkText!} />
    </section>
  );
}
