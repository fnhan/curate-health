import { defineField, defineType } from "sanity";



import { fieldDescriptions } from "../schema-helpers";


export default defineType({
  name: "product",
  title: "Shared | Product Pages",
  type: "document",
  fields: [
    defineField({
      name: "isActive",
      title: "Is Active",
      type: "boolean",
      description: "Toggle to show/hide this product on the website.",
      initialValue: true,
    }),
    defineField({
      name: "title",
      title: "Product Name",
      type: "string",
      validation: (Rule) => Rule.required().error("A title is required"),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description:
        "Unique identifier for the product, used in creating the URL. Example: /products/slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error("A slug is required"),
    }),
    defineField({
      name: "description",
      title: "Product Description",
      type: "string",
      validation: (Rule) => Rule.required().error("A description is required"),
    }),

    defineField({
      name: "image",
      title: "Product Image",
      type: "image",
      description:
        "For best results, please upload an image with dimensions 250px x 250px",
      validation: (Rule) => Rule.required().error("An image is required"),
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative Text",
          description: fieldDescriptions.altImageDescription,
        },
      ],
    }),
    defineField({
      name: "banner",
      title: "Banner Image",
      type: "image",
      description:
        "For best results, please upload an image with in high quality with height of 625px and any width over 1080px.",

      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative Text",
          description: fieldDescriptions.altImageDescription,
        },
      ],
    }),
    defineField({
      name: "accordioninfo",
      title: "Additional product information",
      description:
        "Structured into accordion for better readability and accessibility.",
      type: "array",
      of: [
        defineField({
          name: "accordionitems",
          title: "Accordion Items",
          type: "object",
          fields: [
            {
              title: "Title",
              name: "title",
              type: "string",
            },
            {
              title: "Description",
              name: "description",
              type: "blockContent",
            },
          ],
          preview: {
            select: {
              title: "title",
              subtitle: "description[0].children[0].text",
            },
            prepare(selection) {
              const { title, subtitle } = selection;
              return {
                title: `Title: ${title}`,
                subtitle: `Description: ${subtitle}`,
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "callToAction",
      title: "Call to Action Section",
      type: "object",
      fields: [
        defineField({
          name: "ctaText",
          title: "Call to Action Text",
          type: "string",
          description: fieldDescriptions.ctaText,
          validation: (Rule) => Rule.required().error("CTA Text is required"),
        }),
        defineField({
          name: "ctaLink",
          title: "Call to Action Link",
          type: "url",
          description: fieldDescriptions.ctaLink,
          validation: (Rule) => Rule.required().error("CTA Link is required"),
        }),
        defineField({
          name: "ctaSectionTitle",
          title: "CTA Section Title",
          type: "string",
          description: "Title for the Call to Action section",
        }),
        defineField({
          name: "ctaSectionDescription",
          title: "CTA Section Description",
          type: "string",
          description: "Information displayed above the CTA button",
          validation: (Rule) =>
            Rule.required().error("CTA Section Description is required"),
        }),
      ],
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
      isActive: "isActive",
      media: "image",
    },
    prepare(selection) {
      const { title, isActive, media } = selection;
      return {
        title: title,
        subtitle: `Status: ${isActive ? "Active" : "Inactive"}`,
        media: media,
      };
    },
  },
});