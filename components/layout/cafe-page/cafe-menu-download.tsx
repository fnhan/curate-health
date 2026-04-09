import { FileDown, UtensilsCrossed } from "lucide-react";

import { Button } from "@/components/ui/button";
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

export function CafeMenuDownloadSection({ data }: { data: MenuSection }) {
  if (data == null) return null;
  const url = data.menuFile?.url?.trim();
  if (!url) return null;

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
      {buttonLabel ? (
        <div className="mt-8 flex justify-center">
          <Button
            asChild
            size="lg"
            className="h-12 gap-2 rounded-none px-8 text-base font-normal transition-opacity hover:opacity-90"
          >
            <a
              href={url}
              download={filename}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileDown className="size-5 shrink-0" aria-hidden />
              {buttonLabel}
            </a>
          </Button>
        </div>
      ) : null}
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
