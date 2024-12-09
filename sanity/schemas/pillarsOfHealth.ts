import { defineField, defineType } from "sanity";

import { fieldDescriptions } from "../schema-helpers";

export default defineType({
  name: "pillarsOfHealth",
  title: "About | Pillars of Health Page",
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
          name: "heroTitle",
          title: "Hero Title",
          type: "string",
        }),
        defineField({
          name: "heroParagraph",
          title: "Hero Paragraph",
          type: "text",
        }),
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
      name: "pillars",
      title: "Pillars",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "pillarName",
              title: "Pillar Name",
              type: "string",
              validation: (Rule) =>
                Rule.required().error("A pillar name is required"),
            }),
            defineField({
              name: "pillarDescription",
              title: "Pillar Description",
              type: "text",
              validation: (Rule) =>
                Rule.required().error("A pillar description is required"),
            }),
          ],
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Pillars of Health",
      };
    },
  },
});
