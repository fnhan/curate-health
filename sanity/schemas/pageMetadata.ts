import { defineField, defineType } from "sanity";

export default defineType({
  name: "pageMetadata",
  title: "Page Metadata",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 200,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "socialMeta",
      title: "Social Media Meta",
      type: "socialMeta",
    }),
  ],
  preview: {
    select: {
      title: "title",
      slug: "slug",
    },
    prepare(selection) {
      const { title, slug } = selection;
      return {
        title: title,
        subtitle: slug.current,
      };
    },
  },
});
