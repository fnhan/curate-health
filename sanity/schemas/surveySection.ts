import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'survey',
  title: 'Survey Section',
  type: 'document',
  fields: [
    defineField({
      name: 'bgImage',
      title: 'Survey Image',
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
      name: 'title',
      title: 'Survey Title',
      type: 'string',
      description: 'Title for the survey section',
    }),
    defineField({
      name: 'content',
      title: 'Survey Content',
      type: 'string',
      description: 'Text for the survey section',
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
        title: 'Survey Section',
        media: bgImage,
      };
    },
  },
});
