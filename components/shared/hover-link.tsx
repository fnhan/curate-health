import Link from "next/link";

import { ChevronRight } from "lucide-react";

import { externalLinkProps } from "@/lib/links";
import { cn } from "@/lib/utils";

/**
 * The thin link bar that closes a section: a hairline, then the label and a
 * chevron pushed to the right, which fill with sage and spread apart on hover.
 *
 * ONE COMPONENT, TWO TONES. IT WAS TWO COMPONENTS UNTIL 2026-10-26.
 *
 * `hover-link.tsx` drew "More About Us" and the other four on the home page,
 * and `hover-link-variation.tsx` drew the bar under the Program Timeline and
 * the one on /about/b-corp. Same design, drawn twice, so neither could be
 * changed without remembering the other. They had already drifted: the
 * variation carried `text-lg` at 18px where this one inherits 16px, which
 * Frank caught by asking whether they matched. He then asked for every bar on
 * the site to match, which is this.
 *
 * `tone` is the only difference left, and it is a real one rather than drift:
 *
 *   dark   no background, white text, a hairline in the default border grey.
 *          For a bar sitting on the dark green, which is the home page and
 *          the two section hubs.
 *   light  platinum behind it, dark green text and hairline. For a bar on a
 *          white or platinum section, which is Curate Lifestyle and
 *          /about/b-corp, where white text would vanish.
 *
 * Both fill sage on hover and turn their text white, so the hover is one
 * behaviour whichever tone the bar rests in.
 *
 * THE ANCHOR IS A BLOCK, AND THAT MATTERS MORE THAN IT LOOKS
 *
 * `next/link` renders an inline `<a>`, and neither `w-full` nor a background
 * applies to an inline box. The Program Timeline bar painted nothing at all
 * for that reason until 2026-09-20: it read as an empty dark strip on a
 * screenshot and as a working link in the source. This one survived only
 * because it had no background to lose.
 */
export default function HoverLink({
  href,
  text,
  textColor,
  tone = "dark",
}: {
  href: string;
  text: string;
  /** Overrides the tone's own colour, for a bar on an unusual background. */
  textColor?: string;
  tone?: "dark" | "light";
}) {
  const light = tone === "light";
  const colour = textColor ?? (light ? "text-primary" : "text-white");

  return (
    <Link
      href={href}
      className={cn("block w-full", light && "bg-platinum")}
      {...externalLinkProps(href)}
    >
      <span
        className={cn(
          "group block border-t py-5 text-right italic transition-all duration-300 hover:bg-secondary",
          light && "border-primary"
        )}
      >
        <span className="container flex items-center justify-end gap-2 transition-all duration-300 hover:gap-20">
          <span className={cn(colour, "group-hover:text-white")}>{text}</span>
          <ChevronRight className={cn("w-5", colour, "group-hover:text-white")} />
        </span>
      </span>
    </Link>
  );
}
