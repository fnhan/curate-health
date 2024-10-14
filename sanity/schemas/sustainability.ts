import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'sustainability',
  title: 'Sustainability Page',
  type: 'document',
  fields: [
    defineField({
      name: 'headerTopImage',
      title: 'Sustainability Header Top Image',
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
      name: 'headerBottomImage',
      title: 'Sustainability Header Bottom Image',
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
      name: 'headerTitle',
      title: 'Header Title',
      type: 'string',
      description: 'Title of Sustainability page',
    }),
    defineField({
      name: 'headerTextContent',
      title: 'Header Text Content',
      type: 'string',
      description: 'Text content of header section on page',
    }),
    defineField({
      name: 'sectionOneImage',
      title: 'Section One Image',
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
      name: 'sectionTwoImage',
      title: 'Section Two Image',
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
      name: 'sectionTwoTextContent',
      title: 'Section Two Text Content',
      type: 'string',
      description: 'Text content of section two on page',
    }),
    defineField({
      name: 'sectionThreeTextContent',
      title: 'Section Three Text Content',
      type: 'string',
      description: 'Text content of section three on page',
    }),
    defineField({
      name: 'sectionFourImage',
      title: 'Section Four Image',
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

  ],

  // preview: {
  //   select: {
  //     streetAddress: 'streetAddress',
  //     postalAddress: 'postalAddress',
  //     emailAddress: 'emailAddress',
  //     phoneNumber: 'phoneNumber',
  //     contactInfoImage: 'contactInfoImage',
  //     hrefDirections: 'hrefDirections'
  //   },
  //   prepare(selection) {
  //     const { streetAddress, postalAddress, emailAddress, phoneNumber, contactInfoImage, hrefDirections } = selection;
  //     return {
  //       title: 'Our Story ',
  //       media: contactInfoImage,
  //     };
  //   },
  // },
});