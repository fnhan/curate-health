import { defineField, defineType } from "sanity";

export default defineType({
  name: "contactPage",
  title: "Contact | Contact Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Contact Details Title",
      type: "string",
      description: "Heading text for the Contact Details section",
    }),
    defineField({
      name: "monHours",
      title: "Monday Hours",
      type: "string",
      description: "The Monday opening hours",
    }),
    defineField({
      name: "tuesHours",
      title: "Tuesday Hours",
      type: "string",
      description: "The Tuesday opening hours",
    }),
    defineField({
      name: "wedHours",
      title: "Wednesday Hours",
      type: "string",
      description: "The Wednesday opening hours",
    }),
    defineField({
      name: "thursHours",
      title: "Thursday Hours",
      type: "string",
      description: "The Thursday opening hours",
    }),
    defineField({
      name: "friHours",
      title: "Friday Hours",
      type: "string",
      description: "The Friday opening hours",
    }),
    defineField({
      name: "satHours",
      title: "Saturday Hours",
      type: "string",
      description: "The Saturday opening hours",
    }),
    defineField({
      name: "sunHours",
      title: "Sunday Hours",
      type: "string",
      description: "The Sunday opening hours",
    }),
    defineField({
      name: "cta",
      title: "Call to Action",
      type: "string",
      description: "Text for the CTA button",
    }),
    defineField({
      name: "href",
      title: "Link Href",
      type: "string",
      description: "URL/Link to Google Maps directions",
    }),
    defineField({
      name: "mapURL",
      title: "Map Embed Url",
      type: "string",
      description:
        "embed URL from Google Maps; search address and find embed url under Share option",
    }),
  ],

  preview: {
    select: {
      title: "title",
    },
  },
});
