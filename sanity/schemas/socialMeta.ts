import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'socialMeta',
  title: 'Social Media Meta',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) =>
        Rule.required().error('A title is required for social media meta.'),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (Rule) =>
        Rule.required().error(
          'A description is required for social media meta.'
        ),
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          validation: (Rule) =>
            Rule.required().error('Alt text is required for Open Graph image.'),
        }),
      ],
      description:
        'Minimum size: 200x200px, ideal ratio: 1.91:1, max size: 8MB',
      validation: (Rule) =>
        Rule.required().error('An image is required for Open Graph.'),
    }),
    defineField({
      name: 'twitterImage',
      title: 'Twitter Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          validation: (Rule) =>
            Rule.required().error('Alt text is required for Twitter image.'),
        }),
      ],
      description:
        'Minimum size: 144x144px (300x157px with large card), ideal ratio: 1:1 (2:1 with large card), max size: 5MB',
      validation: (Rule) =>
        Rule.required().error('An image is required for Twitter.'),
    }),
  ],
});
