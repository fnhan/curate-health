import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'highlight',
  title: 'Highlight Section',
  type: 'document',
  fields: [
    defineField({
      name: 'highlightImage',
      title: 'Highlight Image',
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
      name: 'title1',
      title: 'First Title',
      type: 'string',
      description: 'The first title displayed in the Highlight section',
    }),
    defineField({
      name: 'title2',
      title: 'Second Title',
      type: 'string',
      description: 'The second title displayed in the Highlight section',
    }),
    defineField({
      name: 'hoverLinkText',
      title: 'Hover Link Text',
      type: 'string',
      description: 'Text for the hover link (Example: More About Us)',
    }),
    defineField({
      name: 'hoverLinkHref',
      title: 'Hover Link Href',
      type: 'string',
      description: 'URL/Link for the hover link. (Example: /about)',
    }),
  ],

  preview: {
    select: {
      title1: 'title1',
      title2: 'title2',
      highlightImage: 'highlightImage',
    },
    prepare(selection) {
      const { title1, title2, highlightImage } = selection;
      return {
        title: title1 || 'No first title',
        subtitle: title2 || 'No second title',
        media: highlightImage,
      };
    },
  },
});
