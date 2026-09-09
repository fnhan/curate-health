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
