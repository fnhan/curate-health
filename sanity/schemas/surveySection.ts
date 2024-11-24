import { defineField, defineType } from "sanity";

export default defineType({
  name: "surveySection",
  title: "Shared | Survey Section",
  type: "document",
  fields: [
    defineField({
      name: "bgImage",
      title: "Survey Section Image",
      type: "image",
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
      validation: (Rule) => Rule.required().error("Image is required"),
    }),
    defineField({
      name: "cta",
      title: "Call to Action",
      type: "string",
      description: "CTA survey link",
      validation: (Rule) => Rule.required().error("Call to Action is required"),
    }),
    defineField({
      name: "youformId",
      title: "Youform Id",
      type: "string",
      description: "Alphanumeric code linked to Youform survey",
      validation: (Rule) => Rule.required().error("Youform Id is required"),
    }),
    defineField({
      name: "content",
      title: "Text Content",
      type: "string",
      description: "Text content for the survey link",
      validation: (Rule) => Rule.required().error("Text Content is required"),
    }),
    defineField({
      name: "bold",
      title: "Bolded text content",
      type: "string",
      description: "Bolded text at end of text content",
      validation: (Rule) =>
        Rule.required().error("Bolded text content is required"),
    }),
  ],
  preview: {
    select: {
      bgImage: "bgImage",
    },
    prepare(selection) {
      const { bgImage } = selection;
      return {
        title: "Survey Section",
        media: bgImage,
      };
    },
  },
});
