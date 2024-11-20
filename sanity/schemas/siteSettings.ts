import { defineField, defineType } from 'sanity';
import legalPages from './legalPages';

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'brandName',
      type: 'string',
      title: 'Brand Name',
      validation: (Rule) => Rule.required().error('Brand Name is required'),
    }),
    defineField({
      name: 'siteLogo',
      type: 'object',
      title: 'Site Logo',
      fields: [
        defineField({
          name: 'mobile',
          type: 'image',
          title: 'Mobile Logo',
          description: 'Logo for mobile view',
          options: {
            hotspot: true,
          },
          validation: (Rule) =>
            Rule.required().error('Mobile Logo is required'),
        }),
        defineField({
          name: 'desktop',
          type: 'image',
          title: 'Desktop Logo',
          description: 'Logo for desktop view',
          options: {
            hotspot: true,
          },
          validation: (Rule) =>
            Rule.required().error('Desktop Logo is required'),
        }),
      ],
    }),
    defineField({
      name: 'contactInfo',
      type: 'object',
      title: 'Contact Information',
      fields: [
        defineField({
          name: 'email',
          type: 'string',
          title: 'Contact Email',
          validation: (Rule) =>
            Rule.required().error('Contact Email is required'),
        }),
        defineField({
          name: 'phone',
          type: 'string',
          title: 'Contact Phone',
        }),
        defineField({
          name: 'address',
          type: 'object',
          title: 'Contact Address',
          fields: [
            defineField({
              name: 'street',
              type: 'string',
              title: 'Street',
            }),
            defineField({
              name: 'city',
              type: 'string',
              title: 'City',
            }),
            defineField({
              name: 'state',
              type: 'string',
              title: 'State / Province',
            }),
            defineField({
              name: 'zip',
              type: 'string',
              title: 'Zip',
            }),
            defineField({
              name: 'country',
              type: 'string',
              title: 'Country',
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'navLinks',
      type: 'array',
      title: 'Navigation Links',
      of: [
        {
          type: 'object',
          name: 'navLink',
          fields: [
            defineField({
              name: 'title',
              type: 'string',
              title: 'Link Title',
              validation: (Rule) =>
                Rule.required().error('Link Title is required'),
            }),
            defineField({
              name: 'slug',
              type: 'slug',
              title: 'Link Slug',
              description: 'The slug of the page to link to.',
              validation: (Rule) =>
                Rule.required().error('Link Slug is required'),
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'legalLinks',
      type: 'array',
      title: 'Legal Links',
      of: [
        defineField({
          name: 'legalLink',
          title: 'Legal Link',
          type: 'reference',
          to: [{ type: 'legalPage' }],
          validation: (Rule) => Rule.required().error('Legal Link is required'),
        }),
      ],
    }),
    defineField({
      name: 'socialMedia',
      type: 'array',
      title: 'Social Media Links',
      of: [
        {
          type: 'object',
          name: 'socialLink',
          fields: [
            defineField({
              name: 'platform',
              type: 'string',
              title: 'Platform',
              validation: (Rule) =>
                Rule.required().error('Platform is required'),
            }),
            // defineField({
            //   name: 'platformLogo',
            //   type: 'image',
            //   title: 'Platform Logo',
            //   description: 'Logo for platform',
            //   options: {
            //     hotspot: true,
            //   },
            //   validation: (Rule) =>
            //     Rule.required().error('Platform Logo is required'),
            // }),
            defineField({
              name: 'url',
              type: 'url',
              title: 'URL',
              validation: (Rule) => Rule.required().error('URL is required'),
            }),
            defineField({
              name: 'isActive',
              type: 'boolean',
              title: 'Is Active',
              description: 'Toggle to show or hide this social link',
              initialValue: true,
            }),
          ],
        },
      ],
    }),
  ],
});