import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'sustainabilitySection',
  title: 'Sustainabiliy Section',
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
      name: 'susText',
      title: 'Sustainability Text',
      type: 'blockContent',
      description: 'The main text displayed for sustainability',
    }),
  ],

  preview: {
    select: {
      bgImage: 'bgImage',
      heroText: 'susText.0.children.0.text',
    },
    prepare(selection) {
      const { bgImage } = selection;
      return {
        title: 'Sustainabiliy Section',
        media: bgImage,
      };
    },
  },
});
