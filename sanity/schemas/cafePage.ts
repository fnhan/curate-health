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
      name: "introSection",
      title: "Intro (below hero)",
      type: "object",
      description:
        "Centered introduction shown directly under the hero image (white background).",
      fields: [
        defineField({
          name: "title",
          title: "Title",
          type: "string",
          description: 'e.g. "Introducing Curate Cafe"',
        }),
        defineField({
          name: "subheading",
          title: "Subheading",
          type: "string",
          description: "Short line under the divider",
        }),
        defineField({
          name: "description",
          title: "Description",
          type: "text",
          rows: 4,
          description: "Supporting paragraph",
        }),
      ],
    }),
    defineField({
      name: "quoteSection",
      title: "Quote section (below intro)",
      type: "object",
      description:
        "Optional decorative image and quote text, centered on a light background below the intro.",
      fields: [
        defineField({
          name: "quoteImage",
          title: "Quote Image",
          type: "object",
          fields: [
            defineField({
              name: "image",
              title: "Image",
              type: "image",
            }),
            defineField({
              name: "alt",
              title: "Alternative Text",
              type: "string",
              description: fieldDescriptions.altImageDescription,
            }),
          ],
        }),
        defineField({
          name: "quoteText",
          title: "Quote text",
          type: "text",
          rows: 4,
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
      name: "menuDownloadSection",
      title: "Menu download (below alternating sections)",
      type: "object",
      description:
        "Optional PDF for guests to download. The section appears on the site only when a file is uploaded.",
      fields: [
        defineField({
          name: "headline",
          title: "Headline",
          type: "string",
          description: 'e.g. "Seasonal café menu"',
        }),
        defineField({
          name: "description",
          title: "Description",
          type: "text",
          rows: 3,
          description: "Short supporting line under the headline.",
        }),
        defineField({
          name: "buttonLabel",
          title: "Button label",
          type: "string",
          description: 'e.g. "Download PDF menu"',
        }),
        defineField({
          name: "featureImage",
          title: "Feature image",
          type: "object",
          description:
            "Shown beside the download card on large screens; on mobile it appears above the card.",
          fields: [
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
            }),
            defineField({
              name: "alt",
              title: "Alternative text",
              type: "string",
              description: fieldDescriptions.altImageDescription,
            }),
          ],
        }),
        defineField({
          name: "menuPdf",
          title: "Menu PDF",
          type: "file",
          description: "Upload the current café menu as a PDF.",
          options: {
            accept: "application/pdf",
          },
        }),
      ],
    }),
    defineField({
      name: "ctaBandSection",
      title: "CTA band (below alternating sections)",
      type: "object",
      description:
        "Full-width background image with a centered primary-colored content box and white text.",
      fields: [
        defineField({
          name: "backgroundImage",
          title: "Background image",
          type: "object",
          fields: [
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
            }),
            defineField({
              name: "alt",
              title: "Alternative text",
              type: "string",
              description: fieldDescriptions.altImageDescription,
            }),
          ],
        }),
        defineField({
          name: "headline",
          title: "Headline",
          type: "string",
          description: "Main question or title inside the box",
        }),
        defineField({
          name: "body",
          title: "Body",
          type: "text",
          rows: 5,
          description: "Supporting paragraph",
        }),
        defineField({
          name: "closingLine",
          title: "Closing line",
          type: "string",
          description: "Short line below the body (shown in italics), e.g. Visit us today!",
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
        title: "Cafe Page",
      };
    },
  },
});
