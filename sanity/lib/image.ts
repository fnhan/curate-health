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
 * The photograph slot in AlternatingSections, which paints 704x556.
 *
 * ADDED SO A CROP SET IN THE STUDIO ACTUALLY DOES SOMETHING
 *
 * That component took a bare url out of the query, so the crop and hotspot an
 * editor dragged in the Studio were never read: the browser centre-cropped
 * whatever was uploaded. Frank asked on 2026-10-18 for the cafe photographs to
 * be left whole so he could crop them himself, which would have been a silent
 * no-op without this.
 *
 * Twice the slot, so it stays sharp on a 2x screen. A portrait source is
 * cropped to the frame by Sanity rather than by the browser, which is the whole
 * point: the Studio's crop decides which part.
 */
export const SECTION_IMAGE_WIDTH = 1408;
export const SECTION_IMAGE_HEIGHT = 1112;

export const urlForSectionImage = (source: Image) => {
  // The builder throws rather than returning null on an object with no asset,
  // so this guards before calling it. Same trap as the practitioner photos.
  if (!source || !(source as { asset?: unknown }).asset) return undefined;

  return imageBuilder
    ?.image(source)
    .width(SECTION_IMAGE_WIDTH)
    .height(SECTION_IMAGE_HEIGHT)
    .fit("crop")
    .auto("format")
    .url();
};
