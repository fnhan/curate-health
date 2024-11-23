import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'primaryCTAButton',
  title: 'Shared | Primary CTA Button',
  type: 'document',
  fields: [
    defineField({
      name: 'ctaButton',
      type: 'object',
      title: 'CTA Button',
      fields: [
        defineField({
          name: 'ctaText',
          type: 'string',
          title: 'CTA Button Text',
          description: 'Text for the call-to-action button.',
          validation: (Rule) =>
            Rule.required().error('CTA Button Text is required'),
        }),
        defineField({
          name: 'ctaLink',
          type: 'url',
          title: 'CTA Link',
          description: 'Enter the URL for the CTA button.',
          validation: (Rule) => Rule.required().error('CTA Link is required'),
        }),
      ],
    }),
  ],
  preview: {
    select: {
      ctaButton: 'ctaButton',
    },
    prepare({ ctaButton }) {
      return {
        title: ctaButton?.ctaText,
        subtitle: ctaButton?.ctaPage?.title,
      };
    },
  },
});
