import Image from "next/image";
import { notFound } from "next/navigation";

import { PortableText } from "@portabletext/react";

import { AboutNavigation } from "@/components/layout/about-pages/about-navigation";
import { AlternatingSections } from "@/components/shared/alternating-sections";
import CtaFooterSection from "@/components/shared/cta-footer-section";
import { buildPageMetadata } from "@/lib/page-metadata";
import { SUSTAINABILITY_QUERY_RESULT } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import { SUSTAINABILITY_QUERY } from "@/sanity/lib/queries";

export default async function SustainabilityPage() {
  const sustainability = await sanityFetch<SUSTAINABILITY_QUERY_RESULT>({
    query: SUSTAINABILITY_QUERY,
  });

  if (!sustainability) {
    return notFound();
  }

  const { heroSection, additionalSections, ctaSection } = sustainability;

  return (
    <>
      <Image
        width={1920}
        height={1080}
        priority
        quality={100}
        sizes="100vw"
        src={heroSection?.heroImage?.image || ""}
        alt={heroSection?.heroImage?.alt || ""}
        className="h-[400px] w-full object-cover md:h-[550px]"
      />
      <AboutNavigation />
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
      {/*
        The B Corp section's photograph carries the certification mark, and
        B Lab's brand guidelines require a certified company using the mark to
        direct visitors to bcorp.com. So the mark is a link here as well as in
        the footer, and for the same reason it points at bcorp.com rather than
        at Curate's own directory profile, which the section's body text links
        to instead.

        Matched on _key, not on the title, so renaming the section in the
        Studio does not quietly drop the link.
      */}
      <AlternatingSections
        sections={additionalSections!}
        imageHref={(section) =>
          section._key === "bcorp-certification" ? "https://bcorp.com" : null
        }
      />
      <CtaFooterSection ctaSection={ctaSection!} />
    </>
  );
}

export async function generateMetadata() {
  const sustainability = await sanityFetch<SUSTAINABILITY_QUERY_RESULT>({
    query: SUSTAINABILITY_QUERY,
  });

  const { seo } = sustainability!;

  return buildPageMetadata(seo, { path: "/about/sustainability" });
}
