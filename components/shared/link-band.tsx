import Link from "next/link";

import { ArrowRight } from "lucide-react";

/**
 * A full width band that is one link, dark green filling platinum on hover.
 *
 * Frank picked this shape on 2026-10-18 for the way into the cafe menu, and
 * pinned the detail: "I like the simplicity, Cafe menu then Read the full menu
 * ->, keeps it simple for the eye to find." A noun, then the action with an
 * arrow, and nothing else.
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
 * His colours. Platinum is #DBDED9, a pale grey green, so the white text that
 * reads on the olive would vanish on it. Every line and the arrow flip to the
 * dark green on hover, which is the same pair the resting state uses, the
 * other way round.
 *
 * The bar under the Program Timeline runs platinum to sage with the text going
 * white. This is that idea reversed, and it is deliberate: this band is dark
 * at rest so it carries weight on a white page.
 *
 * THE STRINGS ARE IN THE CODE, NOT THE STUDIO
 *
 * They are link labels rather than editorial copy, the same as every other
 * navigation label on the site. The first version of the cafe band read a
 * deleted card's Studio fields and so published its old paragraph here, which
 * is the opposite of the simplicity he asked for.
 *
 * `font-poppins` is set by the caller, because /cafe runs in that face and the
 * service pages do not.
 */
export function LinkBand({
  href,
  heading,
  action,
  className,
}: {
  href: string;
  /** The noun, large. "Cafe menu", "Class schedule". */
  heading: string;
  /** The action, small, with the arrow after it. "Read the full menu". */
  action: string;
  /** Merged onto the outer section, for the typeface. */
  className?: string;
}) {
  return (
    <section className={className ? `bg-white ${className}` : "bg-white"}>
      <Link
        href={href}
        className="group block bg-primary transition-colors duration-500 hover:bg-platinum focus-visible:bg-platinum focus-visible:outline-none"
      >
        <div className="container py-14 md:py-20">
          <p className="text-3xl font-light leading-tight text-white transition-colors duration-500 group-hover:text-primary md:text-4xl lg:text-5xl">
            {heading}
          </p>
          <p className="mt-4 flex items-center gap-3 text-base font-light text-white/80 transition-colors duration-500 group-hover:text-primary md:text-lg">
            {action}
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
