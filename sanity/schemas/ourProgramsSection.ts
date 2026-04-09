import { defineField, defineType } from "sanity";

import { fieldDescriptions } from "../schema-helpers";

export default defineType({
  name: "ourProgramsSection",
  title: "Home | Our Programs Section",
  type: "document",
  fields: [
    defineField({
      name: "sectionTitle",
      title: "Section Title",
      type: "string",
      validation: (Rule) =>
        Rule.required().error("A section title is required"),
    }),
    defineField({
      name: "bgImage",
      title: "Background Image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required().error("A background image is required"),
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative Text",
          description: fieldDescriptions.altImageDescription,
          validation: (Rule) =>
            Rule.required().error("Alternative text is required"),
        },
      ],
    }),
    defineField({
      name: "programs",
      title: "Programs",
      type: "array",
      validation: (Rule) => Rule.required().min(1),
      of: [
        {
          type: "object",
          fields: [
            {
              name: "name",
              title: "Program Name",
              type: "string",
              validation: (Rule) =>
                Rule.required().error("Program name is required"),
            },
            {
              name: "href",
              title: "Link URL",
              type: "string",
              description: "The URL this program links to (e.g. /our-programs#essential-series)",
              validation: (Rule) =>
                Rule.required().error("Link URL is required"),
            },
            {
              name: "barColor",
              title: "Bar Color",
              type: "string",
              description: "Hex color for the decorative vertical bar (e.g. #888D76)",
              validation: (Rule) =>
                Rule.required().error("Bar color is required"),
            },
            {
              name: "isLink",
              title: "Is Clickable Link",
              type: "boolean",
              description: "Whether this program entry is a clickable link or just display text",
              initialValue: true,
            },
          ],
          preview: {
            select: { title: "name" },
          },
        },
      ],
    }),
    defineField({
      name: "hoverLinkText",
      title: "Hover Link Text",
      type: "string",
      description: "Text for the bottom hover bar (e.g. About Our Programs)",
      validation: (Rule) =>
        Rule.required().error("Hover link text is required"),
    }),
    defineField({
      name: "hoverLinkHref",
      title: "Hover Link URL",
      type: "string",
      description: "URL for the bottom hover bar (e.g. /our-programs)",
      validation: (Rule) =>
        Rule.required().error("Hover link URL is required"),
    }),
  ],
  preview: {
    select: {
      title: "sectionTitle",
      media: "bgImage",
    },
    prepare({ title, media }) {
      return {
        title: title ?? "Our Programs Section",
        media,
      };
    },
  },
});
