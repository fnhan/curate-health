import { defineField, defineType } from "sanity";

export default defineType({
  name: "sustainabilitySection",
  title: "Home | Sustainability",
  type: "document",
  fields: [
    defineField({
      name: "meta",
      type: "object",
      fields: [
        {
          title: "Title",
          name: "title",
          type: "string",
        },
        {
          title: "Description",
          name: "description",
          type: "string",
        },
      ],
    }),
    defineField({
      name: "bgImage",
      title: "Background image",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          title: "Alternative Text",
          type: "string",
          description:
            "Describes the appearance and function of the image. Important for SEO and accessibility. Should be concise and informative.",
        },
      ],
    }),
    defineField({
      name: "sustainText",
      title: "Sustainability Text",
      type: "blockContent",
      description: "The main text displayed for Sustainability",
    }),
  ],

  preview: {
    select: {
      bgImage: "bgImage",
      sustainText: "sustainText.0.children.0.text",
    },
    prepare(selection) {
      const { bgImage } = selection;
      return {
        title: "Sustainabiliy Section",
        media: bgImage,
      };
    },
  },
});
