import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'product',
  title: 'Products',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Product Name',
      type: 'string',
      validation: (Rule) => Rule.required().error('A title is required'),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description:
        'Unique identifier for this product, used in creating the URL. It is auto-generated from the product name but can be manually edited for clarity or SEO optimization.',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error('A slug is required'),
    }),
    defineField({
      name: 'description',
      title: 'Product Description',
      type: 'string',
      validation: (Rule) => Rule.required().error('A description is required'),
    }),
    defineField({
      name: 'image',
      title: 'Product Image',
      type: 'image',
      description:
        'For best results, please upload an image with dimensions 250px x 250px',
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
      description: 'Toggle to show/hide this product on the website.',
      initialValue: true,
    }),
  ],

  preview: {
    select: {
      title: 'title',
      isActive: 'isActive',
      media: 'image',
    },
    prepare(selection) {
      const { title, isActive, media } = selection;
      return {
        title: title,
        subtitle: `Status: ${isActive ? 'Active' : 'Inactive'}`,
        media: media,
      };
    },
  },
});
