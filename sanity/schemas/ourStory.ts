import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'ourStory',
  title: 'Our Story',
  type: 'document',
  fields: [
    defineField({
      name: 'headerBgImage',
      title: 'Our Story Header Background Image',
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
      description: 'Title of header section on page',
    }),
    defineField({
      name: 'headerTitleDesktop',
      title: 'Header Title Desktop',
      type: 'string',
      description: 'Title of header section on desktop version of page',
    }),
    defineField({
      name: 'headerSubtitle',
      title: 'Header Subtitle',
      type: 'string',
      description: 'Subtitle of header section on page',
    }),
    defineField({
      name: 'headerSubtitleDesktop',
      title: 'Header Subtitle Desktop',
      type: 'string',
      description: 'Subtitle of header section on desktop version of page',
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
      name: 'sectionOneTitle',
      title: 'Title of Section One',
      type: 'string',
      description: 'The title of section one',
    }),
    defineField({
      name: 'sectionOneTextContent',
      title: 'Section One Text Content',
      type: 'string',
      description: 'The text content of section one',
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
      description: 'The text content of section two',
    }),
    defineField({
      name: 'sectionThreeImage',
      title: 'Section Three Image',
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
      name: 'sectionThreeTitle',
      title: 'Title of Section Three',
      type: 'string',
      description: 'The title of section three',
    }),
    defineField({
      name: 'sectionThreeTextContent',
      title: 'Section Three Text Content',
      type: 'string',
      description: 'The text content of section three',
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
    defineField({
      name: 'sectionFourTextContent',
      title: 'Section Four Text Content',
      type: 'string',
      description: 'The text content of section four',
    }),
    defineField({
      name: 'sectionFiveImage',
      title: 'Section Five Image',
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
      name: 'sectionFiveTitle',
      title: 'Title of Section Five',
      type: 'string',
      description: 'The title of section five',
    }),
    defineField({
      name: 'sectionFiveTextContent',
      title: 'Section Five Text Content',
      type: 'string',
      description: 'The text content of section five',
    }),
    defineField({
      name: 'sectionSixImage',
      title: 'Section Six Image',
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
      name: 'sectionSixTitle',
      title: 'Title of Section Six',
      type: 'string',
      description: 'The title of section five',
    }),
    defineField({
      name: 'sectionSixTextContent',
      title: 'Section Six Text Content',
      type: 'string',
      description: 'The text content of section Six',
    }),
    defineField({
      name: 'sectionSevenBgImage',
      title: 'Section Seven Background Image',
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
      name: 'SectionSevenTitle',
      title: 'Section Seven Title',
      type: 'string',
      description: 'Title of section seven',
    }),
    defineField({
      name: 'SectionSevenTextContent',
      title: 'Section Seven Text Content',
      type: 'string',
      description: 'Text content of section seven',
    }),
    defineField({
      name: 'sectionSevenCta',
      title: 'Section Seven Call To Action',
      type: 'string',
      description: 'Call to action statement of section seven',
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