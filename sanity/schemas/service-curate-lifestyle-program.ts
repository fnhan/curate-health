import { defineField, defineType } from "sanity";

import { fieldDescriptions } from "../schema-helpers";

export default defineType({
  name: "serviceLifestyleProgram",
  title: "Curate Lifestyle Program",
  type: "document",
  fields: [
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
      name: "slug",
      title: "Slug",
      type: "slug",
      description:
        "Unique identifier for the lifestyle program, used in creating the URL. Slugs should be URL-friendly strings. It is auto-generated from the title but can be manually edited for clarity or SEO optimization.",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error("A slug is required"),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required().error("A title is required"),
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
      name: "additionalCheckinTitle",
      title: "Additional Checkin Title",
      type: "string",
    }),


    defineField({
      name: "additionalCheckin",
      title: "Additional Checkins",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "checkinDescription",
              title: "Checkin Description",
              type: "string",
            }),
            defineField({
              name: "checkinCount",
              title: "Checkin Count",
              type: "number",
            }),
          ]
        },
      ],
    }),

    defineField({
      name: "groupSectionTitle",
      title: "Group Section Title",
      type: "string",
    }),

    defineField({
      name: "groupSectionDescription",
      title: "Group Section Description",
      type: "text",
    }),

    defineField({
      name: "groupSections",
      title: "Group Sections",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "description",
              title: "Description",
              type: "blockContent",
            }),
            defineField({
              name: "image",
              title: "Image",
              type: "image",
            }),
          ],
        }
      ],
    }),

    defineField({
      name: "assistanceSectionTitle",
      title: "Assistance Section Title",
      type: "string",
    }),

    defineField({
      name: "assistanceSectionDescription",
      title: "Assistance Section Description",
      type: "text",
    }),

    defineField({
      name: "assistanceSectionImage",
      title: "Assistance Section Image",
      type: "image",
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
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
  ],

  preview: {
    select: {
      title: "title",
      service: "service.title",
      media: "heroImage",
    },
    prepare(selection) {
      const { title, media } = selection;
      return {
        title: title,
        subtitle: `Curate Lifestyle Program`,
        media: media,
      };
    },
  },
});
