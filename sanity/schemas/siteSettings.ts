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
      deprecated: {
        reason: "Moved to Contact Page.",
      },
      readOnly: true,
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
      // Not deprecated, and not read only, though the schema said both until
      // CH-025. "Moved to Contact Page" was backwards: this is the copy that
      // lib/structured-data.tsx, the site footer and llms.txt all read. An
      // editor correcting the address on the contact page changed none of
      // them, and could not correct the one that mattered because it was
      // locked. The contact page's copy is gone now and this is the address.
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
          title: "Google Maps Place Link",
          description:
            "Opens the Curate Health listing on Google Maps. Read by the site footer, by hasMap in the schema graph, and by llms.txt. This is not the directions link.",
        }),
        defineField({
          /**
           * Two link fields, because there are two links doing two jobs, and
           * one field was making them fight over it.
           *
           * mapLink opens the business listing. This one carries a daddr and
           * starts navigation, which is what a Get Directions button has to
           * do. Until CH-025 the directions URL lived on contactPage and the
           * place link on siteSettings, both under the name mapLink, so the
           * two looked like a duplicate that could be deleted. Deleting the
           * contactPage copy without moving this value first would have taken
           * the only working directions URL on the site with it.
           */
          name: "directionsLink",
          type: "url",
          title: "Google Maps Directions Link",
          description:
            "Starts navigation to the clinic, so it has to carry a daddr parameter. Read by the Get Directions button on the contact page.",
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
              /**
               * Which business this profile belongs to. CH-008.
               *
               * Every one of these renders in the same footer, but they do not
               * all describe the same entity, and sameAs is how Google confirms
               * that a profile and a business are the same thing. Listing the
               * cafe's Instagram on the clinic entity tells it the two are one
               * account, which muddies both rather than strengthening either.
               *
               * So the footer reads the whole array and lib/structured-data.tsx
               * splits it: clinic profiles go on the MedicalClinic entity, cafe
               * profiles on CafeOrCoffeeShop.
               */
              name: "entity",
              type: "string",
              title: "Belongs to",
              description:
                "Which business this profile is for. Decides which entity it is attached to in the structured data. Defaults to the clinic.",
              options: {
                list: [
                  { title: "Curate Health (the clinic)", value: "clinic" },
                  { title: "Curate Cafe", value: "cafe" },
                ],
                layout: "radio",
              },
              initialValue: "clinic",
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
