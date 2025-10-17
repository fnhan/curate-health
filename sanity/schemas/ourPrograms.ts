import { defineField, defineType } from "sanity";

import { fieldDescriptions } from "../schema-helpers";

export default defineType({
  name: "ourPrograms",
  title: "Our Programs",
  type: "document",
  fields: [
    defineField({
      name: "isActive",
      title: "Is Active",
      type: "boolean",
      description: "Toggle to show/hide this page on the website.",
      initialValue: true,
      validation: (Rule) =>
        Rule.required().error("Is Active status is required"),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required().error("A title is required"),
    }),

    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      validation: (Rule) => Rule.required().error("An image is required"),
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "heroAlt",
          type: "string",
          title: "Alternative Text",
          description: fieldDescriptions.altImageDescription,
          validation: (Rule) =>
            Rule.required().error("Alternative text is required"),
        },
      ],
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "object",
      validation: (Rule) => Rule.required().error("Intro section is required"),
      fields: [
        {
          name: "subtitle",
          title: "Subtitle",
          type: "text",
          validation: (Rule) => Rule.required().error("Subtitle is required"),
        },
        {
          name: "introParagraph",
          title: "Intro Paragraph",
          type: "text",
          validation: (Rule) =>
            Rule.required().error("Intro paragraph is required"),
        },
      ],
    }),
    defineField({
      name: "programs",
      title: "Programs",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "programName",
              type: "string",
              title: "Program Name",
              validation: (Rule) =>
                Rule.required().error("Program name is required"),
            },
            {
              name: "description",
              type: "text",
              title: "Description",
              validation: (Rule) =>
                Rule.required().error("A description is required"),
            },
            {
              name: "image",
              type: "image",
              title: "Image",
              validation: (Rule) => Rule.required().error("Image is required"),
              fields: [
                {
                  name: "alt",
                  type: "string",
                  title: "Alternative Text",
                  description: fieldDescriptions.altImageDescription,
                  validation: (Rule) =>
                    Rule.required().error("Alternative text is required"),
                },
              ],
            },
          ],
        },
      ],
    }),
    defineField({
      name: "essentialSeries",
      title: "Essential Series",
      type: "object",
      validation: (Rule) =>
        Rule.required().error("Essential Series is required"),
      fields: [
        {
          name: "description",
          title: "Description",
          type: "text",
          validation: (Rule) =>
            Rule.required().error("Description is required"),
        },
        {
          name: "image",
          type: "image",
          title: "Image",
          validation: (Rule) => Rule.required().error("Image is required"),
          fields: [
            {
              name: "alt",
              type: "string",
              title: "Alternative Text",
              description: fieldDescriptions.altImageDescription,
            },
          ],
        },
        {
          name: "tableContent",
          title: "Table Content",
          type: "object",
          fields: [
            {
              name: "includesSessions",
              title: "Included Sessions",
              type: "array",
              validation: (Rule) => Rule.required().min(3).max(3),
              of: [
                {
                  name: "sessions",
                  title: "Sessions",
                  type: "number",
                },
              ],
            },
            {
              name: "bonusSessions",
              title: "Bonus Sessions",
              type: "array",
              validation: (Rule) => Rule.required().min(3).max(3),
              of: [
                {
                  name: "sessions",
                  title: "Sessions",
                  type: "number",
                },
              ],
            },
            {
              name: "bonusTransferable",
              title: "Bonus Transferable",
              type: "array",
              validation: (Rule) => Rule.required().min(3).max(3),
              of: [
                {
                  name: "check",
                  title: "Check",
                  type: "boolean",
                },
              ],
            },
          ],
        },
        {
          name: "listContent",
          title: "List Content",
          type: "array",
          of: [
            {
              name: "listItem",
              type: "string",
              title: "List Item",
              validation: (Rule) =>
                Rule.required().error("List Item is required"),
            },
          ],
        },
      ],
    }),
    defineField({
      name: "curateLifestyle",
      title: "Curate Lifestyle",
      type: "object",
      validation: (Rule) =>
        Rule.required().error("Curate Lifestyle is required"),
      fields: [
        {
          name: "description",
          title: "Description",
          type: "text",
          validation: (Rule) =>
            Rule.required().error("Description is required"),
        },
        {
          name: "image",
          type: "image",
          title: "Image",
          validation: (Rule) => Rule.required().error("Image is required"),
          fields: [
            {
              name: "alt",
              type: "string",
              title: "Alternative Text",
              description: fieldDescriptions.altImageDescription,
            },
          ],
        },
        {
          name: "structure",
          title: "Structure",
          type: "object",
          fields: [
            {
              name: "length",
              title: "Length",
              type: "string",
              validation: (Rule) => Rule.required().error("Length is required"),
            },
            {
              name: "format",
              title: "Format",
              type: "text",
              validation: (Rule) => Rule.required().error("Format is required"),
            },
            {
              name: "focus",
              title: "Focus",
              type: "string",
              validation: (Rule) => Rule.required().error("Focus is required"),
            },
            {
              name: "bonus",
              title: "Bonus",
              type: "array",
              of: [
                {
                  name: "listItem",
                  type: "string",
                  title: "List Item",
                  validation: (Rule) =>
                    Rule.required().error("List Item is required"),
                },
              ],
            },
            {
              name: "entry",
              title: "Entry",
              type: "string",
              validation: (Rule) => Rule.required().error("Entry is required"),
            },
          ],
        },
        {
          name: "outcome",
          title: "Outcome",
          type: "text",
          validation: (Rule) => Rule.required().error("Outcome is required"),
        },
        defineField({
          name: "referral_form_pdf",
          title: "Referral Form PDF",
          type: "file",
          validation: (Rule) => Rule.required().error("A PDF is required"),
          options: {
            accept: "application/pdf",
          },
        }),
        defineField({
          name: "call_to_action",
          title: "Call To Action Text",
          type: "string",
          validation: (rule) =>
            rule.required().error("The call to action text is required"),
        }),
      ],
    }),
    defineField({
      name: "masterHealthBlueprint",
      title: "Master Health Blueprint",
      type: "object",
      validation: (Rule) =>
        Rule.required().error("Master Health Blueprint is required"),
      fields: [
        {
          name: "description",
          title: "Description",
          type: "text",
          validation: (Rule) =>
            Rule.required().error("Description is required"),
        },
        {
          name: "image",
          type: "image",
          title: "Image",
          validation: (Rule) => Rule.required().error("Image is required"),
          fields: [
            {
              name: "alt",
              type: "string",
              title: "Alternative Text",
              description: fieldDescriptions.altImageDescription,
            },
          ],
        },
        {
          name: "structure",
          title: "Structure",
          type: "object",
          fields: [
            {
              name: "kickOff",
              title: "Kick-Off",
              type: "string",
              validation: (Rule) =>
                Rule.required().error("Kick-Off is required"),
            },
            {
              name: "team",
              title: "Team",
              type: "string",
              validation: (Rule) => Rule.required().error("Team is required"),
            },
            {
              name: "plan",
              title: "Plan",
              type: "string",
              validation: (Rule) => Rule.required().error("Plan is required"),
            },
            {
              name: "programIncludes",
              title: "Includes",
              type: "array",
              of: [
                {
                  name: "listItem",
                  type: "string",
                  title: "List Item",
                  validation: (Rule) =>
                    Rule.required().error("List Item is required"),
                },
              ],
            },
            {
              name: "privileges",
              title: "Privileges",
              type: "array",
              of: [
                {
                  name: "listItem",
                  type: "string",
                  title: "List Item",
                  validation: (Rule) =>
                    Rule.required().error("List Item is required"),
                },
              ],
            },
          ],
        },
        {
          name: "outcome",
          title: "Outcome",
          type: "text",
          validation: (Rule) => Rule.required().error("Outcome is required"),
        },
      ],
    }),
    defineField({
      name: "exploreYourOptions",
      title: "Explore Your Options",
      type: "object",
      fields: [
        {
          name: "image",
          type: "image",
          title: "Background Image",
        },
        {
          name: "contactMessage",
          title: "Contact Message",
          type: "text",
          validation: (Rule) =>
            Rule.required().error("Contact Message is required"),
        },
      ],
    }),
    defineField({
      name: "faq",
      title: "FAQ",
      type: "array",
      of: [
        {
          name: "question",
          title: "Question",
          type: "object",
          fields: [
            {
              name: "title",
              title: "Title",
              type: "string",
              validation: (Rule) =>
                Rule.required().error("A title is required"),
            },
            {
              name: "description",
              title: "Description",
              type: "blockContent",
              validation: (Rule) =>
                Rule.required().error("A description is required"),
            },
          ],
        },
      ],
    }),
    defineField({
      name: "threePaths",
      title: "Three Paths Section",
      type: "object",
      validation: (Rule) =>
        Rule.required().error("Three Paths section is required"),
      fields: [
        {
          name: "heading",
          title: "Heading",
          type: "string",
          validation: (Rule) => Rule.required().error("Heading is required"),
        },
        {
          name: "subtitle",
          title: "Subtitle",
          type: "string",
          validation: (Rule) => Rule.required().error("Subtitle is required"),
        },
        {
          name: "paragraph",
          title: "Paragraph",
          type: "text",
          validation: (Rule) => Rule.required().error("Paragraph is required"),
        },
        {
          name: "tableContent",
          title: "Table Content",
          type: "object",
          fields: [
            {
              name: "bestFor",
              title: "Best For",
              type: "array",
              validation: (Rule) => Rule.required().min(3).max(3),
              of: [
                {
                  name: "description",
                  title: "Description",
                  type: "text",
                  validation: (Rule) =>
                    Rule.required().error("This text is required"),
                },
              ],
            },
            {
              name: "approach",
              title: "Approach",
              type: "array",
              validation: (Rule) => Rule.required().min(3).max(3),
              of: [
                {
                  name: "description",
                  title: "Description",
                  type: "string",
                  validation: (Rule) =>
                    Rule.required().error("This text is required"),
                },
              ],
            },
            {
              name: "focus",
              title: "Focus",
              type: "array",
              validation: (Rule) => Rule.required().min(3).max(3),
              of: [
                {
                  name: "description",
                  title: "Description",
                  type: "string",
                  validation: (Rule) =>
                    Rule.required().error("This text is required"),
                },
              ],
            },
            {
              name: "extras",
              title: "Extras",
              type: "object",
              fields: [
                {
                  name: "essentialSeries",
                  title: "Essential Series",
                  type: "array",
                  of: [
                    {
                      type: "string",
                      validation: (Rule) =>
                        Rule.required().error("This text is required"),
                    },
                  ],
                },
                {
                  name: "curateLifestyle",
                  title: "Curate Lifestyle",
                  type: "array",
                  of: [
                    {
                      type: "string",
                      validation: (Rule) =>
                        Rule.required().error("This text is required"),
                    },
                  ],
                },
                {
                  name: "masterHealthBlueprint",
                  title: "Master Health Blueprint",
                  type: "array",
                  of: [
                    {
                      type: "string",
                      validation: (Rule) =>
                        Rule.required().error("This text is required"),
                    },
                  ],
                },
              ],
            },
            {
              name: "pricing",
              title: "Pricing",
              type: "object",
              fields: [
                {
                  name: "essentialSeries",
                  title: "Essential Series",
                  validation: (Rule) =>
                    Rule.required().error("This text is required"),
                  type: "string",
                },
                {
                  name: "curateLifestyle",
                  title: "Curate Lifestyle",
                  type: "array",
                  of: [
                    {
                      type: "string",
                      validation: (Rule) =>
                        Rule.required().error("This text is required"),
                    },
                  ],
                },
                {
                  name: "masterHealthBlueprint",
                  title: "Master Health Blueprint",
                  validation: (Rule) =>
                    Rule.required().error("This text is required"),
                  type: "text",
                },
              ],
            },
          ],
        },
      ],
    }),
    defineField({
      name: "ctaSection",
      title: "Call to Action Section",
      type: "object",
      validation: (Rule) =>
        Rule.required().error("Three Paths section is required"),
      fields: [
        {
          name: "image",
          type: "image",
          title: "Background Image",
        },
        {
          name: "heading",
          title: "Heading",
          type: "string",
          validation: (Rule) => Rule.required().error("Heading is required"),
        },
        {
          name: "paragraph",
          title: "Paragraph",
          type: "text",
          validation: (Rule) => Rule.required().error("Paragraph is required"),
        },
        {
          name: "buttonText",
          title: "Button Text",
          type: "string",
          validation: (Rule) =>
            Rule.required().error("Button Text is required"),
        },
      ],
    }),
  ],

  preview: {
    select: {
      title: "title",
      service: "service.title",
      media: "heroImage",
    },
    prepare(selection) {
      const { title, media } = selection;
      return {
        title: title,
        subtitle: `Our Programs`,
        media: media,
      };
    },
  },
});
