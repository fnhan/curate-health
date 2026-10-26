import Image from "next/image";
import { notFound } from "next/navigation";

import { PortableText } from "@portabletext/react";

import { AboutNavigation } from "@/components/layout/about-pages/about-navigation";
import { AlternatingSections } from "@/components/shared/alternating-sections";
import CtaFooterSection from "@/components/shared/cta-footer-section";
import { portableTextComponents } from "@/components/shared/portable-text-components";
import { buildPageMetadata } from "@/lib/page-metadata";
import { BCORP_PATH } from "@/lib/structured-data";
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
            <PortableText
              value={heroSection?.heroParagraph!}
              components={portableTextComponents}
            />
          </div>
        </div>
      </div>
      {/*
        The B Corp section's photograph goes to /about/b-corp, since
        2026-10-26. Frank asked for it: the section stays on this page and
        sends a reader to our own page rather than straight out to B Lab.

        THIS DOES NOT BREACH THE BRAND GUIDELINES, AND THE REASON IS NARROW

        B Lab requires a certified company using the mark to direct visitors to
        bcorp.com "by hyperlink OR by a line of text such as 'Learn more at
        bcorp.com'". This section's body copy ends on exactly that sentence,
        with its own link, so the requirement is already met by the text and
        the photograph is free to point somewhere more useful.

        **So do not remove "Learn more at bcorp.com" from the section copy in
        the Studio.** It is the only thing satisfying the guideline here now.
        The footer's mark still links to bcorp.com directly, and so does the
        mark on /about/b-corp, which is where this photograph now leads.

        Matched on _key, not on the title, so renaming the section in the
        Studio does not quietly drop the link.
      */}
      <AlternatingSections
        sections={additionalSections!}
        imageHref={(section) =>
          section._key === "bcorp-certification" ? BCORP_PATH : null
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
