import Link from "next/link";
import { notFound } from "next/navigation";

import SectionHero from "@/components/shared/section-hero";
import SectionIntro, { toParagraphs } from "@/components/shared/section-intro";
import { buildPageMetadata } from "@/lib/page-metadata";
import {
  CAFE_MENU_PATH,
  JsonLdScript,
  buildCafeMenuJsonLd,
  menuPrice,
} from "@/lib/structured-data";
import { CAFE_MENU_QUERYResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import { CAFE_MENU_QUERY } from "@/sanity/lib/queries";

/**
 * The cafe menu as a page. CH-108.
 *
 * It was a PDF behind a download button, which is the worst place to keep the
 * one thing people search a cafe for. A PDF ranks poorly, cannot be excerpted
 * cleanly by an answer engine, and is a download rather than a page on a phone.
 * Everything that makes this cafe different, the functional nutrition
 * positioning, no industrial seed oils, Ontario-local and seasonal sourcing,
 * was inside that file and so was invisible to search.
 *
 * Every item is plain text in the HTML, deliberately. No accordions and nothing
 * fetched in the browser: a crawler reads what a reader reads. The PDF is still
 * linked for anybody who wants to print it.
 *
 * INGREDIENTS ARE THE POINT, NOT DECORATION
 *
 * Each item carries its ingredient line. That is the passage an answer engine
 * quotes when somebody asks whether a place has anything without dairy, and it
 * is what somebody with a nut allergy came to read. It is also why the Studio
 * field says so: the PDF under-declared a tree nut on one bar.
 */

const FALLBACK = {
  title: "Cafe Menu",
  description:
    "The full menu at Curate Cafe in Midtown Toronto: matcha, pour-over coffee, kombucha on tap, smoothies, salads and house-made bars, with ingredients listed.",
};

export default async function CafeMenuPage() {
  const menu = await sanityFetch<CAFE_MENU_QUERYResult>({
    query: CAFE_MENU_QUERY,
  });

  const sections = (menu?.sections ?? []).filter(
    (section) => (section.items ?? []).length > 0
  );

  /*
   * A menu document with nothing on it is not a page. It 404s rather than
   * rendering an empty one, which is also what SITEMAP_QUERY gates its entry
   * on, so the sitemap and the route always agree.
   */
  if (!menu || sections.length === 0) {
    return notFound();
  }

  const heading = menu.title?.trim() || FALLBACK.title;
  const paragraphs = toParagraphs(menu.intro);

  // The menu's own photograph if one is set, otherwise the cafe page's, so the
  // page always opens on one. Per the every-page rule.
  const hero = menu.heroImage?.url ? menu.heroImage : menu.cafeHeroImage;

  return (
    <div className="font-poppins">
      <JsonLdScript data={buildCafeMenuJsonLd(menu)} id="cafe-menu-json-ld" />

      {hero?.url ? (
        <SectionHero
          image={hero.url}
          alt={hero.alt ?? ""}
          title={heading}
          subtitle={paragraphs[0]}
        />
      ) : (
        <section className="bg-white pt-32 md:pt-40">
          <div className="container flex flex-col gap-6">
            <h1 className="text-3xl font-light text-primary md:text-5xl">
              {heading}
            </h1>
            {paragraphs[0] ? (
              <p className="max-w-[70ch] font-light leading-7 text-primary">
                {paragraphs[0]}
              </p>
            ) : null}
          </div>
        </section>
      )}

      <SectionIntro className="font-poppins" paragraphs={paragraphs.slice(1)} />

      <section className="bg-white pb-28 text-primary md:pb-36">
        {/*
          One measure for the heading rules, the item names and the price
          column, so a section's rule ends exactly where its prices do. At
          full width the rule ran to the edge of the page while the items
          stopped two thirds of the way across, which reads as unfinished.

          mr-auto, not mx-auto: `container` is configured center: true, so a
          capped box inside it floats in the middle of the viewport rather
          than lining up with everything else on the page. Same fix as
          section-intro.tsx.
        */}
        <div className="container">
          {menu.note?.trim() ? (
            <p className="mb-16 mr-auto max-w-[70ch] font-light italic text-muted-foreground md:mb-20">
              {menu.note.trim()}
            </p>
          ) : null}

          {/*
            TWO COLUMNS FROM THE EXTRA LARGE BREAKPOINT, AT FRANK'S REQUEST
            2026-10-18, SO A WIDE WINDOW SCROLLS LESS.

            Multi-column rather than a grid, because a grid lays sections out
            in rows and every row is as tall as its tallest section, which on
            ten sections of wildly different lengths leaves holes. Columns flow
            down the first and then the second, which is how a menu is read.

            `break-inside-avoid` on each section is what makes this safe here
            and is the whole difference from the prose band, which Frank
            rejected twice. There, balancing the columns meant cutting a
            sentence across the gutter. A menu section is a discrete block, so
            it moves whole or not at all and nothing is ever split mid-thought.
            Ten of them also balance far better than three paragraphs did.

            Below xl it is one column at 70ch, as before.
          */}
          <div className="mr-auto max-w-[70ch] xl:max-w-none xl:columns-2 xl:gap-20">
            {sections.map((section) => (
              <section
                key={section._key}
                className="mb-16 flex break-inside-avoid flex-col gap-8 md:mb-20"
              >
                <div className="flex flex-col gap-2 border-b border-primary/15 pb-4">
                  <h2 className="text-2xl font-light tracking-tight md:text-3xl">
                    {section.title}
                  </h2>
                  {section.note?.trim() ? (
                    <p className="font-light text-muted-foreground">
                      {section.note.trim()}
                    </p>
                  ) : null}
                </div>

                <ul className="flex flex-col gap-8">
                  {(section.items ?? []).map((item) => (
                    <li key={item._key} className="flex flex-col gap-1">
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="font-light">
                          {item.name}
                          {item.size?.trim() ? (
                            <span className="ml-2 text-sm text-muted-foreground">
                              {item.size.trim()}
                            </span>
                          ) : null}
                        </h3>
                        {typeof item.price === "number" ? (
                          /*
                           * The price is text in the HTML, not an image or a
                           * background, so it is readable and quotable.
                           * menuPrice is shared with the Offer in the markup,
                           * so the two cannot print the number differently.
                           */
                          <p className="shrink-0 font-light tabular-nums">
                            ${menuPrice(item.price)}
                          </p>
                        ) : null}
                      </div>
                      {item.ingredients?.trim() ? (
                        /*
                         * Three quarters of the measure, at Frank's request on
                         * 2026-10-18. At full width a long ingredient line ran
                         * under the price column and the two read as one
                         * paragraph. Stopping short leaves the prices with a
                         * clear edge to sit against.
                         *
                         * From sm up only. A phone is 375px wide and the price
                         * is a short string at the end of the line above, so
                         * there is no column to clear, and three quarters of
                         * 311px took the immunity latte to five lines.
                         */
                        <p className="text-sm font-light leading-6 text-muted-foreground sm:max-w-[75%]">
                          {item.ingredients.trim()}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          {/* Outside the columns, so it stays one line under both of them. */}
          <p className="font-light">
            <Link
              className="underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
              href="/cafe"
            >
              Back to Curate Cafe
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export async function generateMetadata() {
  const menu = await sanityFetch<CAFE_MENU_QUERYResult>({
    query: CAFE_MENU_QUERY,
  });

  const hero = menu?.heroImage?.url ? menu.heroImage : menu?.cafeHeroImage;

  return buildPageMetadata(menu?.seo ?? null, {
    path: CAFE_MENU_PATH,
    title: FALLBACK.title,
    description: FALLBACK.description,
    // The cafe's share card ends with its own name rather than the site's, per
    // Frank on 2026-09-10. Its menu is the cafe's page too, so it matches.
    shareBrand: "Curate Cafe",
    /*
     * The hero doubles as the share card, so this page never shows a bare one
     * and nobody has to remember to choose a picture. The query selects the url
     * rather than the asset id; buildPageMetadata reads the id back out of the
     * url, so the 1200x630 crop still comes out.
     */
    image: hero?.url
      ? { asset: { url: hero.url }, alt: hero.alt ?? undefined }
      : undefined,
  });
}
