import { defineField, defineType } from "sanity";


export default defineType({
  name: "serviceLifestyle",
  title: "Services | Curate Lifestyle",
  type: "document",
  fields: [
    defineField({
      name: "isActive",
      title: "Is Active",
      type: "boolean",
      description: "Toggle to show/hide this service on the website.",
      initialValue: true,
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "blockContent",
    }),
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
        "Unique identifier for the service, used in creating the URL. Slugs should be URL-friendly strings. It is auto-generated from the title but can be manually edited for clarity or SEO optimization.",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error("A slug is required"),
    }),
    defineField({
      name: "hero_image",
      title: "Hero Image",
      type: "image",
      validation: (Rule) => Rule.required().error("An image is required"),
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative Text",
          description:
            "Describes the appearance and function of the image. Important for SEO and accessibility. Should be concise and informative.",
        },
      ],
    }),
    defineField({
      name: "content_image",
      title: "Content Image",
      type: "image",
      validation: (Rule) => Rule.required().error("An image is required"),
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative Text",
          description:
            "Describes the appearance and function of the image. Important for SEO and accessibility. Should be concise and informative.",
        },
      ],
    }),
    ///////
    defineField({
      name: "hero_secondary_title",
      title: "Hero Secondary Title",
      type: "string",
    }),

    defineField({
      name: "hero_large_text",
      title: "Hero Large Text",
      type: "string",
    }),

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
      name: "block_2_title",
      title: "Block 2 Title",
      type: "string",
    }),

    defineField({
      name: "block_2_content",
      title: "Block 2 Content",
      type: "blockContent",
    }),

    defineField({
      name: "block_2_image",
      title: "Block 2 Image",
      type: "image",
      validation: (Rule) => Rule.required().error("An image is required"),
    }),

    defineField({
      name: "block_3_title",
      title: "Block 3 Title",
      type: "string",
    }),

    defineField({
      name: "block_3_content",
      title: "Condition List",
      type: "array",
      of: [
        {
          name: "condition",
          title: "Condition",
          type: "object",
          fields: [
            {
              name: "title",
              title: "Title",
              type: "string",
              validation: (Rule) => Rule.required().error("A title is required"),
            },
            {
              name: "description",
              title: "Description",
              type: "blockContent",
              validation: (Rule) => Rule.required().error("A description is required"),
            },
          ]
        },
      ]
    }),


    defineField({
      name: "block_4_image",
      title: "Block 4 Image",
      type: "image",
    }),

    defineField({
      name: "pillars",
      title: "Pillars of Lifestyle Medicine",
      type: "array",
      of: [
        {
          name: "pillar",
          title: "Pillar",
          type: "object",
          fields: [
            {
              name: "title",
              title: "Title",
              type: "string",
              validation: (Rule) => Rule.required().error("A title is required"),
            },
            {
              name: "description",
              title: "Description",
              type: "blockContent",
              validation: (Rule) => Rule.required().error("A description is required"),
            },
          ]
        },
      ]
    }),

    defineField({
      name: "block_5_image",
      title: "Block 5 Image",
      type: "image",
    }),


    defineField({
      name: "benefits",
      title: "Additional Benefits",
      type: "array",
      of: [
        {
          name: "benefit",
          title: "Benefit",
          type: "object",
          fields: [
            {
              name: "title",
              title: "Title",
              type: "string",
              validation: (Rule) => Rule.required().error("A title is required"),
            },
            {
              name: "description",
              title: "Description",
              type: "blockContent",
              validation: (Rule) => Rule.required().error("A description is required"),
            },
            {
              name: "image",
              title: "Image",
              type: "image",
            }
          ]
        },
      ]
    }),

    defineField({
      name: "block_7_image",
      title: "Block 7 Image",
      type: "image",
    }),

    defineField({
      name: "block_9_image",
      title: "Block 9 Image",
      type: "image",
    }),


    defineField({
      name: "timeline",
      title: "Program Timeline",
      type: "array",
      of: [
        {
          name: "timeline_item",
          title: "Timeline Item",
          type: "object",
          fields: [
            {
              name: "title",
              title: "Title",
              type: "string",
              validation: (Rule) => Rule.required().error("A title is required"),
            },
            {
              name: "description",
              title: "Description",
              type: "blockContent",
              validation: (Rule) => Rule.required().error("A description is required"),
            },
          ]
        },
      ]
    }),

    defineField({
      name: "block_11_image",
      title: "Block 11 Image",
      type: "image",
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
              validation: (Rule) => Rule.required().error("A title is required"),
            },
            {
              name: "description",
              title: "Description",
              type: "blockContent",
              validation: (Rule) => Rule.required().error("A description is required"),
            },
          ]
        },
      ]
    }),

    defineField({
      name: "testimonials",
      title: "Testimonials",
      type: "array",
      of: [
        {
          name: "testimonial",
          title: "Testimonial",
          type: "object",
          fields: [
            {
              name: "name",
              title: "Name",
              type: "string",
              validation: (Rule) => Rule.required().error("A name is required"),
            },
            {
              name: "image",
              title: "Image",
              type: "image",
            },
            {
              name: "description",
              title: "Description",
              type: "blockContent",
              validation: (Rule) => Rule.required().error("A description is required"),
            },
          ]
        },
      ]
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
      media: "hero_image",
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