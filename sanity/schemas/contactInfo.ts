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
      type: 'blockContent',
      description: 'The street address of Curate Health',
    }),
    defineField({
      name: 'postalAddress',
      title: 'Postal Address',
      type: 'blockContent',
      description: 'The city, province, and postal code of Curate Health',
    }),
    defineField({
      name: 'emailAddress',
      title: 'Email Address',
      type: 'blockContent',
      description: 'The contact email address for Curate Health',
    }),
    defineField({
      name: 'phoneNumber',
      title: 'Phone Number',
      type: 'blockContent',
      description: 'The contact phone number for Curate Health',
    }),
  ],

  preview: {
    select: {
      streetAddress: 'streetAddress',
      postalAddress: 'postalAddress',
      emailAddress: 'emailAddress',
      phoneNumber: 'phoneNumber',
      contactInfoImage: 'contactInfoImage'
    },
    prepare(selection) {
      const { streetAddress, postalAddress, emailAddress, phoneNumber, contactInfoImage } = selection;
      return {
        title: 'Contact Information',
        media: contactInfoImage,
      };
    },
  },
});