import Link from "next/link";

import { ArrowRight, FileDown, UtensilsCrossed } from "lucide-react";

import { Button } from "@/components/ui/button";
import { externalLinkProps } from "@/lib/links";
import { cn } from "@/lib/utils";

type MenuSection = {
  eyebrow?: string | null;
  headline?: string | null;
  description?: string | null;
  buttonLabel?: string | null;
  menuFile?: {
    url?: string | null;
    originalFilename?: string | null;
    mimeType?: string | null;
  } | null;
} | null;

/**
 * The menu block on /cafe.
 *
 * It was a download button and nothing else, which made a PDF the only way to
 * read the menu. CH-108 built the menu as a page, so reading it is the primary
 * action here and the PDF is the secondary one, for printing.
 *
 * `menuPath` is passed only when that page has items on it, the same gate the
 * route and the sitemap use, so this never links to a 404.
 */
export function CafeMenuDownloadSection({
  data,
  menuPath,
}: {
  data: MenuSection;
  menuPath?: string | null;
}) {
  if (data == null) return null;
  const url = data.menuFile?.url?.trim();
  // One or the other is enough. Before the menu page existed this returned
  // null without a PDF, which would now hide a working page.
  if (!url && !menuPath) return null;

  const filename = data.menuFile?.originalFilename?.trim() || "cafe-menu.pdf";
  const eyebrow = data.eyebrow?.trim();
  const headline = data.headline?.trim();
  const description = data.description?.trim();
  const buttonLabel = data.buttonLabel?.trim();

  const innerCard = (
    <div className="relative overflow-hidden bg-white text-center">
      <div
        className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary via-primary/75 to-secondary/90"
        aria-hidden
      />
      <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
        <span className="flex size-12 items-center justify-center border border-primary/15 bg-primary/10 text-primary">
          <UtensilsCrossed
            className="size-6 shrink-0"
            strokeWidth={1.25}
            aria-hidden
          />
        </span>
        {eyebrow ? (
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-secondary">
            {eyebrow}
          </p>
        ) : null}
      </div>
      {headline ? (
        <h2
          id="cafe-menu-download-heading"
          className="text-balance text-2xl font-light leading-tight tracking-tight md:text-3xl lg:text-[2rem]"
        >
          {headline}
        </h2>
      ) : null}
      {description ? (
        <p className="mx-auto mt-4 max-w-xl text-pretty text-base font-light leading-relaxed text-muted-foreground md:text-lg">
          {description}
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        {menuPath ? (
          <Button
            asChild
            size="lg"
            className="h-12 gap-2 rounded-none px-8 text-base font-normal transition-opacity hover:opacity-90"
          >
            <Link href={menuPath}>
              View the menu
              <ArrowRight className="size-5 shrink-0" aria-hidden />
            </Link>
          </Button>
        ) : null}
        {/*
          The PDF steps back to a secondary button once the page is here, and
          stays the filled one when it is the only thing in this block.

          THE COLOURS ARE SPELLED OUT BECAUSE `outline` IS DARK ON DARK HERE.

          The shared outline variant is `bg-background` with no text colour,
          and `--background` in this theme is the dark green, so it paints a
          dark green box and lets the text inherit the dark green around it:
          a filled rectangle with an invisible label. It looks correct in the
          source and reads as a blank box on the page. Measured rather than
          eyeballed, both were rgb(39, 52, 24).

          Fixed here rather than in components/ui/button.tsx, because that
          variant is shared and changing it would repaint buttons on pages
          this ticket has not looked at.
        */}
        {url && buttonLabel ? (
          <Button
            asChild
            size="lg"
            variant={menuPath ? "outline" : "default"}
            className={cn(
              "h-12 gap-2 rounded-none px-8 text-base font-normal transition-opacity hover:opacity-90",
              menuPath &&
                "border-primary/30 bg-white text-primary hover:bg-primary/5 hover:text-primary"
            )}
          >
            <a href={url} {...externalLinkProps(url)} download={filename}>
              <FileDown className="size-5 shrink-0" aria-hidden />
              {buttonLabel}
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );

  return (
    <section
      className="bg-white pb-28 font-poppins text-primary"
      aria-labelledby={headline ? "cafe-menu-download-heading" : undefined}
    >
      <div className="container mx-auto max-w-3xl">{innerCard}</div>
    </section>
  );
}
