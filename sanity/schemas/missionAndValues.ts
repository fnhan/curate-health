import { defineField, defineType } from "sanity";

import { fieldDescriptions } from "../schema-helpers";

export default defineType({
  name: "missionAndValues",
  title: "About | Mission & Values Page",
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
      name: "financialReportsSection",
      title: "Financial Reports Section",
      type: "object",
      fields: [
        defineField({
          name: "title",
          title: "Title",
          type: "string",
          initialValue: "Financial reports",
          validation: (Rule) => Rule.required().error("A title is required"),
        }),
        defineField({
          name: "description",
          title: "Description",
          type: "text",
          rows: 3,
        }),
        defineField({
          name: "reports",
          title: "Reports",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({
                  name: "year",
                  title: "Year",
                  type: "number",
                  validation: (Rule) =>
                    Rule.required()
                      .integer()
                      .min(1900)
                      .error("A valid year is required"),
                }),
                defineField({
                  name: "label",
                  title: "Label (optional)",
                  type: "string",
                  description: "Shown in the dropdown (defaults to the year).",
                }),
                defineField({
                  name: "file",
                  title: "Report file (PDF)",
                  type: "file",
                  options: { accept: "application/pdf" },
                  validation: (Rule) => Rule.required().error("A PDF file is required"),
                }),
              ],
              preview: {
                select: { title: "year", subtitle: "label" },
                prepare({ title, subtitle }) {
                  return {
                    title: title ? String(title) : "Report",
                    subtitle: subtitle || "Financial report",
                  };
                },
              },
            },
          ],
        }),
      ],
    }),
    defineField({
      name: "feedbackSurvey",
      title: "Customer Feedback Survey",
      type: "object",
      fields: [
        defineField({
          name: "title",
          title: "Title",
          type: "string",
          initialValue: "Customer feedback survey",
          validation: (Rule) => Rule.required().error("A title is required"),
        }),
        defineField({
          name: "description",
          title: "Description",
          type: "text",
          rows: 3,
        }),
        defineField({
          name: "buttonText",
          title: "Button text",
          type: "string",
          initialValue: "Share feedback",
          validation: (Rule) => Rule.required().error("Button text is required"),
        }),
        defineField({
          name: "url",
          title: "Google Sheets / survey link",
          type: "url",
          validation: (Rule) =>
            Rule.required().uri({ allowRelative: false }).error("A valid URL is required"),
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
        title: "Mission & Values",
      };
    },
  },
});
