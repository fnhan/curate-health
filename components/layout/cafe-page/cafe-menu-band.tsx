import Link from "next/link";

import { ArrowRight } from "lucide-react";

/**
 * The band on /cafe that opens the menu. CH-108.
 *
 * Frank picked this from three drafts on 2026-10-18, then pinned the detail:
 * "I like the simplicity, Cafe menu then Read the full menu ->, keeps
 * it simple for the eye to find." Dark green filling sage on hover, sitting
 * directly above the Visit the cafe band.
 *
 * It replaced both of the other menu calls to action: the "What we're serving
 * today" card and the PDF download inside it.
 *
 * THE WHOLE BAND IS THE LINK
 *
 * He asked for "the entire section being a clickable button", so the anchor is
 * the section rather than something inside it. One tab stop and one target
 * rather than a heading, a line of copy and a button that all go to the same
 * place.
 *
 * OLIVE GREEN FILLING PLATINUM, AND THE TEXT HAS TO TURN OVER WITH IT
 *
 * Frank's colours, 2026-10-18. Platinum is #DBDED9, a pale grey green, so
 * the white text that reads on the olive would vanish on it. Every line and
 * the arrow flip to the dark green on hover, which is the same pair the
 * resting state uses, the other way round.
 *
 * The bar under the Program Timeline runs platinum to sage with the text
 * going white. This is that idea reversed, and it is deliberate: this band
 * is dark at rest so it carries weight on a white page.
 *
 * THE TWO STRINGS ARE IN THE CODE, NOT THE STUDIO
 *
 * "Cafe menu" and "Read the full menu" are his words and they are a link
 * label rather than editorial copy, the same as every other navigation label
 * on the site. An earlier version read the deleted card's Studio fields and
 * so published its old paragraph here, which is the opposite of the
 * simplicity he asked for.
 */
export function CafeMenuBand({ menuPath }: { menuPath?: string | null }) {
  if (!menuPath) return null;

  return (
    <section className="bg-white font-poppins">
      <Link
        href={menuPath}
        className="group block bg-primary transition-colors duration-500 hover:bg-platinum focus-visible:bg-platinum focus-visible:outline-none"
      >
        <div className="container py-14 md:py-20">
          <p className="text-3xl font-light leading-tight text-white transition-colors duration-500 group-hover:text-primary md:text-4xl lg:text-5xl">
            Cafe menu
          </p>
          <p className="mt-4 flex items-center gap-3 text-base font-light text-white/80 transition-colors duration-500 group-hover:text-primary md:text-lg">
            Read the full menu
            <ArrowRight
              className="size-5 shrink-0 transition-transform duration-500 group-hover:translate-x-1"
              aria-hidden
            />
          </p>
        </div>
      </Link>
    </section>
  );
}
