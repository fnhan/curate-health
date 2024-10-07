import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'sustainability',
  title: 'Sustainability Page',
  type: 'document',
  fields: [
    defineField({
      name: 'headerImage',
      title: 'Sustainability Header Image',
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
      name: 'headerTitleDesktop',
      title: 'Header Title Desktop',
      type: 'string',
      description: 'Title of Sustainability page on desktop',
    }),
    defineField({
      name: 'headerTextContent',
      title: 'Header Text Content',
      type: 'string',
      description: 'Text content of header section on page',
    }),
    defineField({
      name: 'sectionOneTextContent',
      title: 'Section One Text Content',
      type: 'string',
      description: 'Text content of section one on page',
    }),
    defineField({
      name: 'sectionOneTitle',
      title: 'Section One Title',
      type: 'string',
      description: 'Title of section one',
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
      name: 'sectionTwoTitle',
      title: 'Section Two Title',
      type: 'string',
      description: 'Title of section two',
    }),
    defineField({
      name: 'sectionTwoTextContent',
      title: 'Section Two Text Content',
      type: 'string',
      description: 'Text content of section two on page',
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
      name: 'sectionThreeTitle',
      title: 'Section Three Title',
      type: 'string',
      description: 'Title of section three',
    }),
    defineField({
      name: 'sectionThreeTextContent',
      title: 'Section Three Text Content',
      type: 'string',
      description: 'Text content of section three on page',
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
      name: 'sectionFourTitle',
      title: 'Section Four Title',
      type: 'string',
      description: 'Title of section four',
    }),
    defineField({
      name: 'sectionFourTextContent',
      title: 'Section Four Text Content',
      type: 'string',
      description: 'Text content of section four on page',
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
      name: 'sectionFiveTitle',
      title: 'Section Five Title',
      type: 'string',
      description: 'Title of section five',
    }),
    defineField({
      name: 'sectionFiveTextContent',
      title: 'Section Five Text Content',
      type: 'string',
      description: 'Text content of section five on page',
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
      name: 'sectionSixTitle',
      title: 'Section Six Title',
      type: 'string',
      description: 'Title of section six',
    }),
    defineField({
      name: 'sectionSixTextContent',
      title: 'Section Six Text Content',
      type: 'string',
      description: 'Text content of section six on page',
    }),
    defineField({
      name: 'sectionSixSubtitleOne',
      title: 'Section six 1st bolded subtitle',
      type: 'string',
      description: 'Section six 1st bolded subtitle',
    }),
    defineField({
      name: 'sectionSixSubtitleOneText',
      title: 'Section six 1st subtitle text content',
      type: 'string',
      description: 'Text content of section six 1st subtitle',
    }),
    defineField({
      name: 'sectionSixSubtitleTwo',
      title: 'Section six 2nd bolded subtitle',
      type: 'string',
      description: 'Section six 2nd bolded subtitle',
    }),
    defineField({
      name: 'sectionSixSubtitleTwoText',
      title: 'Section six 2nd subtitle text content',
      type: 'string',
      description: 'Text content of section six 2nd subtitle',
    }),
    defineField({
      name: 'sectionSixSubtitleThree',
      title: 'Section six 3rd bolded subtitle',
      type: 'string',
      description: 'Section six 3rd bolded subtitle',
    }),
    defineField({
      name: 'sectionSixSubtitleThreeText',
      title: 'Section six 3rd subtitle text content',
      type: 'string',
      description: 'Text content of section six 3rd subtitle',
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
      name: 'sectionSevenTitle',
      title: 'Section Seven Title',
      type: 'string',
      description: 'Title of section seven',
    }),
    defineField({
      name: 'sectionSevenTextContent',
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
    defineField({
      name: 'ctaUrl',
      title: 'Call to action url',
      type: 'url',
      validation: Rule => Rule.uri({
        scheme: ['http', 'https', 'mailto', 'tel']
      }),
      description: 'url for CTA statement'
    }),
    defineField({
      name: 'sectionSevenEsg',
      title: 'Section Seven ESG report text',
      type: 'string',
      description: 'ESG report text',
    }),
    defineField({
      name: 'esgLink',
      title: 'ESG report document link',
      type: 'file',
      options: {
        accept: '.pdf, .docx', // Restrict file uploads to PDF files only
      },
      validation: (Rule) => Rule.required().error('A file (PDF or DOCX) is required'),
      description: 'ESG report file'
    })

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