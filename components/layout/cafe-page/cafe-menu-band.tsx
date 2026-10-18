import Link from "next/link";

import { ArrowRight } from "lucide-react";

type MenuBand = {
  headline?: string | null;
  description?: string | null;
} | null;

/**
 * The band on /cafe that opens the menu. CH-108.
 *
 * Frank picked this shape on 2026-10-18 from three drafts, in dark green
 * filling sage on hover, and **it replaces both of the other menu calls to
 * action**: the "What we're serving today" card with its View the menu button,
 * and the PDF download that card used to carry. One way into the menu, not
 * three.
 *
 * THE WHOLE BAND IS THE LINK
 *
 * He asked for "the entire section being a clickable button", so the anchor is
 * the section rather than something inside it. That means one tab stop and one
 * target rather than a heading, a line of copy and a button that all go to the
 * same place.
 *
 * The arrow is decorative and the heading is the accessible name, so nothing
 * needs an aria-label.
 *
 * WHITE ON SAGE IS THE HOUSE HOVER
 *
 * The bar under the Program Timeline already does this, platinum filling sage
 * with the text going white, and Frank chose those colours. The resting state
 * here is white on dark green, which is the high contrast one; the sage only
 * appears under the cursor. The supporting line goes to full white on hover for
 * that reason, rather than staying at 80%.
 *
 * It takes its words from `cafePage.menuDownloadSection`, the same fields the
 * old card used, so the copy stays editable in the Studio and no new field was
 * needed. Rendered only when there is a menu page with items on it.
 */
export function CafeMenuBand({
  data,
  menuPath,
}: {
  data: MenuBand;
  menuPath?: string | null;
}) {
  if (!menuPath) return null;

  const headline = data?.headline?.trim() || "Cafe menu";
  const description = data?.description?.trim();

  return (
    <section className="bg-white font-poppins">
      <Link
        href={menuPath}
        className="group block bg-primary transition-colors duration-500 hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-none"
      >
        <div className="container flex items-center justify-between gap-8 py-12 md:py-16">
          <div>
            <p className="text-2xl font-light leading-tight text-white md:text-3xl lg:text-4xl">
              {headline}
            </p>
            {description ? (
              <p className="mt-3 max-w-[60ch] text-sm font-light leading-relaxed text-white/80 transition-colors duration-500 group-hover:text-white md:text-base">
                {description}
              </p>
            ) : null}
          </div>
          <span className="flex size-12 shrink-0 items-center justify-center border border-white/40 text-white transition-all duration-500 group-hover:border-white md:size-14">
            <ArrowRight
              className="size-5 transition-transform duration-500 group-hover:translate-x-1 md:size-6"
              aria-hidden
            />
          </span>
        </div>
      </Link>
    </section>
  );
}
