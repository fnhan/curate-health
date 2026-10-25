import { SanityImage } from "@/components/shared/sanity-image";

type ServiceHeroSectionProps = {
  hero_image: {
    asset: {
      url: string;
    };
    /** The image object, so a crop or hotspot set in the Studio is honoured. */
    source?: unknown;
    alt: string;
  };
};

/**
 * The band across the top of a service category page.
 *
 * Same fix as treatment-hero-section.tsx on 2026-10-25, and the same reason:
 * this was plain `next/image`, so a crop or hotspot set in the Studio was
 * thrown away. SERVICE_BY_SLUG_QUERY had been projecting `hero_imageSource`
 * with the crop and hotspot in it for weeks; nothing was reading it.
 *
 * `fill` is the part that matters. SanityImage only applies a hotspot to a
 * fill image, because a hotspot becomes `object-position` and that needs the
 * element to take its size from a box rather than a declared width and
 * height. With no crop and no hotspot stored the bare url is served exactly
 * as before.
 */
export default function ServiceHeroSection({
  hero_image,
}: ServiceHeroSectionProps) {
  const { asset, alt, source } = hero_image;

  return (
    <div className="relative h-[400px] w-full md:h-[550px]">
      <SanityImage
        source={source}
        src={asset.url}
        alt={alt ?? ""}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
    </div>
  );
}
