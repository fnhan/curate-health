import { defineField, defineType } from "sanity";

export default defineType({
  name: "heroSection",
  title: "Home | Hero Section",
  type: "document",
  fields: [
    defineField({
      name: "videoFile",
      title: "Video File",
      type: "mux.video",
    }),
    defineField({
      name: "heroText",
      title: "Hero Text",
      type: "blockContent",
      description: "The main text displayed in the Hero section",
    }),
  ],

  preview: {
    select: {
      heroText: "heroText.0.children.0.text",
    },
    prepare(selection) {
      return {
        title: "Hero Section",
      };
    },
  },
});
