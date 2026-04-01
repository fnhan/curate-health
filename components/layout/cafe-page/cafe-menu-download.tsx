import Image from "next/image";

import { FileDown, UtensilsCrossed } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CAFE_PAGE_QUERYResult } from "@/sanity.types";

type MenuSection = NonNullable<CAFE_PAGE_QUERYResult>["menuDownloadSection"];

/** Feature image on the right — same bar + image sizing as odd-index rows in alternating-sections. */
const menuFeatureImageFrameClasses = {
  bar: "absolute -top-7 right-0 h-[387px] w-[calc(100%-2rem)] bg-secondary sm:w-[calc(100%-4rem)] md:h-[487px]",
  image:
    "relative z-10 h-[360px] w-full object-cover md:h-[556px] pl-4 sm:pl-8 md:pl-0",
} as const;

export function CafeMenuDownloadSection({ data }: { data: MenuSection }) {
  if (data == null) return null;
  const url = data.menuFile?.url?.trim();
  if (!url) return null;

  const filename =
    data.menuFile?.originalFilename?.trim() || "curate-cafe-menu.pdf";
  const headline = data.headline?.trim() || "Our café menu";
  const description =
    data.description?.trim() ||
    "Seasonal, nourishing options from our in-clinic Health Café—save the latest menu to your phone.";
  const buttonLabel = data.buttonLabel?.trim() || "Download menu (PDF)";

  const imageUrl = data.featureImage?.url?.trim() ?? "";
  const imageAlt = data.featureImage?.alt?.trim() ?? "";
  const hasImage = Boolean(imageUrl);

  const innerCard = (
    <div className="relative overflow-hidden bg-white">
      <div
        className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary via-primary/75 to-secondary/90"
        aria-hidden
      />
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <span className="flex size-12 items-center justify-center border border-primary/15 bg-primary/10 text-primary">
          <UtensilsCrossed
            className="size-6 shrink-0"
            strokeWidth={1.25}
            aria-hidden
          />
        </span>
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-secondary">
          Health Café
        </p>
      </div>
      <h2
        id="cafe-menu-download-heading"
        className="text-balance text-2xl font-light leading-tight tracking-tight md:text-3xl lg:text-[2rem]"
      >
        {headline}
      </h2>
      <p className="mt-4 max-w-xl text-pretty text-base font-light leading-relaxed text-muted-foreground md:text-lg">
        {description}
      </p>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
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
        <span className="text-sm font-light text-muted-foreground">
          Adobe PDF
        </span>
      </div>
    </div>
  );

  return (
    <section
      className="bg-white pb-28 font-poppins text-primary"
      aria-labelledby="cafe-menu-download-heading"
    >
      {hasImage ? (
        <div className="flex flex-col gap-16 md:container md:grid md:grid-cols-2 md:gap-16">
          <div className="container order-2 flex flex-col md:order-1 md:max-w-none md:px-0">
            {innerCard}
          </div>
          <div className="relative order-1 md:order-2">
            <div className={menuFeatureImageFrameClasses.bar} aria-hidden />
            <Image
              loading="lazy"
              src={imageUrl}
              alt={imageAlt || headline}
              width={704}
              height={556}
              className={menuFeatureImageFrameClasses.image}
            />
          </div>
        </div>
      ) : (
        <div className="container mx-auto max-w-3xl">{innerCard}</div>
      )}
    </section>
  );
}
