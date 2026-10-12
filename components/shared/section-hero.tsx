import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * THE SECTION HERO. THE OTHER HALF OF THE PATTERN IN section-navigation.tsx.
 *
 * A photograph the width of the page with the section's name over it, and the
 * second menu directly underneath. /services has looked like this since the
 * site was built; Frank asked on 2026-09-20 for /products to match, and for
 * both to be one thing rather than two that drift.
 *
 *   Height    400px, 550px from the medium breakpoint up
 *   Photo     covers the box, dimmed to 60% so the text stays readable
 *   Text      bottom left, inside the container, the page's one h1 with the
 *             standing line under it at 80 characters
 *
 * The photograph is the page's largest asset and the first thing painted, so
 * it is marked priority and asks for the full viewport width.
 */
export default function SectionHero({
  image,
  alt,
  title,
  subtitle,
  imageClassName,
}: {
  image: string;
  alt: string;
  title: string;
  subtitle?: string | null;
  /**
   * Merged onto the photograph. /about passes grayscale, because its hero is a
   * practitioner's portrait and a full-bleed colour face at the top of a hub
   * reads as that person's page rather than the practice's.
   */
  imageClassName?: string;
}) {
  return (
    <section className="relative">
      <Image
        width={1920}
        height={1080}
        src={image}
        alt={alt}
        quality={100}
        priority
        sizes="100vw"
        className={cn(
          "h-[400px] w-full object-cover opacity-60 md:h-[550px]",
          imageClassName
        )}
      />
      <div className="absolute inset-0 flex flex-col justify-end pb-16">
        <div className="container">
          <h1 className="text-2xl md:text-4xl 2xl:text-6xl">{title}</h1>
          {subtitle ? (
            <div className="mt-8 max-w-[80ch] text-pretty font-light">
              {subtitle}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
