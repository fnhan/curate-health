import { defineField, defineType } from "sanity";

import { fieldDescriptions } from "../schema-helpers";

export default defineType({
  name: "post",
  title: "Blog | Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required().error("A title is required"),
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "date",
      description: "The date the post was published.",
    }),
    defineField({
      name: "published",
      title: "Published",
      type: "boolean",
      description: "Whether the post is published or not.",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description:
        "Unique identifier for the post, used in creating the URL. Slugs should be URL-friendly strings. It is auto-generated from the title but can be manually edited for clarity or SEO optimization.",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error("A slug is required"),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: { type: "author" },
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      description: "A short summary or preview of the post",
      validation: (Rule) => Rule.required().error("An excerpt is required"),
    }),
    defineField({
      name: "mainImage",
      title: "Main image",
      type: "image",
      description: "Used for the blog card preview",
      validation: (Rule) => Rule.required().error("An image is required"),
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative Text",
          description: fieldDescriptions.altImageDescription,
        },
      ],
    }),
    defineField({
      name: "sections",
      title: "Sections",
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
    select: {
      title: "title",
      author: "author.name",
      media: "mainImage",
    },
    prepare(selection) {
      const { author } = selection;
      return { ...selection, subtitle: author && `by ${author}` };
    },
  },
});
