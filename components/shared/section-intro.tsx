import { cn } from "@/lib/utils";

/**
 * THE THIRD PIECE OF THE SECTION PATTERN, AFTER section-hero.tsx AND
 * section-navigation.tsx.
 *
 * The band of prose between the second menu and the card grid. /about had it
 * first; Frank asked on 2026-10-12 for /services and /products to carry the
 * same thing, so it is one component rather than three that drift.
 *
 * THE COLUMNS ARE SYMMETRICAL. THAT IS THE RULE, NOT A PREFERENCE.
 *
 * Frank set it on 2026-10-12, after all three pages shipped lopsided: "make
 * this a rule to have it symmetrical, no matter how long the content is, make
 * best efforts to make it symmetrical."
 *
 * So the band leaves the balancing to the browser. `columns-2` with
 * `column-fill: balance`, which is the default, makes both columns the same
 * height to within one line, whatever the paragraphs happen to weigh.
 *
 * **Do not add `break-inside-avoid` back.** The first version had it, to stop a
 * paragraph splitting across the gutter, and that is exactly what broke the
 * symmetry: with whole paragraphs as the only unit, five paragraphs of
 * different lengths pack three into the left column and two into the right,
 * and the two columns end hundreds of pixels apart. Keeping a paragraph whole
 * and keeping the columns even are the same decision made two ways, and Frank
 * has chosen even. A paragraph continuing across the gutter is how a column of
 * text has always read.
 *
 * `orphans` and `widows` are the part that keeps that readable: no single line
 * is left behind at the foot of one column or stranded at the head of the next.
 * They are set as a style rather than a class because Tailwind has no utility
 * for either.
 *
 * One paragraph balances too, split down the middle, which is why there is no
 * special case for it any more. The old one rendered a lone paragraph at full
 * container width, and that was the worst asymmetry of the three.
 *
 * THE WIDTH
 *
 * The band used to be `container max-w-[70ch]`. `container` is configured
 * `center: true`, so the 70ch box was centred in the viewport while the card
 * grid below it spanned the whole container: the text floated in the middle of
 * the page with the photographs sticking out either side. It fills the
 * container now, so both edges line up with the photographs, and the split in
 * two keeps the line near 80 characters rather than 165.
 */
export default function SectionIntro({
  paragraphs,
  className,
}: {
  paragraphs: string[];
  className?: string;
}) {
  if (paragraphs.length === 0) return null;

  return (
    <section className={cn("bg-white py-16 md:py-24", className)}>
      <div
        className="container lg:columns-2 lg:gap-12"
        style={{ columnFill: "balance", orphans: 2, widows: 2 }}
      >
        {paragraphs.map((text) => (
          <p
            key={text}
            className="mb-6 font-light leading-7 text-primary last:mb-0"
          >
            {text}
          </p>
        ))}
      </div>
    </section>
  );
}

/** Blank lines separate paragraphs, the convention every intro field uses. */
export function toParagraphs(intro: string | null | undefined): string[] {
  return (intro ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}
