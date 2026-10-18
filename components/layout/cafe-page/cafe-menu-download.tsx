import Link from "next/link";

import { ArrowRight, FileDown, UtensilsCrossed } from "lucide-react";

import { Button } from "@/components/ui/button";
import { externalLinkProps } from "@/lib/links";

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
 * It was a PDF download button and nothing else, which made a file the only
 * way to read the menu. CH-108 built the menu as a page, and Frank had the
 * download button off on 2026-10-18 once that page existed.
 *
 * **The PDF button is the fallback now, not the second button.** It appears
 * only when there is no menu page to link to, because this block with no
 * action in it is worse than a download. `menuPath` is passed only when that
 * page has items on it, the same gate the route and the sitemap use, so this
 * never links to a 404.
 *
 * The file itself is untouched in Sanity, so switching the menu document off
 * puts the download straight back.
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
      <div className="mt-8 flex justify-center">
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
        ) : url && buttonLabel ? (
          <Button
            asChild
            size="lg"
            className="h-12 gap-2 rounded-none px-8 text-base font-normal transition-opacity hover:opacity-90"
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
