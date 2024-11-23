import { defineField, defineType } from "sanity";

export default defineType({
  name: "feedbackLink",
  title: "Feedback Link",
  type: "document",
  fields: [
    defineField({
      name: "linkText",
      title: "Link Text",
      type: "string",
      description: "Text that will appear on the feedback link",
    }),
    defineField({
      name: "youformId",
      title: "Youform Id",
      type: "string",
      description: "Alphanumeric code linked to the Youform survey",
    }),
  ],
  preview: {
    select: {
      title: "linkText",
    },
    prepare(selection) {
      const { title } = selection;
      return {
        title: title || "Feedback Survey", // Defaults to 'Feedback Survey' if linkText is empty
      };
    },
  },
});
