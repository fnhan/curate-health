import { defineField, defineType } from "sanity";

export default defineType({
  name: "productsSection",
  title: "Home | Products Section",
  type: "document",
  fields: [
    defineField({
      name: "sectionTitle",
      title: "Section Title",
      type: "string",
      validation: (Rule) =>
        Rule.required().error("A section title is required"),
    }),
  ],

  preview: {
    select: {
      title: "sectionTitle",
    },
    prepare(selection) {
      const { title } = selection;
      return {
        title: title,
      };
    },
  },
});
