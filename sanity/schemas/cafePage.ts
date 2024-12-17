import { defineField, defineType } from "sanity";

import { fieldDescriptions } from "../schema-helpers";

export default defineType({
  name: "cafePage",
  title: "Cafe | Cafe Page",
  type: "document",
  fields: [
    defineField({
      name: "pageActive",
      title: "Page Active",
      type: "boolean",
      description: fieldDescriptions.pageActiveDescription,
    }),
    defineField({
      name: "heroSection",
      title: "Hero Section",
      type: "object",
      fields: [
        defineField({
          name: "heroImage",
          title: "Hero Image",
          type: "object",
          fields: [
            {
              name: "image",
              title: "Image",
              type: "image",
              validation: (Rule) =>
                Rule.required().error("An image is required"),
            },
            {
              name: "alt",
              title: "Alternative Text",
              type: "string",
              description: fieldDescriptions.altImageDescription,
              validation: (Rule) =>
                Rule.required().error("An alternative text is required"),
            },
          ],
        }),
      ],
    }),
    defineField({
      name: "additionalSections",
      title: "Additional Sections",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "sectionTitle",
              title: "Section Title",
              type: "string",
              validation: (Rule) =>
                Rule.required().error("A section title is required"),
            }),
            defineField({
              name: "sectionParagraph",
              title: "Section Paragraph",
              type: "blockContent",
              validation: (Rule) =>
                Rule.required().error("A section paragraph is required"),
            }),
            defineField({
              name: "sectionImage",
              title: "Section Image",
              type: "object",
              fields: [
                {
                  name: "image",
                  title: "Image",
                  type: "image",
                },
                {
                  name: "alt",
                  title: "Alternative Text",
                  type: "string",
                  description: fieldDescriptions.altImageDescription,
                },
              ],
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Cafe Page",
      };
    },
  },
});
