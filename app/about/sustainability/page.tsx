import Image from "next/image";
import { notFound } from "next/navigation";

import { PortableText } from "@portabletext/react";

import { AlternatingSections } from "@/components/shared/alternating-sections";
import CtaFooterSection from "@/components/shared/cta-footer-section";
import { SUSTAINABILITY_QUERYResult } from "@/sanity.types";
import { SUSTAINABILITY_QUERY } from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/server-client";

export default async function SustainabilityPage() {
  const sustainability = await sanityFetch<SUSTAINABILITY_QUERYResult>({
    query: SUSTAINABILITY_QUERY,
  });

  if (!sustainability) {
    return notFound();
  }

  const { heroSection, additionalSections, ctaSection } = sustainability;

  return (
    <>
      <Image
        width={1440}
        height={1080}
        src={heroSection?.heroImage?.image || ""}
        alt={heroSection?.heroImage?.alt || ""}
        className="h-[400px] w-full object-cover md:h-[550px]"
      />
      <div className="bg-white py-14 md:py-32">
        <div className="container space-y-4 font-light text-primary md:space-y-6">
          <h1 className="text-2xl md:text-4xl 2xl:text-6xl">
            {heroSection?.heroTitle}
          </h1>
          <div className="max-w-[80ch]">
            <PortableText value={heroSection?.heroParagraph!} />
          </div>
        </div>
      </div>
      <AlternatingSections sections={additionalSections!} />
      <CtaFooterSection ctaSection={ctaSection!} />
    </>
  );
}
