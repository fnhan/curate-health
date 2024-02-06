import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'heroSection',
  title: 'Hero Section',
  type: 'document',
  fields: [
    defineField({
      name: 'bgImage',
      title: 'Background image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'heroText',
      title: 'Hero Text',
      type: 'blockContent',
      description: 'The main text displayed in the Hero section',
    }),
  ],

  preview: {
    select: {
      bgImage: 'bgImage',
      heroText: 'heroText.0.children.0.text',
    },
    prepare(selection) {
      const { bgImage } = selection;
      return {
        title: 'Hero Section',
        media: bgImage,
      };
    },
  },
});
