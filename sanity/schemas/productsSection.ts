import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'productsSection',
  title: 'Products Section',
  type: 'document',
  fields: [
    defineField({
      name: 'sectionTitle',
      title: 'Section Title',
      type: 'string',
      validation: (Rule) =>
        Rule.required().error('A section title is required'),
    }),
    defineField({
      name: 'hoverLinkText',
      title: 'Hover Link Text',
      type: 'string',
      validation: (Rule) =>
        Rule.required().error('Hover link text is required'),
    }),
    defineField({
      name: 'hoverLinkHref',
      title: 'Hover Link Href',
      type: 'string',
      validation: (Rule) => Rule.required().error('Hover link URL is required'),
    }),
    defineField({
      name: 'meta',
      type: 'object',
      fields: [
        {
          title: 'Title',
          name: 'title',
          type: 'string',
        },
        {
          title: 'Description',
          name: 'description',
          type: 'string',
        },
      ],
    }),
  ],

  preview: {
    select: {
      title: 'sectionTitle',
      hoverLinkText: 'hoverLinkText',
      hoverLinkHref: 'hoverLinkHref',
    },
    prepare(selection) {
      const { title, hoverLinkText, hoverLinkHref } = selection;
      return {
        title: title,
        subtitle: `Link Text: ${hoverLinkText}, Link Href: ${hoverLinkHref}`,
      };
    },
  },
});
