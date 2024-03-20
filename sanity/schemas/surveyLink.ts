import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'surveyLink',
  title: 'Survey Link',
  type: 'document',
  fields: [
    defineField({
      name: 'bgImage',
      title: 'Survey Link Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          description:
            'Describes the appearance and function of the image. Important for SEO and accessibility. Should be concise and informative.',
        },
      ],
    }),
    defineField({
      name: 'cta',
      title: 'Call to Action',
      type: 'string',
      description: 'Text for the CTA button',
    }),
    defineField({
      name: 'href',
      title: 'Link Href',
      type: 'string',
      description: 'URL/Link for the hover link. (Example: /survey)',
    }),
  ],
  preview: {
    select: {
      bgImage: 'bgImage',
    },
    prepare(selection) {
      const { bgImage } = selection;
      return {
        title: 'Survey Link',
        media: bgImage,
      };
    },
  },
});