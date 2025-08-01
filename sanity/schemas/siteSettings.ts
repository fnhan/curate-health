import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Settings | Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "isComingSoon",
      type: "boolean",
      title: "Is Coming Soon",
      description: "Toggle to show the coming soon page",
      initialValue: true,
    }),
    defineField({
      name: "brandName",
      type: "string",
      title: "Brand Name",
      validation: (Rule) => Rule.required().error("Brand Name is required"),
    }),
    defineField({
      name: "siteLogo",
      type: "image",
      title: "Site Logo",
      description:
        "Logo for the site. Please upload a png with transparent background.",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required().error("Site Logo is required"),
    }),
    defineField({
      name: "contactInfo",
      type: "object",
      title: "Contact Information",
      fields: [
        defineField({
          name: "email",
          type: "string",
          title: "Contact Email",
          validation: (Rule) =>
            Rule.required().error("Contact Email is required"),
        }),
        defineField({
          name: "phone",
          type: "string",
          title: "Contact Phone",
        }),
        defineField({
          name: "address",
          type: "object",
          title: "Contact Address",
          fields: [
            defineField({
              name: "street",
              type: "string",
              title: "Street",
            }),
            defineField({
              name: "city",
              type: "string",
              title: "City",
            }),
            defineField({
              name: "state",
              type: "string",
              title: "State / Province",
            }),
            defineField({
              name: "zip",
              type: "string",
              title: "Zip",
            }),
            defineField({
              name: "country",
              type: "string",
              title: "Country",
            }),
          ],
        }),
        defineField({
          name: "mapLink",
          type: "url",
          title: "Google Map Link",
          description: "Link to the Google Map",
        }),
      ],
    }),
    defineField({
      name: "contactInfo2",
      type: "object",
      title: "Contact Information 2",
      fields: [
        defineField({
          name: "address",
          type: "object",
          title: "Contact Address",
          fields: [
            defineField({
              name: "street",
              type: "string",
              title: "Street",
            }),
            defineField({
              name: "city",
              type: "string",
              title: "City",
            }),
            defineField({
              name: "state",
              type: "string",
              title: "State / Province",
            }),
            defineField({
              name: "zip",
              type: "string",
              title: "Zip",
            }),
            defineField({
              name: "country",
              type: "string",
              title: "Country",
            }),
          ],
        }),
        defineField({
          name: "mapLink",
          type: "url",
          title: "Google Map Link",
          description: "Link to the Google Map",
        }),
        defineField({
          name: "brandName",
          type: "string",
          title: "Brand Name",
        }),
      ],
    }),
    defineField({
      name: "services",
      type: "array",
      title: "Services",
      description: "Services displayed in the navigation menu and footer",
      of: [
        {
          type: "reference",
          to: [{ type: "service" }],
        },
      ],
    }),
    defineField({
      name: "navLinks",
      type: "array",
      title: "Additional Navigation Links",
      description: "Additional links displayed in the navigation menu",
      of: [
        {
          type: "object",
          name: "navLink",
          fields: [
            defineField({
              name: "title",
              type: "string",
              title: "Link Title",
              validation: (Rule) =>
                Rule.required().error("Link Title is required"),
            }),
            defineField({
              name: "href",
              type: "string",
              title: "Link URL",
              description:
                "The URL the link should point to (e.g., /about, /contact)",
              validation: (Rule) =>
                Rule.required().error("Link URL is required"),
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "footerNavLinks",
      type: "array",
      title: "Footer Navigation Links",
      description: "Groups of links displayed in the footer",
      of: [
        {
          type: "object",
          name: "navGroup",
          fields: [
            defineField({
              name: "groupTitle",
              type: "string",
              title: "Group Title",
            }),
            defineField({
              name: "links",
              type: "array",
              title: "Links in Group",
              of: [
                {
                  type: "object",
                  name: "navLink",
                  fields: [
                    defineField({
                      name: "title",
                      type: "string",
                      title: "Link Title",
                      description:
                        "The text to display for the link. Example: Our Story",
                      validation: (Rule) =>
                        Rule.required().error("Link Title is required"),
                    }),
                    defineField({
                      name: "slug",
                      type: "slug",
                      title: "Link Slug",
                      description:
                        "The slug of the page to link to. Example: /about/our-story",
                      validation: (Rule) =>
                        Rule.required().error("Link Slug is required"),
                    }),
                  ],
                },
              ],
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "legalLinks",
      type: "array",
      title: "Legal Links",
      description: "Links displayed in the footer",
      of: [
        defineField({
          name: "legalLink",
          title: "Legal Link",
          type: "reference",
          to: [{ type: "legalPage" }],
          validation: (Rule) => Rule.required().error("Legal Link is required"),
        }),
      ],
    }),
    defineField({
      name: "socialMedia",
      type: "array",
      title: "Social Media Links",
      description: "Links displayed in the footer",
      of: [
        {
          type: "object",
          name: "socialLink",
          fields: [
            defineField({
              name: "platform",
              type: "string",
              title: "Platform",
              validation: (Rule) =>
                Rule.required().error("Platform is required"),
            }),
            // defineField({
            //   name: 'platformLogo',
            //   type: 'image',
            //   title: 'Platform Logo',
            //   description: 'Logo for platform',
            //   options: {
            //     hotspot: true,
            //   },
            //   validation: (Rule) =>
            //     Rule.required().error('Platform Logo is required'),
            // }),
            defineField({
              name: "url",
              type: "url",
              title: "URL",
              validation: (Rule) => Rule.required().error("URL is required"),
            }),
            defineField({
              name: "isActive",
              type: "boolean",
              title: "Is Active",
              description: "Toggle to show or hide this social link",
              initialValue: true,
            }),
          ],
        },
      ],
    }),
  ],
});
