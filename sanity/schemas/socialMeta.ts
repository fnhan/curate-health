import { defineField, defineType } from "sanity";

/**
 * SHARE IMAGES ARE A WARNING, NOT AN ERROR. FRANK, 2026-10-28.
 *
 * They were `Rule.required().error()`, and Sanity refuses Publish on an error,
 * so one empty share image locked an editor out of the whole document: not out
 * of that field, out of fixing a typo three fields away. He hit it on six
 * documents.
 *
 * The first answer was to fill all six with whatever the page was already
 * rendering. That worked and it was the wrong fix, because the pages reaching
 * the fallback are the ones whose card is DERIVED: /blog follows the newest
 * post, /about and /products follow their own hero, a post follows its own
 * photograph. Writing the current value into the field freezes it, and the
 * card then stops following the thing it was meant to follow. /blog is the
 * clearest case and the one Frank named: "use the newest post and not have it
 * fixed on the chard photo. Just simply make it so that studio doesn't require
 * the field to be a requirement to publish."
 *
 * So empty is a legitimate, documented state here. `buildPageMetadata` takes a
 * photograph the page already shows, which is the every-page rule in CLAUDE.md:
 * default the image so nobody has to remember to pick one and it cannot drift
 * from the page. A warning still shows in the Studio, so an editor who wants to
 * choose a picture is told they can, and Publish is no longer blocked.
 *
 * ALT IS STILL AN ERROR, BUT ONLY ONCE THERE IS A PICTURE TO DESCRIBE.
 *
 * A required alt on an empty image would reintroduce the block through the back
 * door. It is a custom rule rather than `Rule.required()` for that reason: no
 * asset, nothing to describe, no error; an asset with no alt is still refused,
 * because a share image with no alt text has no description anywhere.
 */
function altRequiredWhenImageChosen(Rule: any) {
  return Rule.custom((alt: string | undefined, context: any) => {
    if (!context?.parent?.asset) return true;
    return alt && alt.trim()
      ? true
      : "Alt text is required once an image is chosen.";
  });
}

export default defineType({
  name: "socialMeta",
  title: "Social Media Meta",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description:
        "The title of the page, used for social media meta tags Can be the same as the page title",
      validation: (Rule) =>
        Rule.required().error("A title is required for social media meta."),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      description:
        "The description of the page, used for social media meta tags Can be the same as the page description",
      validation: (Rule) =>
        Rule.required().error(
          "A description is required for social media meta."
        ),
    }),
    defineField({
      name: "ogImage",
      title: "Open Graph Image",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
          validation: altRequiredWhenImageChosen,
        }),
      ],
      description:
        "Optional. Left empty, the page shares a photograph it already shows. Minimum size: 200x200px, ideal ratio: 1.91:1, max size: 8MB",
      validation: (Rule) =>
        Rule.warning(
          "No image chosen, so this page will share a photograph it already shows."
        ),
    }),
    defineField({
      name: "twitterImage",
      title: "Twitter Image",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
          validation: altRequiredWhenImageChosen,
        }),
      ],
      description:
        "Optional. Left empty, X is shown the Open Graph image above. Minimum size: 144x144px (300x157px with large card), ideal ratio: 1:1 (2:1 with large card), max size: 5MB",
      validation: (Rule) =>
        Rule.warning("No image chosen, so X will use the Open Graph image."),
    }),
  ],
});
