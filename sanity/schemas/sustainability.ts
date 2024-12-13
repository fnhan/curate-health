import { defineField, defineType } from "sanity";

import { fieldDescriptions } from "../schema-helpers";

export default defineType({
  name: "sustainability",
  title: "About | Sustainability Page",
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
          type: "blockContent",
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
      name: "ctaSection",
      title: "Call to Action Section",
      type: "object",
      fields: [
        defineField({
          name: "ctaSectionImage",
          title: "CTA Section Image",
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
        defineField({
          name: "ctaSectionTitle",
          title: "CTA Title",
          type: "string",
        }),
        defineField({
          name: "ctaSectionParagraph",
          title: "CTA Paragraph",
          type: "text",
        }),
        defineField({
          name: "ctaButton",
          title: "CTA Button",
          type: "object",
          fields: [
            {
              name: "buttonText",
              title: "Button Text",
              type: "string",
            },
            {
              name: "buttonLink",
              title: "Button Link",
              type: "url",
            },
          ],
        }),
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
        title: "Sustainability",
      };
    },
  },
});
