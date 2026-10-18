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
 * Deal the sections into two columns: as even as they go, and when they cannot
 * be even, the left one longer.
 *
 * Frank's rule, 2026-10-18: "make sure it's balanced as best as possible, but
 * if one needs a bit more, make it the left". CSS `columns-2` decides the split
 * itself and leans whichever way it likes, so the decision is made here and the
 * columns are real elements.
 *
 * WHY THIS IS NOT A SINGLE SPLIT POINT
 *
 * The first version cut the list in two at one index, which is the obvious
 * reading of "two columns" and is also the reason it was 437px out. With one
 * cut there are only ten arrangements to choose from and none of them was even:
 * the cut before Smoothies left the right column 512px ahead, and the cut after
 * it left the left column 437px ahead. There was nothing in between to pick.
 *
 * Choosing which column each section goes in opens 2^n arrangements instead, so
 * a near-even one almost always exists. Ten sections is 1024 to try, which is
 * nothing, and the page is static.
 *
 * WHY IT IS NOT PURELY THE MOST EVEN ONE
 *
 * The most even arrangement is often a scatter. Left to itself this one put
 * Kombucha alone at the top of the left column with Hot and Iced over on the
 * right, balanced to 32px and opening on the wrong thing. So two things rein
 * it in.
 *
 * **The menu's first section always leads the left column.** A reader starting
 * at the top left has to meet the top of the menu, whatever the arithmetic
 * prefers. This is a constraint rather than a preference.
 *
 * **Near-even beats dead even when it groups better.** It takes the most even
 * arrangement, then accepts any within TOLERANCE of it that holds the sections
 * in fewer contiguous runs, and prefers the evenest of those. One run each side
 * is a single clean cut.
 *
 * Order within each column is the menu's own, always.
 */
function splitIntoColumns(sections: MenuSection[]) {
  /*
   * Rendered heights in pixels, measured off the page at 1680 rather than
   * guessed. They only have to rank the sections against each other, so a
   * section out by a few pixels cannot change the answer; one out by half its
   * height could.
   */
  const HEADING = 110;
  const NOTE = 28;
  const ITEM = 60;
  const INGREDIENT_LINE = 24;
  const CHARS_PER_LINE = 60;
  const BETWEEN_SECTIONS = 80;

  /** How much unevenness is worth trading for a tidier arrangement. */
  const TOLERANCE = 60;

  /** Above this, 2^n stops being free and it falls back to one split point. */
  const BRUTE_FORCE_LIMIT = 18;

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
  const total = heights.reduce((a, b) => a + b, 0);
  const n = sections.length;

  const take = (mask: number, right: boolean) =>
    sections.filter((_, i) => Boolean(mask & (1 << i)) === right);

  if (n > BRUTE_FORCE_LIMIT) {
    // One split point, the first that puts half or more in the left column.
    let running = 0;
    let at = n;
    for (let i = 0; i < n; i += 1) {
      running += heights[i];
      if (running >= total / 2) {
        at = i + 1;
        break;
      }
    }
    return [sections.slice(0, at), sections.slice(at)] as const;
  }

  /** Contiguous blocks in the arrangement. One means a single clean cut. */
  const runs = (mask: number) => {
    let count = 0;
    for (let i = 0; i < n; i += 1) {
      const side = mask & (1 << i);
      const previous = i > 0 ? mask & (1 << (i - 1)) : -1;
      if (i === 0 || Boolean(side) !== Boolean(previous)) count += 1;
    }
    return count;
  };

  type Option = { mask: number; gap: number; runs: number };
  const options: Option[] = [];

  for (let mask = 0; mask < 1 << n; mask += 1) {
    // The menu's first section leads the left column, always.
    if (mask & 1) continue;

    let right = 0;
    for (let i = 0; i < n; i += 1) {
      if (mask & (1 << i)) right += heights[i];
    }
    const gap = total - right - right;
    // The left column must never be the shorter one.
    if (gap < 0) continue;
    options.push({ mask, gap, runs: runs(mask) });
  }

  const evenest = Math.min(...options.map((option) => option.gap));
  const best = options
    .filter((option) => option.gap <= evenest + TOLERANCE)
    .sort((a, b) => a.runs - b.runs || a.gap - b.gap)[0];

  return [take(best.mask, false), take(best.mask, true)] as const;
}

/** One section of the menu: its heading, its standing note, and its items. */
function MenuSectionBlock({ section }: { section: MenuSection }) {
  return (
    <section className="mb-16 flex flex-col gap-8 md:mb-20">
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
