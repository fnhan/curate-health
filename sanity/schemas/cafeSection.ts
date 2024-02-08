import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'cafe',
  title: 'Cafe Section',
  type: 'document',
  fields: [
    defineField({
      name: 'cafeImage',
      title: 'Cafe Background Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          description:
            'Describes the appearance and function of the image. Important for SEO and accessibility. Should be concise and informative.',
        },
      ],
    }),
    defineField({
      name: 'title',
      title: 'Cafe Title',
      type: 'blockContent',
      description: 'Add title for the cafe section',
    }),
    defineField({
      name: 'content',
      title: 'Cafe Content',
      type: 'blockContent',
      description: 'Add content paragraphs for the cafe section',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'cafeImage',
    },
    prepare(selection) {
      const { media } = selection;
      return {
        title: 'Cafe Section',
        media: media,
      };
    },
  },
});
