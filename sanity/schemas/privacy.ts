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
      type: 'text',
      description: 'The content of the Privacy + Cookies',
      validation: Rule => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
});

