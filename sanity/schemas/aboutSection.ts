import { defineField, defineType } from "sanity";

export default defineType({
  name: "aboutSection",
  title: "Home | About Section",
  type: "document",
  fields: [
    defineField({
      name: "aboutImage",
      title: "About Image",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative Text",
          description:
            "Describes the appearance and function of the image. Important for SEO and accessibility. Should be concise and informative.",
        },
      ],
    }),
    defineField({
      name: "title1",
      title: "First Title",
      type: "string",
      description: "The first title displayed in the About section",
    }),
    defineField({
      name: "title2",
      title: "Second Title",
      type: "string",
      description: "The second title displayed in the About section",
    }),
    defineField({
      name: "hoverLinkText",
      title: "Hover Link Text",
      type: "string",
      description: "Text for the hover link (Example: More About Us)",
    }),
    defineField({
      name: "hoverLinkHref",
      title: "Hover Link Href",
      type: "string",
      description: "URL/Link for the hover link. (Example: /about)",
    }),
  ],

  preview: {
    select: {
      title1: "title1",
      title2: "title2",
      aboutImage: "aboutImage",
    },
    prepare(selection) {
      const { aboutImage } = selection;
      return {
        title: "About Section",
        media: aboutImage,
      };
    },
  },
});
