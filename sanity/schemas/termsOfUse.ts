import { defineField, defineType } from "sanity";

export default defineType({
  name: "termOfUse",
  title: "Term of Use",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required().error("A title is required"),
    }),
    defineField({
      name: "content",
      title: "content",
      type: "blockContent",
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
  },
});
