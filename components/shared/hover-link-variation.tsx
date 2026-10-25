import Link from "next/link";

import { ChevronRight } from "lucide-react";

import { externalLinkProps } from "@/lib/links";

type HoverLinkProps = {
  href: string;
  text: string;
  textColor?: string;
};

/**
 * The bar under the Program Timeline that opens the full breakdown.
 *
 * It rendered as dark text on the dark page background and read as an empty
 * band, because next/link renders an inline <a>: "w-full" does nothing to an
 * inline box, and the background painted nowhere, so the body's own dark
 * colour showed through.
 *
 * The anchor is a block now, so its background paints. Frank picked the
 * colours on 2026-09-20: platinum, which is #DBDED9, with the dark green of
 * the rest of the page for the text and for the line above it. Hovering is
 * unchanged, filling the bar sage and turning the text white.
 *
 * It takes an address off the site too, since 2026-10-25, when Frank asked for
 * the B Corp directory link to be this bar rather than a text link.
 * `externalLinkProps` returns nothing for an internal href, so the two
 * existing call sites are untouched.
 */
export default function HoverLinkVariation({
  href,
  text,
  textColor = "text-primary",
}: HoverLinkProps) {
  return (
    <Link
      className="block w-full bg-platinum"
      href={href}
      {...externalLinkProps(href)}
    >
      <span className="group block border-t border-primary py-5 text-right italic transition-all duration-300 hover:bg-secondary">
        <span className="container flex items-center justify-end gap-2 transition-all duration-300 hover:gap-20">
          <span className={`${textColor} text-lg group-hover:text-white`}>
            {text}
          </span>
          <ChevronRight className={`w-5 ${textColor} group-hover:text-white`} />
        </span>
      </span>
    </Link>
  );
}
