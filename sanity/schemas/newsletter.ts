import { defineField, defineType } from "sanity";

export default defineType({
  name: "newsletterSection",
  title: "Settings | Newsletter",
  type: "document",
  fields: [
    defineField({
      name: "endpointUrl",
      title: "Endpoint URL",
      type: "string",
      description:
        "Enter the URL of your Systeme.io API endpoint. You can find this in your Systeme.io dashboard.",
    }),
  ],

  preview: {
    prepare() {
      return {
        title: "Newsletter Settings",
      };
    },
  },
});
