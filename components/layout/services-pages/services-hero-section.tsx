import Image from "next/image";

import { SERVICES_PAGE_QUERYResult } from "@/sanity.types";

export default function ServicesHeroSection({
  servicesHeroSection,
}: {
  servicesHeroSection: SERVICES_PAGE_QUERYResult;
}) {
  if (!servicesHeroSection) {
    return null;
  }

  const { heroSection } = servicesHeroSection;

  const { image, alt, title, subtitle } = heroSection;

  return (
    <section className="relative">
      <Image
        width={1920}
        height={1080}
        src={image!}
        alt={alt!}
        quality={100}
        priority
        sizes="100vw"
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
    </section>
  );
}
