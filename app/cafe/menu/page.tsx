import Link from "next/link";
import { notFound } from "next/navigation";

import { SanityImage } from "@/components/shared/sanity-image";
import { toParagraphs } from "@/components/shared/section-intro";
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

type MenuSection = NonNullable<
  NonNullable<CAFE_MENU_QUERYResult>["sections"]
>[number];

/** One section of the menu: its heading, its standing note, and its items. */
function MenuSectionBlock({ section }: { section: MenuSection }) {
  return (
    <section className="flex flex-col gap-8">
      {/*
        The heading row: the section's name on the left, its note on the
        right, where it lines up with the price column below.

        Frank, 2026-10-18, on "$13 for 3": it "should be on the right (right
        aligned), where all the prices are lined up already". Italic as well,
        so an add-on or a bundle price does not read as something you order on
        its own: "add on should be in italics and not look like an actual
        item".

        It wraps below the heading on a phone and goes back to the left there,
        because at 375px a right-aligned sentence on its own line reads as a
        mistake rather than as a price.
      */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-primary/15 pb-4">
        {/*
          shrink-0 so the note on the right gives way first and a section name
          keeps its own line. Frank, 2026-10-18: "make all section headers one
          line, unless adaptive settings need to split it to 2 for any
          reason". Not whitespace-nowrap, which would overflow the column
          rather than wrap, and the wrap is the behaviour he is allowing for.

          Measured at 1680, 1280 and 375: every heading is one line today, the
          widest being "Kombucha on Tap" at 211px in a 311px phone container.
        */}
        <h2 className="shrink-0 text-2xl font-light tracking-tight md:text-3xl">
          {section.title}
        </h2>
        {section.note?.trim() ? (
          <p className="font-light italic text-muted-foreground sm:text-right">
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
                 * The price is text in the HTML, not an image or a background,
                 * so it is readable and quotable. menuPrice is shared with the
                 * Offer in the markup, so the two cannot print the number
                 * differently.
                 */
                <p className="shrink-0 font-light tabular-nums">
                  ${menuPrice(item.price)}
                </p>
              ) : null}
            </div>
            {item.ingredients?.trim() ? (
              /*
               * Three quarters of the measure, at Frank's request on
               * 2026-10-18. At full width a long ingredient line ran under the
               * price column and the two read as one paragraph. Stopping short
               * leaves the prices with a clear edge to sit against.
               *
               * From sm up only. A phone is 375px wide and the price is a
               * short string at the end of the line above, so there is no
               * column to clear, and three quarters of 311px took the immunity
               * latte to five lines.
               */
              <p className="text-sm font-light leading-6 text-muted-foreground sm:max-w-[75%]">
                {item.ingredients.trim()}
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      {section.footnote?.trim() ? (
        /*
         * Under the items, not over them. A note sits in the heading row
         * beside the prices, which suits the bars' bundle price; an add-on is
         * a footnote and belongs at the foot. Frank, 2026-10-18: it "should
         * be at the bottom of smoothie section".
         */
        <p className="font-light italic text-muted-foreground">
          {section.footnote.trim()}
        </p>
      ) : null}
    </section>
  );
}

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

      {/*
        THE PHOTOGRAPH CARRIES NO TEXT, AND THE TITLE SITS UNDER IT.

        Frank, 2026-10-18: bring the title "below the hero image for more
        visibility and to make it congruent with all the other sibling pages".
        This page's sibling is /cafe, which does exactly this: a full bleed
        photograph and then the heading on white underneath.

        It used SectionHero before, which lays the h1 over the picture. That is
        the right pattern for /services, /products and /about, where the second
        menu sits directly under the band. The cafe does not use that pattern
        and this page belongs to the cafe.
      */}
      {hero?.url ? (
        <SanityImage
          source={hero.source}
          src={hero.url}
          alt={hero.alt ?? ""}
          width={1920}
          height={1080}
          priority
          quality={100}
          sizes="100vw"
          className="h-[400px] w-full object-cover md:h-[550px]"
        />
      ) : null}

      {/*
        The heading and the opening prose, across the full container rather
        than capped at the left column. Frank again: "have it extend all the
        way across in width and not just align to the left column." So no
        measure cap here, unlike the item lists below, which need one to keep
        the price column readable.
      */}
      <section className="bg-white pt-14 text-primary md:pt-20">
        <div className="container flex flex-col gap-6">
          <h1 className="text-3xl font-light tracking-tight md:text-5xl">
            {heading}
          </h1>
          {paragraphs.map((text) => (
            <p key={text} className="font-light leading-7">
              {text}
            </p>
          ))}
          {menu.note?.trim() ? (
            /*
            The two standing offers, under the prose rather than over it.

            This block carried a negative margin for a round, from when it
            sat in its own section below the intro band and had to be pulled
            up against it. Once the intro moved into this section the margin
            had nothing to pull against and dragged the italic lines on top
            of the paragraph above, which is what Frank's screenshot shows.

            Each line is its own paragraph, as he wrote them: they are two
            separate offers rather than one sentence.
          */
            <div className="flex flex-col gap-1 pt-2">
              {menu.note
                .trim()
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line) => (
                  <p
                    key={line}
                    className="font-light italic text-muted-foreground"
                  >
                    {line}
                  </p>
                ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-white pb-28 text-primary md:pb-36">
        <div className="container">
          {/*
            TWO COLUMNS FROM THE EXTRA LARGE BREAKPOINT, FLOWING IN ROWS.

            Frank asked for two things that looked like a contradiction and are
            not. On 2026-10-18: "preserve all drinks first then food, like how
            the original pdf had it", and then "both columns should have as
            close to 50/50 as possible. If exact 50/50 is not achievable, make
            left be the larger of the two".

            **Rows give both, exactly.** A row-flow grid reads left to right and
            then down, which is the menu's own order, so the six drink sections
            still come before the four food ones. And because the two columns
            hold the same number of rows and a row is as tall as its taller
            cell, the columns are the same height by construction. Not close to
            50/50: identical.

            WHAT THE TWO EARLIER VERSIONS GOT WRONG

            Both dealt the sections into two column-shaped lists and read down
            one and then the other, which is where the trouble was.

            A single cut point kept the order and could not balance: with ten
            chunky sections there were only ten arrangements to choose from, and
            the best left the right column 570px short, which is the gap in the
            screenshot he sent.

            Choosing a column per section balanced to 16px and scattered the
            menu, putting Energy Bars among the drinks and Kombucha among the
            food. Near-perfect balance is exactly what produced the scatter.

            Rows cost some whitespace under the shorter section in each pair,
            about 310px spread over four rows. The column version concentrated
            570px of it in one place at the bottom, and ran 500px taller
            overall, so this is less waste as well as less scrolling.

            Below xl it is one column, which is the same list in the same order.
          */}
          <div className="mr-auto grid max-w-[70ch] grid-cols-1 items-start gap-x-20 gap-y-16 md:gap-y-20 xl:max-w-none xl:grid-cols-2">
            {sections.map((section) => (
              <MenuSectionBlock key={section._key} section={section} />
            ))}
          </div>

          {/*
            Outside the columns, so it stays one line under both of them, with
            the same air above it that the sections have between them. It sat
            tight against the last section for a round, because the sections
            lost their own bottom margin when the grid took over the spacing.
          */}
          <p className="pt-16 font-light md:pt-20">
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
