import Image from "next/image";

import { SERVICES_HERO_SECTION_QUERYResult } from "@/sanity.types";

export default function ServicesHeroSection({
  servicesHeroSection,
}: {
  servicesHeroSection: SERVICES_HERO_SECTION_QUERYResult;
}) {
  if (!servicesHeroSection) {
    return null;
  }

  const { title, image, subtitle } = servicesHeroSection;

  return (
    <div className="relative">
      <Image
        loading="lazy"
        width={1080}
        height={1440}
        src={image!}
        alt="Our Services"
        className="h-[400px] w-full object-cover opacity-60 md:h-[550px]"
      />
      <div className="absolute inset-0 flex flex-col justify-end pb-16">
        <div className="container">
          <h1 className="text-2xl md:text-4xl 2xl:text-6xl">{title}</h1>
          <div className="mt-8 max-w-[80ch] text-pretty font-light">
            {subtitle}
          </div>
        </div>
      </div>
    </div>
  );
}
