import Image, { type ImageProps } from "next/image";

import { framedImageUrl } from "@/sanity/lib/image";

/**
 * A photograph from Sanity that obeys the crop and hotspot set in the Studio.
 *
 * Use this anywhere the site paints a Sanity photograph into a fixed box. It
 * is `next/image` with one extra prop, `source`, which is the image object
 * rather than its url.
 *
 *   <SanityImage
 *     source={section.image?.source}
 *     src={section.image?.url ?? ""}
 *     alt={...}
 *     width={704}
 *     height={556}
 *     className="h-[556px] w-full object-cover"
 *   />
 *
 * WITH NO CROP AND NO HOTSPOT IT IS EXACTLY `next/image`
 *
 * `framedImageUrl` returns undefined unless the Studio holds a crop or a
 * hotspot, so an untouched photograph is served from the same url as before,
 * byte for byte, and the browser centre-crops it with `object-cover` as it
 * always has. Nothing moves until somebody drags the frame.
 *
 * That is the whole design, and it is what lets this be added to every
 * photograph at once: see the note in sanity/lib/image.ts, and the proof in
 * scripts/audit-image-framing.js, which compares every image url on every page
 * against a baseline taken before the change.
 *
 * KEEP `object-cover` ON THE ELEMENT
 *
 * The box is still the box. Sanity decides which part of the photograph is in
 * the file; the class decides how that file fills the element. Dropping
 * `object-cover` would stretch an uncropped photograph, since that is the path
 * most of them still take.
 *
 * `width` and `height` are the box, and the url is built at twice them so it
 * stays sharp on a 2x screen.
 */
export function SanityImage({
  source,
  src,
  width,
  height,
  ...rest
}: Omit<ImageProps, "src"> & {
  /** The image object with its crop and hotspot. Undefined is fine. */
  source?: unknown;
  /** The plain asset url, used whenever there is no crop or hotspot. */
  src: string;
  width: number;
  height: number;
}) {
  return (
    <Image
      {...rest}
      src={framedImageUrl(source, width, height) || src}
      width={width}
      height={height}
    />
  );
}
