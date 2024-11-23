"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import imageUrlBuilder from "@sanity/image-url";
import HoverLink from "components/shared/hover-link";
import { ArrowRight } from "lucide-react";
import { SERVICES_SECTION_QUERYResult } from "sanity.types";

import { dataset, projectId } from "../../../sanity/env";

const builder = imageUrlBuilder({ projectId, dataset });

export default function ServicesSection({
  servicesSection,
}: {
  servicesSection: SERVICES_SECTION_QUERYResult;
}) {
  if (!servicesSection) return null;

  const { sectionTitle, hoverLinkText, hoverLinkHref, services } =
    servicesSection;

  const [hoveredService, setHoveredService] = useState(null);

  return (
    <>
      <div className="flex h-[400px] flex-col justify-start gap-10 pb-12 pt-8 md:h-[680px] md:gap-20 md:py-20 2xl:h-[720px]">
        <div className="md:flex">
          {/* Left Side: Text */}
          <div className="container flex flex-col md:w-1/2">
            <h2 className="mb-8 mt-8 text-3xl 2xl:container md:mb-24 md:mt-16 md:text-5xl">
              {sectionTitle}
            </h2>
            {services?.map((service) => (
              <div
                key={service.title}
                className="cursor-pointer py-3"
                onMouseEnter={() => setHoveredService(service as any)}
                onMouseLeave={() => setHoveredService(null)}
              >
                <Link href={`/services/${service.slug}`}>
                  <div className="group">
                    <div className="flex items-center space-x-2 text-[14px] font-light 2xl:container md:text-[20px] 2xl:text-[30px]">
                      <span className="group-hover:underline">
                        {service.title}
                      </span>
                      <ArrowRight className="group-hover:underline" />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Right Side: Image */}
          <div className="flex items-center justify-end md:mt-16 md:w-1/2">
            {hoveredService && (
              <Image
                loading="lazy"
                width={1440}
                height={2560}
                src={builder
                  // @ts-ignore
                  .image(hoveredService.image)
                  .width(1080)
                  .height(1440)
                  .quality(100)
                  .url()}
                // @ts-ignore
                alt={hoveredService.title}
                className="h-[0px] w-[0px] object-cover transition duration-300 md:h-[420px] md:w-full 2xl:h-[470px]"
              />
            )}
          </div>
        </div>
      </div>
      <HoverLink href={hoverLinkHref!} text={hoverLinkText!} />
    </>
  );
}
