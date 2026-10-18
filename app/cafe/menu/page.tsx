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

type MenuSection = NonNullable<
  NonNullable<CAFE_MENU_QUERYResult>["sections"]
>[number];

/**
 * Deal the sections into two columns, with the longer one on the left.
 *
 * Frank asked on 2026-10-18 for the left column to be the longer one whenever
 * the two cannot be even. CSS `columns-2` decides that for itself and had put
 * Smoothies, the tallest section, on the right, so the right ran 512px past
 * the left. There is no CSS property that says "lean left", so the split is
 * made here and the columns are real elements.
 *
 * The rule: walk the sections in order, filling the left until it holds at
 * least half the total height, then everything after goes right. Because the
 * running total only grows, the first split that passes half is both the one
 * that leans left and the closest to even of the splits that do.
 *
 * Reading order is unchanged, down the left and then down the right.
 */
function splitIntoColumns(sections: MenuSection[]) {
  /*
   * Rough rendered heights in pixels, read off the page at 1680 rather than
   * guessed. They only have to rank the sections against each other, so a
   * section being out by a few pixels cannot move the split; a section being
   * out by half its height could.
   */
  const HEADING = 110;
  const NOTE = 28;
  const ITEM = 60;
  const INGREDIENT_LINE = 24;
  const CHARS_PER_LINE = 60;
  const BETWEEN_SECTIONS = 80;

  const height = (section: MenuSection) =>
    HEADING +
    (section.note?.trim() ? NOTE : 0) +
    BETWEEN_SECTIONS +
    (section.items ?? []).reduce((total, item) => {
      const text = item.ingredients?.trim() ?? "";
      const lines = text ? Math.ceil(text.length / CHARS_PER_LINE) : 0;
      return total + ITEM + lines * INGREDIENT_LINE;
    }, 0);

  const heights = sections.map(height);
  const half = heights.reduce((a, b) => a + b, 0) / 2;

  let running = 0;
  let split = sections.length;
  for (let i = 0; i < sections.length; i += 1) {
    running += heights[i];
    if (running >= half) {
      split = i + 1;
      break;
    }
  }

  return [sections.slice(0, split), sections.slice(split)] as const;
}

/** One section of the menu: its heading, its standing note, and its items. */
function MenuSectionBlock({ section }: { section: MenuSection }) {
  return (
    <section className="mb-16 flex flex-col gap-8 md:mb-20">
      <div className="flex flex-col gap-2 border-b border-primary/15 pb-4">
        <h2 className="text-2xl font-light tracking-tight md:text-3xl">
          {section.title}
        </h2>
        {section.note?.trim() ? (
          /*
           * Italic, like the standing note at the top of the page, so an
           * add-on or a bundle price does not read as something you order on
           * its own. Frank, 2026-10-18: "add on should be in italics and not
           * look like an actual item".
           */
          <p className="font-light italic text-muted-foreground">
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
  const [left, right] = splitIntoColumns(sections);

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
        <div className="container">
          {menu.note?.trim() ? (
            /*
              Pulled up against the intro band above it, at Frank's request on
              2026-10-18. SectionIntro ends on py-24, so the note sat 96px
              clear of the paragraph it belongs with and read as its own
              section. The negative margin takes that to about 40px.

              Each line is its own paragraph, as he wrote them: they are two
              separate offers rather than one sentence.
            */
            <div className="-mt-10 mb-16 mr-auto flex max-w-[70ch] flex-col gap-1 md:-mt-14 md:mb-20">
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

          {/*
            TWO COLUMNS FROM THE EXTRA LARGE BREAKPOINT, AT FRANK'S REQUEST
            2026-10-18, SO A WIDE WINDOW SCROLLS LESS.

            Two real columns rather than CSS `columns-2`, because he also asked
            for the longer column to be the left one and CSS decides that for
            itself. It had put Smoothies, the tallest section, on the right,
            which left the right running 512px past the left. splitIntoColumns
            makes that decision instead; see its note.

            A grid of two cells, not a grid of ten: ten cells would lay the
            sections out in rows and make every row as tall as its tallest
            section, which leaves holes. Each cell is a column the sections
            stack down, so reading order is down the left and then down the
            right, the same as before.

            Below xl the grid is off, so the two stack and the sections read in
            their original order at 70ch, which is the single column this
            started as.
          */}
          <div className="mr-auto max-w-[70ch] xl:grid xl:max-w-none xl:grid-cols-2 xl:gap-x-20">
            {[left, right].map((column, index) => (
              <div key={index === 0 ? "left" : "right"}>
                {column.map((section) => (
                  <MenuSectionBlock key={section._key} section={section} />
                ))}
              </div>
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
