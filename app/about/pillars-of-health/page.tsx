import Image from "next/image";

import Pillars from "@/components/layout/about-pages/pillars";
import { PILLARS_OF_HEALTH_QUERYResult } from "@/sanity.types";
import { PILLARS_OF_HEALTH_QUERY } from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/server-client";

export default async function PillarsofHealth() {
  const pillarsOfHealth = await sanityFetch<PILLARS_OF_HEALTH_QUERYResult>({
    query: PILLARS_OF_HEALTH_QUERY,
  });

  if (!pillarsOfHealth) {
    return null;
  }

  const { heroSection } = pillarsOfHealth;

  return (
    <>
      <Image
        width={1440}
        height={1080}
        src={heroSection?.heroImage?.image || ""}
        alt={heroSection?.heroImage?.alt || ""}
        className="h-[400px] w-full object-cover md:h-[550px]"
      />
      <section className="container flex flex-col gap-8 py-14 md:gap-20 md:py-20">
        <div className="space-y-4 font-light md:text-center">
          <h1 className="text-2xl md:text-4xl">{heroSection?.heroTitle}</h1>
          <p className="max-w-[80ch] text-pretty italic md:mx-auto md:text-balance md:text-2xl">
            {heroSection?.heroParagraph}
          </p>
        </div>
        <Pillars pillarsOfHealth={pillarsOfHealth} />
      </section>
    </>
  );
}
