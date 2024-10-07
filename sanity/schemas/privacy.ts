import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'privacy',
  title: 'Privacy + Cookies',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().error('A title is required'),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'blockContent',
      description: 'The content of the Privacy + Cookies',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'meta',
      type: 'object',
      fields: [
        {
          title: 'Title',
          name: 'title',
          type: 'string',
        },
        {
          title: 'Description',
          name: 'description',
          type: 'string',
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
});
