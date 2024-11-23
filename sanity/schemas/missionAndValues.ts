import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'missionAndValues',
  title: 'Mission and Values',
  type: 'document',
  fields: [
    defineField({
      name: 'headerImage',
      title: 'Mission and Values Header Image',
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
      name: 'purposeImage',
      title: 'Purpose Image',
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
      name: 'purposeTitle',
      title: 'Purpose Title',
      type: 'string',
      description: 'Title of purpose section on page',
    }),
    defineField({
      name: 'purposeTextContent',
      title: 'Purpose Text Content',
      type: 'string',
      description: 'Text content of purpose section on page',
    }),
    defineField({
      name: 'missionImage',
      title: 'Mission Image',
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
      name: 'missionTitle',
      title: 'Mission Title',
      type: 'string',
      description: 'Title of Mission section on page',
    }),
    defineField({
      name: 'missionTextContent',
      title: 'Mission Text Content',
      type: 'string',
      description: 'Text content of Mission section on page',
    }),
    defineField({
      name: 'visionImage',
      title: 'Vision Image',
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
      name: 'visionTitle',
      title: 'Vision Title',
      type: 'string',
      description: 'Title of vision section on page',
    }),
    defineField({
      name: 'visionTextContent',
      title: 'Vision Text Content',
      type: 'string',
      description: 'Text content of vision section on page',
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