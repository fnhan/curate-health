import { SanityImage } from "@/components/shared/sanity-image";

type TreatmentHeroSectionProps = {
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
 * The band across the top of a treatment page.
 *
 * A FILL IMAGE, SO THE STUDIO'S FRAMING ACTUALLY REACHES IT
 *
 * This was plain `next/image` with a width and a height until 2026-10-25,
 * which made it the one slot on a treatment page where cropping or
 * hotspotting a photograph in the Studio did nothing: the bare asset url went
 * straight to the optimiser and the browser centre-cropped whatever came
 * back. Eighteen live pages, and the only sign was that nothing happened.
 *
 * `fill` is what fixes it, not simply passing the image object. SanityImage
 * only reads a hotspot for a fill image, because a hotspot is expressed as
 * `object-position` and that needs the element to take its size from a box
 * rather than from a declared width and height. With `fill` it applies the
 * crop rectangle to the file AND the hotspot to the CSS, so both work.
 *
 * NOTHING MOVED WHEN THIS LANDED
 *
 * With no crop and no hotspot stored, `croppedImageUrl` returns undefined and
 * the bare url is served exactly as before, byte for byte, and no
 * object-position is set. Frank asked for that guarantee and it was checked
 * against the render baseline: zero image urls changed across the site.
 */
export default function TreatmentHeroSection({
  hero_image,
}: TreatmentHeroSectionProps) {
  const { asset, alt, source } = hero_image;

  return (
    <div className="relative h-[254px] w-full md:h-[364px] lg:h-[608px]">
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
