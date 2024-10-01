import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'product',
  title: 'Products',
  type: 'document',
  fields: [
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      description: 'Toggle to show/hide this product on the website.',
      initialValue: true,
    }),
    defineField({
      name: 'banner',
      title: 'Banner Image',
      type: 'image',
      description:
        'For best results, please upload an image with in high quality with height of 625px and any width over 1080px.',

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
      name: 'title',
      title: 'Product Name',
      type: 'string',
      validation: (Rule) => Rule.required().error('A title is required'),
    }),
    defineField({
      name: 'description',
      title: 'Product Description',
      type: 'string',
      validation: (Rule) => Rule.required().error('A description is required'),
    }),
    defineField({
      name: 'accordioninfo',
      title: 'In-depth product information structured into accordion',
      type: 'array',
      of: [
        defineField({
          name: 'accordionitems',
          title: 'Accordion Items',
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
              type: 'blockContent',
            },
          ],
          preview: {
            select: {
              title: 'title', // Select the slug field
              subtitle: 'description[0].children[0].text',
            },
            prepare(selection) {
              const { title, subtitle } = selection;
              return {
                title: `Title: ${title}`, // Customize the preview title
                subtitle: `Description: ${subtitle}`,
              };
            },
          },
        }),
      ],
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description:
        'Unique identifier for the post, used in creating the URL. Slugs should be URL-friendly strings. It is auto-generated from the title but can be manually edited for clarity or SEO optimization.',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error('A slug is required'),
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
