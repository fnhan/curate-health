import { defineField, defineType } from "sanity";

/**
 * The about hub at /about. CH-009 groundwork.
 *
 * NAMED aboutIndexPage BECAUSE aboutPage IS TAKEN
 *
 * The dataset already holds five documents of type `aboutPage`, one per page
 * under /about, read by ABOUT_PAGES_QUERY. There are five more of type
 * `aboutPages`, the same five again, read by the footer and by search. Neither
 * name was free, and a first version of this file claimed `aboutPage`, which
 * would have attached this schema to those five and shown them in the Studio as
 * five malformed hub pages.
 *
 * Do not rename this to `aboutPage` for tidiness. Check what the dataset holds
 * before assuming a type name is unused: the collision was invisible until a
 * createIfNotExists came back reporting an existing document called
 * "Sustainability".
 *
 * /about returned 404 while five pages lived under it, so the breadcrumb on
 * every one of them had nowhere to point and the five had no parent at all.
 *
 * Worth knowing what this page is for, because it changes how it should be
 * written. Its value is not search traffic: "about Curate Health" is brand
 * qualified and anyone typing it already finds the site. Its value is that
 * Google's quality guidelines look for who is responsible for a site when
 * judging whether to trust it, and they apply that hardest to health, where
 * the stakes are highest. A hub that is five links in a grid earns none of
 * that. One that says who runs the practice earns most of it.
 *
 * So the intro field is not decoration, it is the reason the page exists.
 */
export default defineType({
  name: "aboutIndexPage",
  title: "About | About Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Page Heading",
      type: "string",
      description:
        "The h1 at the top of /about. Not the browser tab title, which is under SEO below.",
      validation: (Rule) => Rule.required().error("Page Heading is required"),
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "text",
      rows: 6,
      description:
        "Who runs the practice and what it is. This is the part search engines read as a trust signal on a health site, so say something concrete rather than describing the links below. Blank lines separate paragraphs.",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
  ],

  preview: {
    select: { title: "title" },
    prepare: ({ title }) => ({
      title: title || "About Page",
      subtitle: "/about",
    }),
  },
});
