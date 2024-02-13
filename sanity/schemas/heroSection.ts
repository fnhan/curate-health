import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'heroSection',
  title: 'Hero Section',
  type: 'document',
  fields: [
    defineField({
      name: 'videoID',
      title: 'Video ID',
      type: 'string',
      description:
        'You can find this in the video URL on Vimeo. For example, in the URL https://vimeo.com/912438525?share=copy, the Video ID is 912438525.',
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
      heroText: 'heroText.0.children.0.text',
    },
    prepare(selection) {
      return {
        title: 'Hero Section',
      };
    },
  },
});
