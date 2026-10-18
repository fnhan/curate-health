import createImageUrlBuilder from "@sanity/image-url";
import type { Image } from "sanity";

import { dataset, projectId } from "../env";

const imageBuilder = createImageUrlBuilder({
  projectId: projectId || "",
  dataset: dataset || "",
});

export const urlForImage = (source: Image) => {
  return imageBuilder?.image(source).auto("format").fit("max").url();
};

/** The size every social platform wants, and the ratio they all crop to. */
export const SHARE_IMAGE_WIDTH = 1200;
export const SHARE_IMAGE_HEIGHT = 630;

/**
 * A share image at the size a share card actually uses.
 *
 * Without this the raw asset goes into og:image at whatever it was uploaded
 * at. Measured on the live site: 2.4 MB for Our Story, 952 KB for Our
 * Programs, 917 KB for Pillars of Health, each several thousand pixels wide.
 * The same images at 1200x630 are around 70 KB. Some platforms refuse an
 * og:image over a few megabytes outright, and every one of them was going to
 * crop these to 1.91:1 anyway, with no say in where.
 *
 * Taking the crop here means the choice is ours. It also means a crop set on
 * the image in the Studio is honoured, so fixing a badly framed share card is
 * something Frank can do by dragging a box rather than by asking for a code
 * change. That matters for portrait sources: Our Programs' photograph is
 * 3733x5599, and every automatic 1.91:1 crop of it cuts both heads off.
 */
export const urlForShareImage = (source: Image) => {
  return imageBuilder
    ?.image(source)
    .width(SHARE_IMAGE_WIDTH)
    .height(SHARE_IMAGE_HEIGHT)
    .fit("crop")
    .auto("format")
    .url();
};

/**
 * The one size every practitioner photo is shown at. CH-104.
 *
 * 4:5, because the seven source images range from 0.65 to 1.50 in ratio, from
 * tall portraits to wide landscapes, and rendering them at their natural shape
 * gave a team grid of seven different card heights.
 *
 * The crop is taken here rather than by CSS object-cover, and the difference
 * matters. object-cover crops from the centre with no say in where, which on a
 * 1.50 landscape cuts most of the frame away and can take part of a head with
 * it. Asking Sanity for the crop honours the hotspot, which is already enabled
 * on the field, so badly framed photos are fixed by dragging a box in the
 * Studio rather than by asking for a code change.
 *
 * 800x1000 is double the largest size the photo is ever painted, so it stays
 * sharp on a 2x screen. A source narrower than 800 is upscaled and will look
 * soft: that is a photograph to replace, not a value to lower.
 */
export const PRACTITIONER_PHOTO_WIDTH = 800;
export const PRACTITIONER_PHOTO_HEIGHT = 1000;

export const urlForPractitionerPhoto = (source: Image) => {
  /*
   * The builder throws rather than returning null when the object it is
   * handed carries no asset, so a `|| photo.url` fallback at the call site
   * does not catch it. A projection that selected the url but not the asset
   * reference 500'd all seven pages that way. A photo is never worth a 500.
   */
  if (!source || !(source as { asset?: unknown }).asset) return undefined;

  return imageBuilder
    ?.image(source)
    .width(PRACTITIONER_PHOTO_WIDTH)
    .height(PRACTITIONER_PHOTO_HEIGHT)
    .fit("crop")
    .auto("format")
    .url();
};

/**
 * THE STUDIO'S CROP TOOL, MADE TO WORK EVERYWHERE, WITHOUT MOVING A PIXEL
 * TODAY.
 *
 * Frank asked on 2026-10-18 to be able to crop any photograph on the site
 * himself, "without changing how any of the current photos are cropped".
 *
 * Almost every photograph on this site is a bare asset url dropped into a box
 * with `object-cover`, so the browser centre-crops it and the crop and hotspot
 * an editor drags in the Studio are thrown away. Making the Studio's choice
 * count everywhere means building the url through Sanity instead.
 *
 * **The promise is kept by doing nothing when there is nothing to do.** With no
 * crop and no hotspot stored, this returns undefined and the call site serves
 * the same bare url it served before, byte for byte. Sanity's own centre crop
 * and the browser's `object-cover` agree anyway, but "agree" is not "identical"
 * and the baseline check in scripts/audit-image-framing.js compares urls.
 *
 * So the feature is dormant until somebody opens a photograph in the Studio and
 * drags the frame, and live the moment they do.
 *
 * Takes the box it is being painted into, at twice the size so it stays sharp
 * on a 2x screen.
 */
export function hasFraming(source: unknown) {
  const image = source as
    | { asset?: unknown; crop?: unknown; hotspot?: unknown }
    | null
    | undefined;

  return Boolean(image?.asset && (image.crop || image.hotspot));
}

export function framedImageUrl(source: unknown, width: number, height: number) {
  if (!hasFraming(source)) return undefined;

  return (
    imageBuilder
      ?.image(source as Image)
      .width(Math.round(width * 2))
      .height(Math.round(height * 2))
      .fit("crop")
      .auto("format")
      .url() || undefined
  );
}

/**
 * The Studio's crop rectangle, with no box to fit it to.
 *
 * For a `fill` image, whose size comes from its container rather than from
 * props. Sanity applies the stored crop as a `rect`, so the editor's framing is
 * honoured and `object-cover` fits the result to the box, which is what it did
 * before. Returns undefined when nothing is stored, so the plain url is served
 * and nothing changes.
 */
export const croppedImageUrl = (source: unknown) => {
  if (!hasFraming(source)) return undefined;

  return (
    imageBuilder
      ?.image(source as Image)
      .auto("format")
      .url() || undefined
  );
};
