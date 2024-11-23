import { defineField, defineType } from "sanity";

export default defineType({
  name: "cafeSection",
  title: "Home | Cafe Section",
  type: "document",
  fields: [
    defineField({
      name: "cafeImage",
      title: "Cafe Background Image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
      fields: [
        {
          name: "alt",
          title: "Alternative Text",
          type: "string",
          description:
            "Describes the appearance and function of the image. Important for SEO and accessibility. Should be concise and informative.",
          validation: (Rule) => Rule.required(),
        },
      ],
    }),
    defineField({
      name: "title",
      title: "Cafe Title",
      type: "blockContent",
      description: "Add title for the cafe section",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "content",
      title: "Cafe Content",
      type: "blockContent",
      description: "Add content paragraphs for the cafe section",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "hoverLinkText",
      title: "Hover Link Text",
      type: "string",
      description: "Text for the hover link (Example: More About Us)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "hoverLinkHref",
      title: "Hover Link Href",
      type: "string",
      description: "URL/Link for the hover link. (Example: /about)",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "cafeImage",
    },
    prepare(selection) {
      const { media } = selection;
      return {
        title: "Cafe Section",
        media: media,
      };
    },
  },
});
