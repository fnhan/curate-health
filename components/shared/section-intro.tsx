import { cn } from "@/lib/utils";

/**
 * THE THIRD PIECE OF THE SECTION PATTERN, AFTER section-hero.tsx AND
 * section-navigation.tsx.
 *
 * The band of prose between the second menu and the card grid. /about had it
 * first; Frank asked on 2026-10-12 for /services to carry the same thing, so
 * it is one component rather than two that drift, per the section rule.
 *
 * TWO COLUMNS, AND WHY
 *
 * The band used to be `container max-w-[70ch]`. `container` is configured with
 * `center: true`, so the 70ch box was centred in the viewport while the card
 * grid below it spanned the whole container: the text floated in the middle of
 * the page with the photographs sticking out either side of it. Frank asked for
 * the two to line up.
 *
 * Dropping the cap alone lines the edges up and gives a 165 character line,
 * which is roughly twice a readable measure. So the band fills the container
 * and splits into two columns from the large breakpoint, which puts both edges
 * flush with the photographs and keeps the line near 80 characters.
 *
 * Multi-column rather than a two-column grid because this is continuous prose:
 * it should read down the first column and then down the second, the way a
 * column of text normally does, not left to right across pairs. `break-inside`
 * keeps a paragraph whole, so nothing splits across the gutter.
 *
 * A single paragraph stays one column. It cannot be balanced across two without
 * being split, and one short paragraph alone in the left half would look like
 * the bug this component exists to fix.
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
        className={cn(
          "container",
          paragraphs.length > 1 && "lg:columns-2 lg:gap-12"
        )}
      >
        {paragraphs.map((text) => (
          <p
            key={text}
            className="mb-6 break-inside-avoid font-light leading-7 text-primary last:mb-0"
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
