import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'contactInfo',
  title: 'Contact Information',
  type: 'document',
  fields: [
    defineField({
      name: 'contactInfoImage',
      title: 'Contact Information Background Image',
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
      name: 'streetAddress',
      title: 'Street Address',
      type: 'string',
      description: 'The street address of Curate Health',
    }),
    defineField({
      name: 'hrefDirections',
      title: 'href Directions',
      type: 'string',
      description: 'URL/Link for actionable address (links to Google Maps when clicked)',
    }),
    defineField({
      name: 'postalAddress',
      title: 'Postal Address',
      type: 'string',
      description: 'The city, province, and postal code of Curate Health',
    }),
    defineField({
      name: 'emailAddress',
      title: 'Email Address',
      type: 'string',
      description: 'The contact email address for Curate Health',
    }),
    defineField({
      name: 'phoneNumber',
      title: 'Phone Number',
      type: 'string',
      description: 'The contact phone number for Curate Health',
    }),
  ],

  preview: {
    select: {
      streetAddress: 'streetAddress',
      postalAddress: 'postalAddress',
      emailAddress: 'emailAddress',
      phoneNumber: 'phoneNumber',
      contactInfoImage: 'contactInfoImage',
      hrefDirections: 'hrefDirections'
    },
    prepare(selection) {
      const { streetAddress, postalAddress, emailAddress, phoneNumber, contactInfoImage, hrefDirections } = selection;
      return {
        title: 'Contact Information',
        media: contactInfoImage,
      };
    },
  },
});