import { defineField, defineType } from "sanity";

import { fieldDescriptions } from "../schema-helpers";

/**
 * About | Our B Corp Certification. CH-119.
 *
 * WHY THIS DOES NOT WALK THE FIVE IMPACT AREAS
 *
 * /about/sustainability already does, one section each: Governance, Workers,
 * Customers, Community, Environment. So this page answers what that one does
 * not: what the certification is, who checks it, what Curate scored, and what
 * any of that changes for somebody reading it. The two link to each other
 * rather than holding two copies of one explanation, which is the CH-025
 * lesson applied to copy.
 *
 * THE SCORE IS DATA, NOT PROSE
 *
 * The numbers live in their own object rather than inside a paragraph, for the
 * same reason the hours do in CH-008: the page prints them and the
 * Certification node in the markup publishes them, and two copies of a number
 * eventually disagree. Recertification is every three years, so these are
 * changed by hand in the Studio and nothing in code has to move.
 */
export default defineType({
  name: "bcorpPage",
  title: "About | B Corp Page",
  type: "document",
  fields: [
    defineField({
      name: "pageActive",
      title: "Page Active",
      type: "boolean",
      initialValue: false,
      description: fieldDescriptions.pageActiveDescription,
    }),
    defineField({
      name: "heroSection",
      title: "Hero Section",
      type: "object",
      fields: [
        defineField({
          name: "heroTitle",
          title: "Hero Title",
          type: "string",
          description:
            "The page's one H1. The page title under SEO has to agree with it.",
        }),
        defineField({
          name: "heroParagraph",
          title: "Hero Paragraph",
          type: "blockContent",
        }),
        defineField({
          name: "heroImage",
          title: "Hero Image",
          type: "object",
          fields: [
            {
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
              description:
                "Not a photograph carrying the B Corp mark. This band is much wider than it is tall, so the mark would be cropped, and B Lab does not permit that. The mark belongs in a section below, where the slot is close to its own shape.",
              validation: (Rule) =>
                Rule.required().error("An image is required"),
            },
            {
              name: "alt",
              title: "Alternative Text",
              type: "string",
              description: fieldDescriptions.altImageDescription,
              validation: (Rule) =>
                Rule.required().error("An alternative text is required"),
            },
          ],
        }),
      ],
    }),

    defineField({
      name: "score",
      title: "Our Score",
      type: "object",
      description:
        "Read off the B Lab directory profile, never from memory. The page prints these and the Certification markup publishes the same values.",
      fields: [
        defineField({ name: "heading", title: "Heading", type: "string" }),
        defineField({ name: "intro", title: "Intro", type: "text", rows: 3 }),
        defineField({
          name: "overall",
          title: "Overall B Impact Score",
          type: "number",
          validation: (Rule) => Rule.min(0).max(200),
        }),
        defineField({
          name: "threshold",
          title: "Score needed to certify",
          type: "number",
          initialValue: 80,
        }),
        defineField({
          name: "median",
          title: "Median for businesses that complete the assessment",
          type: "number",
        }),
        defineField({
          name: "certifiedSince",
          title: "Certified since",
          type: "string",
          description: "As the directory prints it, for example October 2026.",
        }),
        defineField({
          name: "directoryUrl",
          title: "Directory profile",
          type: "url",
          description:
            "Curate's own entry on B Lab's directory. This is the link that lets a reader check the number, so it is what the score block points at. The B Corp mark itself still links to bcorp.com, which B Lab requires.",
        }),
        defineField({
          name: "areas",
          title: "The five impact areas",
          type: "array",
          description:
            "All five, in the order the page should read them. They are explained on the Sustainability page, so this holds the scores rather than the explanations.",
          of: [
            {
              type: "object",
              fields: [
                { name: "name", title: "Area", type: "string" },
                { name: "value", title: "Score", type: "number" },
                {
                  name: "note",
                  title: "Note",
                  type: "string",
                  description:
                    "Optional, for anything a bare number would misrepresent.",
                },
              ],
              preview: {
                select: { title: "name", subtitle: "value" },
                prepare({ title, subtitle }) {
                  return { title, subtitle: String(subtitle ?? "") };
                },
              },
            },
          ],
          validation: (Rule) => Rule.max(5),
        }),
      ],
    }),

    defineField({
      name: "additionalSections",
      title: "Additional Sections",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "sectionTitle",
              title: "Section Title",
              type: "string",
              validation: (Rule) =>
                Rule.required().error("A section title is required"),
            }),
            defineField({
              name: "sectionParagraph",
              title: "Section Paragraph",
              type: "blockContent",
              validation: (Rule) =>
                Rule.required().error("A section paragraph is required"),
            }),
            defineField({
              name: "sectionImage",
              title: "Section Image",
              type: "object",
              fields: [
                {
                  name: "image",
                  title: "Image",
                  type: "image",
                  options: { hotspot: true },
                },
                {
                  name: "alt",
                  title: "Alternative Text",
                  type: "string",
                  description: fieldDescriptions.altImageDescription,
                },
              ],
            }),
          ],
        },
      ],
    }),

    defineField({
      name: "ctaSection",
      title: "Call to Action Section",
      type: "object",
      fields: [
        defineField({
          name: "ctaSectionImage",
          title: "CTA Section Image",
          type: "object",
          fields: [
            {
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
            },
            {
              name: "alt",
              title: "Alternative Text",
              type: "string",
              description: fieldDescriptions.altImageDescription,
            },
          ],
        }),
        defineField({
          name: "ctaSectionTitle",
          title: "CTA Title",
          type: "string",
        }),
        defineField({
          name: "ctaSectionParagraph",
          title: "CTA Paragraph",
          type: "text",
        }),
        defineField({
          name: "ctaButton",
          title: "CTA Button",
          type: "object",
          fields: [
            { name: "buttonText", title: "Button Text", type: "string" },
            { name: "buttonLink", title: "Button Link", type: "url" },
          ],
        }),
      ],
    }),

    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: {
    prepare() {
      return { title: "B Corp Certification" };
    },
  },
});
