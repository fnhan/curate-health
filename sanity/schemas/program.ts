import { defineField, defineType } from "sanity";

/**
 * A program, as its own document.
 *
 * Four documents currently touch programs: "Services | Curate Lifestyle",
 * "Curate Lifestyle Program", "Our Programs" and "Home | Our Programs Section".
 * With no single source of truth, Curate Lifestyle ends up rendering as both a
 * service and a program. One document per program is what fixes that.
 *
 * Programs are not services. They are structured, multi-session and
 * enrolment-based, and they live under /our-programs rather than /services.
 *
 * The four existing documents stay in place until the pages that read them are
 * rewired. Retiring them is a later step, and doing it early would take the
 * live programs content down.
 */
export default defineType({
  name: "program",
  title: "Shared | Programs",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required().error("A title is required"),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description:
        "Used to build the page address, /our-programs/{slug}. Generated from the title, but editable.",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error("A slug is required"),
    }),
    defineField({
      name: "isActive",
      title: "Is Active",
      type: "boolean",
      description:
        "Untick to remove this program from the hub and the homepage without deleting it.",
      initialValue: true,
      validation: (Rule) =>
        Rule.required().error("Is Active status is required"),
    }),
    // No display order field, same reasoning as practitioner. Order will come
    // from a draggable reference list on the programs hub once that document is
    // rewired. Its existing `programs` field holds embedded objects and is
    // still what the live hub renders, so the reference list is added there in
    // the step that migrates it, not here.
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
      description:
        "One or two sentences, used on the hub and the homepage where the program is listed rather than described in full.",
    }),
    defineField({
      name: "approach",
      title: "Approach",
      type: "text",
      rows: 3,
      description: "How the program works. Feeds the comparison table.",
    }),
    defineField({
      name: "focus",
      title: "Focus",
      type: "text",
      rows: 3,
      description:
        "What the program concentrates on. Feeds the comparison table.",
    }),
    defineField({
      name: "whoItIsFor",
      title: "Who It Is For",
      type: "text",
      rows: 3,
      description: "Who should consider it. Feeds the comparison table.",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "blockContent",
      description: "The main content of the program's own page.",
    }),
    defineField({
      name: "faq",
      title: "FAQ",
      type: "array",
      description:
        "Questions the front desk actually receives about this program. Page content only: do not mark these up as FAQPage. Google retired that rich result on 2026-05-07 and it produces nothing. See CH-101.",
      of: [
        defineField({
          name: "entry",
          title: "Question and Answer",
          type: "object",
          fields: [
            defineField({
              name: "question",
              title: "Question",
              type: "string",
              validation: (Rule) =>
                Rule.required().error("A question is required"),
            }),
            defineField({
              name: "answer",
              title: "Answer",
              type: "text",
              rows: 4,
              validation: (Rule) =>
                Rule.required().error("An answer is required"),
            }),
          ],
          preview: {
            select: { title: "question", subtitle: "answer" },
          },
        }),
      ],
    }),
    defineField({
      name: "practitioners",
      title: "Practitioners",
      type: "array",
      description:
        "Who delivers this program. Referenced, not copied, so a credential change updates every page at once.",
      of: [{ type: "reference", to: [{ type: "practitioner" }] }],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
  ],
  orderings: [
    {
      title: "Title",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "summary",
      isActive: "isActive",
    },
    prepare({ title, subtitle, isActive }) {
      return {
        title: isActive === false ? `${title} (hidden)` : title,
        subtitle,
      };
    },
  },
});
