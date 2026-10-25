"use client";

import { SanityImage } from "@/components/shared/sanity-image";
import Link from "next/link";
import { useState } from "react";

import HoverLink from "components/shared/hover-link";
import { AnimatePresence, motion } from "framer-motion";
import { MoveRightIcon } from "lucide-react";
import { SERVICES_SECTION_QUERY_RESULT } from "sanity.types";

import { GROUP_HOVER_UNDERLINE } from "@/lib/hover-underline";

export default function ServicesSection({
  servicesSection,
}: {
  servicesSection: SERVICES_SECTION_QUERY_RESULT;
}) {
  if (!servicesSection) return null;

  const { sectionTitle, hoverLinkText, hoverLinkHref, services } =
    servicesSection;

  const [hoveredService, setHoveredService] = useState(services?.[0]);

  return (
    <section className="relative">
      <div className="container py-14 md:py-24">
        <div className="grid gap-12 md:grid-cols-2">
          {/* List of Services.
            Centred in the row and mb-10 under the heading, both taken from
            Our Programs. Frank, 2026-10-18: the heading sat high against a
            photograph taller than the list, and mb-28 at md and mb-40 at xl
            left a gap the eye read as a break rather than a cushion.
          */}
          <div className="flex flex-col justify-center">
            <h2 className="mb-10 text-2xl md:text-3xl xl:text-6xl">
              {sectionTitle}
            </h2>
            {/*
              The same row as Our Programs, at Frank's request on 2026-10-18:
              the two sections do the same job and should read as a pair. So
              the coloured bar, the gap between rows and the distance from the
              name to the arrow all match that component.

              The sweep is on the name rather than on the link, so the line
              runs under the words and not under the bar and the arrow as
              well. Programs does the same, which is how both can carry it.
            */}
            <div className="flex flex-col gap-4 md:gap-6">
              {services?.map((service) => (
                <Link
                  key={service.title}
                  href={`/services/${service.slug}`}
                  className="group flex w-fit items-center gap-4 font-light transition-opacity hover:opacity-70 md:gap-6 md:text-xl xl:text-3xl"
                  onMouseEnter={() => setHoveredService(service as any)}
                >
                  {service.barColor ? (
                    <span
                      className="h-14 w-[15px] shrink-0 rounded-sm"
                      style={{ backgroundColor: service.barColor }}
                      aria-hidden
                    />
                  ) : null}
                  <span className={GROUP_HOVER_UNDERLINE}>{service.title}</span>
                  <MoveRightIcon strokeWidth={1.5} size={24} />
                </Link>
              ))}
            </div>
          </div>
          {/* Service Image */}
          <div className="flex justify-end">
            <div className="relative w-full md:w-[320px] xl:w-[546px]">
              <div className="aspect-square w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={hoveredService?.hero_image}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                  >
                    {/*
                      SanityImage, so a crop or hotspot set in the Studio is
                      honoured here too. HOME_PAGE_QUERY has carried
                      hero_imageSource for weeks and this call site was still
                      reading the flattened url, so framing a service hero
                      changed the service page and not this preview of it.
                    */}
                    <SanityImage
                      fill
                      className="object-cover"
                      source={hoveredService?.hero_imageSource}
                      src={hoveredService?.hero_image!}
                      alt={hoveredService?.title!}
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 320px, 546px"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
      <HoverLink href={hoverLinkHref!} text={hoverLinkText!} />
    </section>
  );
}
