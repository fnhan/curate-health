import { defineField, defineType } from "sanity";

import { fieldDescriptions } from "../schema-helpers";

export default defineType({
  name: "contactPage",
  title: "Contact | Contact Page",
  type: "document",
  fields: [
    defineField({
      name: "heroSection",
      title: "Hero Section",
      type: "object",
      fields: [
        defineField({
          name: "title",
          title: "Hero Title",
          type: "string",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "heroImage",
          title: "Hero Image",
          type: "object",
          fields: [
            defineField({
              name: "image",
              title: "Hero Image",
              type: "image",
              options: {
                hotspot: true,
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "alt",
              title: "Alt Text",
              description: fieldDescriptions.altImageDescription,
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
          ],
        }),
      ],
    }),

    defineField({
      name: "branchName",
      type: "string",
      title: "Branch Name",
      validation: (Rule) => Rule.required().error("Branch Name is required"),
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
            defineField({
              name: "locationInfo",
              title: "Location Information",
              type: "text",
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
      name: "branchName2",
      type: "string",
      title: "Second Branch Name",
      validation: (Rule) => Rule.required().error("Branch Name is required"),
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
            defineField({
              name: "locationInfo",
              title: "Location Information",
              type: "text",
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
      name: "mapURL",
      title: "Map Embed Url",
      type: "string",
      description:
        "embed URL from Google Maps; search address and find embed url under Share option",
    }),

    defineField({
      name: "mapURL2",
      title: "Map Embed Url 2",
      type: "string",
      description:
        "(Second location)embed URL from Google Maps; search address and find embed url under Share option",
    }),

    defineField({
      name: "parking",
      title: "Parking",
      type: "text",
    }),

    defineField({
      name: "howToGetHere",
      title: "How to Get Here",
      type: "text",
    }),

    defineField({
      name: "businessHours",
      title: "Business Hours",
      description: "Set your business hours for each day",
      type: "object",
      fields: [
        defineField({
          name: "standardHours",
          title: "Standard Hours",
          description: "Used for days with the same opening and closing times",
          type: "string",
          options: {
            list: [
              { title: "9:00 AM - 5:00 PM", value: "9:00 AM - 5:00 PM" },
              { title: "9:00 AM - 6:00 PM", value: "9:00 AM - 6:00 PM" },
              { title: "9:00 AM - 7:00 PM", value: "9:00 AM - 7:00 PM" },
              { title: "10:00 AM - 7:00 PM", value: "10:00 AM - 7:00 PM" },
              { title: "8:00 AM - 4:00 PM", value: "8:00 AM - 4:00 PM" },
              { title: "Custom", value: "custom" },
            ],
          },
        }),
        defineField({
          name: "customStandardHours",
          title: "Custom Standard Hours",
          type: "string",
          hidden: ({ parent }) => parent?.standardHours !== "custom",
          description: "Format: HH:MM AM - HH:MM PM",
          validation: (Rule) =>
            Rule.regex(
              /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM) - (0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/
            ).error('Please use format like "9:00 AM - 5:00 PM"'),
        }),
        defineField({
          name: "daysOpen",
          title: "Days Open",
          type: "array",
          of: [{ type: "string" }],
          options: {
            list: [
              { title: "Monday", value: "monday" },
              { title: "Tuesday", value: "tuesday" },
              { title: "Wednesday", value: "wednesday" },
              { title: "Thursday", value: "thursday" },
              { title: "Friday", value: "friday" },
              { title: "Saturday", value: "saturday" },
              { title: "Sunday", value: "sunday" },
            ],
          },
        }),
        defineField({
          name: "exceptions",
          title: "Exceptions",
          description: "Add any days with custom times/values",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({
                  name: "day",
                  title: "Day",
                  type: "string",
                  options: {
                    list: [
                      { title: "Monday", value: "monday" },
                      { title: "Tuesday", value: "tuesday" },
                      { title: "Wednesday", value: "wednesday" },
                      { title: "Thursday", value: "thursday" },
                      { title: "Friday", value: "friday" },
                      { title: "Saturday", value: "saturday" },
                      { title: "Sunday", value: "sunday" },
                    ],
                  },
                }),
                defineField({
                  name: "hours",
                  title: "Hours",
                  type: "string",
                  description: "Custom Time/Value",
                }),
                defineField({
                  name: "message",
                  title: "Message",
                  type: "string",
                  description: "Optional",
                }),
              ],
            },
          ],
        }),
      ],
    }),

    defineField({
      name: "businessHours2",
      title: "Business Hours (Second Location)",
      description: "Set your business hours for each day",
      type: "object",
      fields: [
        defineField({
          name: "standardHours",
          title: "Standard Hours",
          description: "Used for days with the same opening and closing times",
          type: "string",
          options: {
            list: [
              { title: "9:00 AM - 5:00 PM", value: "9:00 AM - 5:00 PM" },
              { title: "9:00 AM - 6:00 PM", value: "9:00 AM - 6:00 PM" },
              { title: "9:00 AM - 7:00 PM", value: "9:00 AM - 7:00 PM" },
              { title: "10:00 AM - 7:00 PM", value: "10:00 AM - 7:00 PM" },
              { title: "8:00 AM - 4:00 PM", value: "8:00 AM - 4:00 PM" },
              { title: "Custom", value: "custom" },
            ],
          },
        }),
        defineField({
          name: "customStandardHours",
          title: "Custom Standard Hours",
          type: "string",
          hidden: ({ parent }) => parent?.standardHours !== "custom",
          description: "Format: HH:MM AM - HH:MM PM",
          validation: (Rule) =>
            Rule.regex(
              /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM) - (0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/
            ).error('Please use format like "9:00 AM - 5:00 PM"'),
        }),
        defineField({
          name: "daysOpen",
          title: "Days Open",
          type: "array",
          of: [{ type: "string" }],
          options: {
            list: [
              { title: "Monday", value: "monday" },
              { title: "Tuesday", value: "tuesday" },
              { title: "Wednesday", value: "wednesday" },
              { title: "Thursday", value: "thursday" },
              { title: "Friday", value: "friday" },
              { title: "Saturday", value: "saturday" },
              { title: "Sunday", value: "sunday" },
            ],
          },
        }),
        defineField({
          name: "exceptions",
          title: "Exceptions",
          description: "Add any days with custom times/values",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({
                  name: "day",
                  title: "Day",
                  type: "string",
                  options: {
                    list: [
                      { title: "Monday", value: "monday" },
                      { title: "Tuesday", value: "tuesday" },
                      { title: "Wednesday", value: "wednesday" },
                      { title: "Thursday", value: "thursday" },
                      { title: "Friday", value: "friday" },
                      { title: "Saturday", value: "saturday" },
                      { title: "Sunday", value: "sunday" },
                    ],
                  },
                }),
                defineField({
                  name: "hours",
                  title: "Hours",
                  type: "string",
                  description: "Custom Time/Value",
                }),
                defineField({
                  name: "message",
                  title: "Message",
                  type: "string",
                  description: "Optional",
                }),
              ],
            },
          ],
        }),
      ],
    }),
    defineField({
      name: "contactForm",
      title: "Contact Form",
      type: "object",
      fields: [
        defineField({
          name: "image",
          title: "Image",
          type: "image",
          options: {
            hotspot: true,
          },
        }),
        defineField({
          name: "alt",
          title: "Alt Text",
          description: fieldDescriptions.altImageDescription,
          type: "string",
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
      title: "heroSection.title",
    },
  },
});
