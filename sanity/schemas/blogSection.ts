import { defineField, defineType } from "sanity";

export default defineType({
  name: "blogSection",
  title: "Home | Blog Section",
  type: "document",
  fields: [
    defineField({
      name: "sectionTitle",
      title: "Section Title",
      type: "string",
      validation: (Rule) =>
        Rule.required().error("A section title is required"),
    }),
    defineField({
      name: "hoverLinkText",
      title: "Hover Link Text",
      type: "string",
      validation: (Rule) =>
        Rule.required().error("Hover link text is required"),
    }),
    defineField({
      name: "hoverLinkHref",
      title: "Hover Link Href",
      type: "string",
      validation: (Rule) => Rule.required().error("Hover link URL is required"),
    }),
    defineField({
      name: "seo",
      title: "SEO For The Blog Page",
      type: "seo",
      description:
        "Search and share details for the blog page at /blog. The fields above are the homepage's blog section; this one is the blog page's own. Leave the share image empty and the newest post's photo is used.",
    }),
  ],
});
