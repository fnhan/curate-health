import { defineField, defineType } from "sanity";

import { fieldDescriptions } from "../schema-helpers";

export default defineType({
  name: "ourTeam",
  title: "About | Our Team Page",
  type: "document",
  fields: [
    defineField({
      name: "pageActive",
      title: "Page Active",
      type: "boolean",
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
          description: "Title of the hero section",
          validation: (Rule) =>
            Rule.required().error("A hero title is required"),
        }),
        defineField({
          name: "heroParagraph",
          title: "Hero Paragraph",
          type: "text",
        }),
      ],
    }),
    defineField({
      name: "teamMembers",
      title: "Team Members",
      type: "array",
      of: [
        defineField({
          name: "teamMember",
          title: "Team Member",
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Name",
              type: "string",
            }),
            defineField({
              name: "role",
              title: "Role",
              type: "blockContent",
            }),
            defineField({
              name: "bio",
              title: "Bio",
              type: "blockContent",
            }),
            defineField({
              name: "image",
              title: "Image",
              type: "image",
            }),
            // defineField({
            //   name: "links",
            //   title: "Links",
            //   type: "array",
            //   of: [
            //     defineField({
            //       name: "link",
            //       title: "Link",
            //       type: "object",
            //       fields: [
            //         defineField({
            //           name: "url",
            //           title: "URL",
            //           type: "url",
            //         }),
            //         defineField({
            //           name: "icon",
            //           title: "Icon",
            //           type: "image",
            //         }),
            //       ],
            //     }),
            //   ],
            // }),
          ],
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
    prepare() {
      return {
        title: "Our Team",
      };
    },
  },
});
