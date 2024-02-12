import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'navigation',
  title: 'Navigation',
  type: 'document',
  fields: [
    defineField({
      name: 'serviceLinks',
      title: 'Service Links',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'service' }] }],
    }),
    defineField({
      name: 'navItems',
      title: 'Navigation Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'linkText',
              title: 'Link Text',
              description: 'What will appear on the site.',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'href',
              title: 'Link',
              description:
                'The url to the page you want to link to. (Example: /about)',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'isServiceLinks',
              title: 'Is Service Links Placeholder',
              type: 'boolean',
              description:
                'Check this if you want to render the Service Links at this position.',
            },
          ],
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: `Navigation Configuration`,
      };
    },
  },
});
