import { defineField, defineType } from "sanity";

/**
 * The cafe menu, as text rather than a PDF. CH-108.
 *
 * The menu was a 607 KB PDF behind a download button. A PDF indexes badly, an
 * answer engine cannot excerpt it cleanly, and the functional nutrition
 * positioning that makes this cafe different, no industrial seed oils, maple
 * and honey only, Ontario-local and seasonal, was invisible to search because
 * none of it was in any page's text.
 *
 * ONE DOCUMENT, NOT ONE PER ITEM
 *
 * Thirty menu items as thirty documents would give an editor thirty things to
 * open to change a price, and would need thirty slugs for pages nobody wants.
 * The menu is one page, so it is one document with sections and items inside
 * it. The PDF stays for anybody who wants to print it.
 *
 * INGREDIENTS ARE ALLERGEN INFORMATION
 *
 * The field description says so, because that is what it is in practice. The
 * PDF under-declared a tree nut on one bar for as long as it was live: the bar
 * was sold as "Almond & Walnut" and the printed ingredients listed neither
 * walnut nor goji, and did list cacao powder, which belongs to a different
 * bar. Whoever edits this is editing safety information.
 */
export default defineType({
  name: "cafeMenu",
  title: "Cafe | Menu",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "The page's one h1.",
      validation: (Rule) => Rule.required().error("A title is required"),
    }),
    defineField({
      name: "heroImage",
      title: "Hero photograph",
      type: "image",
      options: { hotspot: true },
      description:
        "The photograph across the top. Left empty, the page uses the cafe page's own hero, so there is always one.",
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative text",
          description:
            "What the photograph shows. Describe the picture, not the page.",
        },
      ],
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "text",
      rows: 6,
      description:
        "The prose under the hero. Say what the kitchen does and what it will not use, rather than describing the list below. This is the part an answer engine quotes. Blank lines separate paragraphs.",
    }),
    defineField({
      name: "note",
      title: "Standing note",
      type: "string",
      description:
        "One line that applies to the whole menu, shown under the intro. For example the bring-your-own-mug discount.",
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      of: [
        {
          type: "object",
          name: "menuSection",
          fields: [
            defineField({
              name: "title",
              title: "Section title",
              type: "string",
              validation: (Rule) =>
                Rule.required().error("Every section needs a title"),
            }),
            defineField({
              name: "note",
              title: "Section note",
              type: "string",
              description:
                "Optional line under the section title, for something that applies to every item in it.",
            }),
            defineField({
              name: "footnote",
              title: "Section footnote",
              type: "string",
              description:
                "Optional line AFTER the items, for an add-on or an option that is not something you order on its own. The section note sits above them, beside the prices, and suits a bundle price; this sits below, where a footnote belongs.",
            }),
            defineField({
              name: "items",
              title: "Items",
              type: "array",
              of: [
                {
                  type: "object",
                  name: "menuItem",
                  fields: [
                    defineField({
                      name: "name",
                      title: "Name",
                      type: "string",
                      validation: (Rule) =>
                        Rule.required().error("Every item needs a name"),
                    }),
                    defineField({
                      name: "size",
                      title: "Size",
                      type: "string",
                      description: "As printed, for example 16oz or 35g.",
                    }),
                    defineField({
                      name: "price",
                      title: "Price",
                      type: "number",
                      description:
                        "In dollars, numbers only. 4.5 renders as $4.50.",
                    }),
                    defineField({
                      name: "ingredients",
                      title: "Ingredients",
                      type: "text",
                      rows: 3,
                      description:
                        "Comma separated, as printed. **This is allergen information.** Every nut, seed, dairy and egg in the item belongs here, and it has to match what the kitchen actually makes.",
                    }),
                  ],
                  preview: {
                    select: { title: "name", size: "size", price: "price" },
                    prepare({ title, size, price }) {
                      const bits = [size, price ? `$${price}` : null].filter(
                        Boolean
                      );
                      return {
                        title,
                        subtitle: bits.length ? bits.join("  ") : undefined,
                      };
                    },
                  },
                },
              ],
            }),
          ],
          preview: {
            select: { title: "title", items: "items" },
            prepare({ title, items }) {
              const n = (items || []).length;
              return { title, subtitle: `${n} item${n === 1 ? "" : "s"}` };
            },
          },
        },
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
  ],

  preview: {
    select: { title: "title", sections: "sections", media: "heroImage" },
    prepare({ title, sections, media }) {
      const items = (sections || []).reduce(
        (n: number, s: { items?: unknown[] }) => n + (s.items || []).length,
        0
      );
      return {
        title: title || "Cafe Menu",
        subtitle: `${(sections || []).length} sections, ${items} items`,
        media,
      };
    },
  },
});
