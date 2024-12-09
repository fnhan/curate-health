import { defineField, defineType } from "sanity";

import { fieldDescriptions } from "../schema-helpers";

export default defineType({
  name: "treatments",
  title: "Shared | Treatments",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required().error("A title is required"),
    }),
    defineField({
      name: "isActive",
      title: "Is Active",
      type: "boolean",
      description: "Toggle to show/hide this treatment on the website.",
      initialValue: true,
      validation: (Rule) =>
        Rule.required().error("Is Active status is required"),
    }),
    defineField({
      name: "service",
      title: "Service",
      type: "reference",
      to: { type: "service" },
      description: "The service to which this treatment belongs to",
      validation: (Rule) => Rule.required().error("The service is required"),
    }),
    defineField({
      name: "treatmentSlug",
      title: "Slug",
      type: "slug",
      description:
        "Unique identifier for the treatment, used in creating the URL. Slugs should be URL-friendly strings. It is auto-generated from the title but can be manually edited for clarity or SEO optimization.",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error("A slug is required"),
    }),
    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      validation: (Rule) => Rule.required().error("An image is required"),
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "heroAlt",
          type: "string",
          title: "Alternative Text",
          description: fieldDescriptions.altImageDescription,
          validation: (Rule) =>
            Rule.required().error("Alternative text is required"),
        },
      ],
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "object",
      validation: (Rule) => Rule.required().error("Intro section is required"),
      fields: [
        {
          name: "subtitle",
          title: "Subtitle",
          type: "string",
          validation: (Rule) => Rule.required().error("Subtitle is required"),
        },
        {
          name: "introParagraph",
          title: "Intro Paragraph",
          type: "text",
          validation: (Rule) =>
            Rule.required().error("Intro paragraph is required"),
        },
      ],
    }),
    defineField({
      name: "quoteContent",
      title: "Quote Content",
      type: "text",
      validation: (Rule) => Rule.required().error("Quote content is required"),
    }),
    defineField({
      name: "overview",
      title: "Overview Sections",
      type: "array",
      validation: (Rule) =>
        Rule.required().error("At least one overview section is required"),
      of: [
        {
          type: "object",
          fields: [
            {
              name: "title",
              title: "Title",
              type: "string",
              description: "The title of the overview section",
              validation: (Rule) =>
                Rule.required().error("Overview title is required"),
            },
            {
              name: "paragraph",
              title: "Paragraph",
              type: "text",
              description: "The paragraph of the overview section",
              validation: (Rule) =>
                Rule.required().error("Overview paragraph is required"),
            },
            {
              name: "image",
              title: "Image",
              type: "image",
              description: "The image of the overview section",
              validation: (Rule) =>
                Rule.required().error("Overview image is required"),
            },
            {
              name: "alt",
              title: "Alternative Text",
              type: "string",
              description: fieldDescriptions.altImageDescription,
              validation: (Rule) =>
                Rule.required().error("Alternative text is required"),
            },
          ],
        },
      ],
    }),
    defineField({
      name: "benefits",
      title: "Benefits Section",
      type: "object",
      validation: (Rule) =>
        Rule.required().error("Benefits section is required"),
      fields: [
        {
          name: "title",
          title: "Title",
          type: "string",
          validation: (Rule) =>
            Rule.required().error("Benefits title is required"),
        },
        {
          name: "benefitsList",
          title: "Benefits List",
          type: "array",
          validation: (Rule) =>
            Rule.required().error("At least one benefit is required"),
          of: [
            {
              type: "object",
              fields: [
                {
                  name: "title",
                  title: "Title",
                  type: "string",
                  description: "The title of the benefit",
                  validation: (Rule) =>
                    Rule.required().error("Benefit title is required"),
                },
                {
                  name: "subtitle",
                  title: "Subtitle",
                  type: "string",
                  description: "The subtitle or description of the benefit",
                  validation: (Rule) =>
                    Rule.required().error("Benefit subtitle is required"),
                },
              ],
            },
          ],
        },
      ],
    }),
    defineField({
      name: "cta",
      title: "Call to Action Section",
      type: "object",
      validation: (Rule) => Rule.required().error("CTA section is required"),
      fields: [
        {
          name: "ctaBg",
          title: "CTA Background Image",
          type: "image",
          validation: (Rule) =>
            Rule.required().error("CTA background image is required"),
        },
        {
          name: "ctaBgAlt",
          title: "CTA Background Alternative Text",
          type: "string",
          description: fieldDescriptions.altImageDescription,
          validation: (Rule) =>
            Rule.required().error(
              "CTA background alternative text is required"
            ),
        },
        {
          name: "ctaTitle",
          title: "CTA Title",
          type: "string",
          validation: (Rule) => Rule.required().error("CTA title is required"),
        },
        {
          name: "ctaText",
          title: "CTA Text",
          type: "text",
          validation: (Rule) => Rule.required().error("CTA text is required"),
        },
        {
          name: "ctaButtonText",
          title: "CTA Button Text",
          type: "string",
          validation: (Rule) =>
            Rule.required().error("CTA button text is required"),
        },
      ],
    }),
  ],

  preview: {
    select: {
      title: "title",
      service: "service.title",
      media: "heroImage",
    },
    prepare(selection) {
      const { title, media, service } = selection;
      return {
        title: title,
        subtitle: `Service: ${service}`,
        media: media,
      };
    },
  },
});
