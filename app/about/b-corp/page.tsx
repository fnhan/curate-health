import { notFound } from "next/navigation";

import { PortableText } from "@portabletext/react";

import { AboutNavigation } from "@/components/layout/about-pages/about-navigation";
import { BcorpScore } from "@/components/layout/about-pages/bcorp-score";
import { AlternatingSections } from "@/components/shared/alternating-sections";
import CtaFooterSection from "@/components/shared/cta-footer-section";
import HoverLink from "@/components/shared/hover-link";
import { portableTextComponents } from "@/components/shared/portable-text-components";
import { SanityImage } from "@/components/shared/sanity-image";
import { buildPageMetadata } from "@/lib/page-metadata";
import {
  BCORP_PATH,
  JsonLdScript,
  buildBcorpJsonLd,
} from "@/lib/structured-data";
import { BCORP_PAGE_QUERY_RESULT } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import { BCORP_PAGE_QUERY } from "@/sanity/lib/queries";

/**
 * About | Our B Corp Certification. CH-119.
 *
 * BUILT FROM ITS FIVE SIBLINGS, NOT FROM THE SECTION COMPONENTS
 *
 * The rule set on 2026-09-20 says build a new SECTION from SectionHero and
 * SectionNavigation. /about is a section; this is a page inside it, and every
 * other page inside it lays out the same way: the photograph full width, then
 * the About menu, then the heading on white, then alternating sections, then
 * the CTA. Matching the siblings is what keeps the section coherent, and it is
 * also the /cafe shape Frank asked for on the menu page, with the title under
 * the photograph rather than over it.
 *
 * It uses SanityImage where the siblings still use a bare next/image, so a
 * crop or hotspot dragged in the Studio reaches this hero from the first day.
 * The other five are the same hole that was closed on the service and
 * treatment heroes on 2026-10-25, and are worth the same fix in their own
 * change rather than quietly inside this one.
 */
export default async function BcorpPage() {
  const page = await sanityFetch<BCORP_PAGE_QUERY_RESULT>({
    query: BCORP_PAGE_QUERY,
  });

  // Gated on pageActive like every other page under /about. notFound rather
  // than an empty render, per CH-001: a layout wrapped around nothing tells a
  // crawler the address is alive.
  if (!page) {
    return notFound();
  }

  const { heroSection, score, additionalSections, ctaSection } = page;

  return (
    <>
      <JsonLdScript data={buildBcorpJsonLd(page)} id="bcorp-json-ld" />

      <div className="relative h-[400px] w-full md:h-[550px]">
        <SanityImage
          source={heroSection?.heroImage?.imageSource}
          src={heroSection?.heroImage?.image || ""}
          alt={heroSection?.heroImage?.alt || ""}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <AboutNavigation />

      <div className="bg-white py-14 md:py-32">
        <div className="container space-y-4 font-light text-primary md:space-y-6">
          <h1 className="text-2xl md:text-4xl 2xl:text-6xl">
            {heroSection?.heroTitle}
          </h1>
          {/*
            No measure on the hero prose. Frank, 2026-10-26: it runs to the
            container edge like the heading above it, rather than stopping
            short of the right padding.
          */}
          {/*
            `space-y-6` on the prose itself, not on its wrapper. The two hero
            paragraphs are separate blocks inside one PortableText, and
            @portabletext/react renders a bare <p> per block with no margin,
            so they ran together as one wall of text. Frank asked for the
            space on 2026-10-26.
          */}
          <div className="space-y-6">
            <PortableText
              value={heroSection?.heroParagraph!}
              components={portableTextComponents}
            />
          </div>
        </div>
      </div>

      <BcorpScore {...(score ?? {})} />

      {/*
        The directory profile, as the house band rather than a text link, which
        is what Frank asked for on 2026-10-25. It is the one link that lets a
        reader check the score above, so it earns the weight.

        Not bcorp.com: the mark's own photograph below carries that link, which
        is the one B Lab's guidelines require. Two links, two destinations.
      */}
      {score?.directoryUrl ? (
        <HoverLink
          href={score.directoryUrl}
          text="View our full assessment"
          tone="light"
        />
      ) : null}

      {/*
        The B Corp mark is in this section's photograph, and B Lab requires a
        certified company using the mark to direct visitors to bcorp.com. So it
        is a link here, as it is in the footer and on the Sustainability page,
        and it points at bcorp.com rather than at Curate's own directory
        profile, which the score block above links to instead.

        Matched on _key, not on the title, so renaming the section in the
        Studio cannot quietly drop the link.
      */}
      {additionalSections?.length ? (
        <AlternatingSections
          sections={additionalSections}
          imageHref={(section) =>
            section._key === "bcorp-mark" ? "https://bcorp.com" : null
          }
        />
      ) : null}

      {ctaSection ? <CtaFooterSection ctaSection={ctaSection} /> : null}
    </>
  );
}

export async function generateMetadata() {
  const page = await sanityFetch<BCORP_PAGE_QUERY_RESULT>({
    query: BCORP_PAGE_QUERY,
  });

  /*
   * Both the component and this are gated, per CH-001. Fixing only the
   * component leaves generateMetadata throwing on what the query did not
   * return, which is the 500 that ticket was about.
   */
  return buildPageMetadata(page?.seo ?? null, {
    path: BCORP_PATH,
    /*
     * The hero doubles as the share card, so nobody has to remember to pick
     * one, per the every-page rule. The query selects the url rather than the
     * asset id, and buildPageMetadata reads the id back out of the url, so the
     * 1200x630 crop still comes out.
     */
    image: heroImageEntry(page),
  });
}

function heroImageEntry(page: BCORP_PAGE_QUERY_RESULT) {
  const hero = page?.heroSection?.heroImage;
  if (!hero?.image) return undefined;

  return {
    asset: { url: hero.image, alt: hero.alt ?? undefined },
  };
}
