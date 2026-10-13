import { cn } from "@/lib/utils";

/**
 * THE THIRD PIECE OF THE SECTION PATTERN, AFTER section-hero.tsx AND
 * section-navigation.tsx.
 *
 * The band of prose between the second menu and the card grid. /about had it
 * first; Frank asked on 2026-10-12 for /services and /products to carry the
 * same thing, so it is one component rather than three that drift.
 *
 * ONE COLUMN. NO COLUMNS AT ALL.
 *
 * This band was two balanced columns for about an hour on 2026-10-12 and Frank
 * killed it: "this prose looks stupid, lets just get rid of the columns and
 * keep it to a single column so there's no breaks."
 *
 * He is right, and the reason is worth keeping so nobody tries again. Balanced
 * columns and whole paragraphs are mutually exclusive. The first version kept
 * paragraphs whole with `break-inside-avoid` and the columns ended hundreds of
 * pixels apart. The second let the browser balance, and it balanced by cutting
 * a sentence across the gutter: /about ended its left column on "rather than
 * treating" and opened its right one on "it separately." Two words alone at the
 * top of a column is worse than either problem it was solving.
 *
 * Newspaper columns work because they are tall. These bands are five to eight
 * lines, so every break lands in the middle of a thought. **Do not reintroduce
 * `columns-2` here**, balanced or otherwise.
 *
 * THE WIDTH
 *
 * The original was `container max-w-[70ch]` and it floated in the middle of the
 * page with the photographs sticking out either side. That was not the measure,
 * it was `container`, which is configured `center: true`, so its `mx-auto`
 * centred the narrow box in the viewport.
 *
 * So the measure stays and the centring goes: `mr-auto` pins the block to the
 * container's left edge, which is where the first photograph in the grid below
 * starts. One column the full width of the container would be a 165 character
 * line, about twice what anybody reads comfortably.
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
      <div className="container">
        <div className="mr-auto flex max-w-[70ch] flex-col gap-6">
          {paragraphs.map((text) => (
            <p key={text} className="font-light leading-7 text-primary">
              {text}
            </p>
          ))}
        </div>
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
