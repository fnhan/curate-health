import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'clinic',
  title: 'Clinic Section',
  type: 'document',
  fields: [
    defineField({
      name: 'clinicImage',
      title: 'Clinic Background Image',
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
      name: 'content',
      title: 'Clinic Content',
      type: 'blockContent',
      description: 'Add content paragraphs for the clinic section',
    }),
  ],
  preview: {
    select: {
      title: 'content',
      media: 'clinicImage',
    },
    prepare(selection) {
      const { media } = selection;
      return {
        title: 'Clinic Section',
        media: media,
      };
    },
  },
});
