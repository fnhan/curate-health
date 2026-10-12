import { defineField, defineType } from "sanity";

export default defineType({
  name: "servicesHeroSection",
  title: "Services | Services Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required().error("A title is required"),
    }),
    defineField({
      name: "image",
      title: "image",
      type: "image",
      validation: (Rule) => Rule.required().error("An image is required"),
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
      name: "subtitle",
      title: "Subtitle",
      type: "string",
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "text",
      rows: 12,
      description:
        "The prose between the menu and the grid of services. Say what the practice is and what each of the three areas covers, by name, rather than describing the grid underneath. This is the text an AI answer engine reads off this page. Blank lines separate paragraphs.",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
  ],

  preview: {
    select: {
      title: "title",
      isActive: "isActive",
      media: "image",
    },
    prepare(selection) {
      const { title, isActive, media } = selection;
      return {
        title: title,
        subtitle: `Status: ${isActive ? "Active" : "Inactive"}`,
        media: media,
      };
    },
  },
});
