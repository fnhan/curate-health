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
      name: 'imgAltText',
      title: 'Alternate Image Text',
      type: 'string',
      description:
        'Provides alternative information for an image if a user uses screen reader, voice assistance or encountered an error that hinders display of image',
    }),
    defineField({
      name: 'sustainText',
      title: 'Sustainability Text',
      type: 'blockContent',
      description: 'The main text displayed for Sustainability',
    }),
  ],

  preview: {
    select: {
      bgImage: 'bgImage',
      sustainText: 'sustainText.0.children.0.text',
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
