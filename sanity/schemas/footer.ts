import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'footer',
  title: 'Footer',
  type: 'document',
  fields: [
    defineField({
      name: 'contactInfo',
      title: 'Contact Information',
      type: 'object',
      fields: [
        {
          name: 'sectionTitle',
          title: 'Section Title',
          type: 'string',
        },
        {
          name: 'details',
          title: 'Details',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'label',
                  title: 'Label',
                  type: 'string',
                  description:
                    'The name of the contact detail (e.g., Phone, Email, Address)',
                },
                {
                  name: 'value',
                  title: 'Value',
                  type: 'string',
                  description:
                    'The actual contact detail (e.g., phone number, email address)',
                },
              ],
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'servicesSection',
      title: 'Services Section',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'service' }] }],
    }),
    defineField({
      name: 'sections',
      title: 'Footer Sections',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Section Title',
              type: 'string',
            },
            {
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'text',
                      title: 'Link Text',
                      type: 'string',
                    },
                    {
                      name: 'href',
                      title: 'URL',
                      type: 'string',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'socialLinksSection',
      title: 'Social Links Section',
      type: 'object',
      fields: [
        {
          name: 'title',
          title: 'Section Title',
          type: 'string',
        },
        {
          name: 'links',
          title: 'Social Links',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'platform',
                  title: 'Social Media Platform',
                  type: 'string',
                },
                {
                  name: 'url',
                  title: 'URL',
                  type: 'url',
                },
              ],
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'privacy',
      title: 'Privacy Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Link Title',
              type: 'string',
            },
            {
              name: 'href',
              title: 'URL',
              type: 'string',
            },
          ],
        },
      ],
    }),
],
  preview: {
    prepare() {
      return {
        title: `Footer Configuration`,
      };
    },
  },
});
