import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'treatment',
  title: 'Treatments',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().error('A title is required'),
    }),
    defineField({
      name: 'service',
      title: 'Service',
      type: 'reference',
      to: { type: 'service' },
      description: 'The service to which this treatment belongs to',
      validation: (Rule) => Rule.required().error('The service is required'),
    }),
    defineField({
      name: 'treatmentSlug',
      title: 'Slug',
      type: 'slug',
      description:
        'Unique identifier for the treatment, used in creating the URL. Slugs should be URL-friendly strings. It is auto-generated from the title but can be manually edited for clarity or SEO optimization.',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error('A slug is required'),
    }),
    defineField({
      name: 'aboveImage',
      title: 'Above Image',
      type: 'image',
      validation: (Rule) => Rule.required().error('An image is required'),
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
      name: 'image',
      title: 'Image',
      type: 'image',
      validation: (Rule) => Rule.required().error('An image is required'),
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
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      description: 'Toggle to show/hide this treatment on the website.',
      initialValue: true,
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'blockContent',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      service: 'service.title',
      media: 'image',
    },
    prepare(selection) {
      const { title, media, service } = selection;
      return {
        title: title,
        subtitle: `Service: ${service}`,
        media: media,
      };
    },
  },
});
