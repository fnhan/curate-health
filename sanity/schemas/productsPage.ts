import { defineField, defineType } from "sanity";

/**
 * The products index page. CH-010.
 *
 * Added after the page itself, because /products shipped with its title,
 * description and intro written into app/products/page.tsx. That made it the
 * only page on the site whose copy needed a deploy to change, which is not a
 * state to leave a page in.
 *
 * The route still carries fallbacks for every field here, so the page renders
 * whether or not this document exists or is filled in. Sanity is the source
 * when it has something to say; the code is what stops a half-filled document
 * publishing a blank heading.
 *
 * There is no pageActive toggle, deliberately. This page is the hub the main
 * navigation points at, so switching it off would orphan all five product
 * pages again, which is the exact defect CH-010 existed to fix.
 */
export default defineType({
  name: "productsPage",
  title: "Products | Products Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Page Heading",
      type: "string",
      description:
        "The h1 at the top of /products. Not the browser tab title, which is under SEO below.",
      validation: (Rule) => Rule.required().error("Page Heading is required"),
    }),
    defineField({
      name: "intro",
      title: "Intro Paragraph",
      type: "text",
      rows: 3,
      description:
        "One short paragraph under the heading. Say what these are and who fits them, rather than describing the list underneath.",
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
    },
    prepare: ({ title }) => ({
      title: title || "Products Page",
      subtitle: "/products",
    }),
  },
});
