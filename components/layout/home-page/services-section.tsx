"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import HoverLink from "components/shared/hover-link";
import { AnimatePresence, motion } from "framer-motion";
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
    <section className="relative">
      <div className="container py-14 md:py-24">
        <div className="grid gap-12 md:grid-cols-2">
          {/* List of Services */}
          <div className="flex flex-col">
            <h2 className="mb-14 text-2xl md:mb-28 md:text-3xl xl:mb-40 xl:text-6xl">
              {sectionTitle}
            </h2>
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
                    <Image
                      fill
                      className="object-cover"
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
