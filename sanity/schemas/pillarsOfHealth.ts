import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'pillarsOfHealth',
  title: 'Pillars of Health',
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
      name: 'pageTitle',
      title: 'Title of Page',
      type: 'string',
      description: 'Title of header section on page',
    }),
    defineField({
      name: 'mentalHealthTitle',
      title: 'Title of Mental Health Pillar',
      type: 'string',
      description: 'The title of mental health pillar',
    }),
    defineField({
      name: 'mentalHealthTextContent',
      title: 'Mental Health Text Content',
      type: 'string',
      description: 'The text content of mental health pillar',
    }),
    defineField({
      name: 'emotionalHealthTitle',
      title: 'Title of Emotional Health Pillar',
      type: 'string',
      description: 'The title of emotional health pillar',
    }),
    defineField({
      name: 'emotionalHealthTextContent',
      title: 'Emotional Health Text Content',
      type: 'string',
      description: 'The text content of emotional health pillar',
    }),
    defineField({
      name: 'socialHealthTitle',
      title: 'Title of Social Health Pillar',
      type: 'string',
      description: 'The title of social health pillar',
    }),
    defineField({
      name: 'socialHealthTextContent',
      title: 'Social Health Text Content',
      type: 'string',
      description: 'The text content of social health pillar',
    }),
    defineField({
      name: 'spiritualHealthTitle',
      title: 'Title of Spiritual Health Pillar',
      type: 'string',
      description: 'The title of spiritual health pillar',
    }),
    defineField({
      name: 'spiritualHealthTextContent',
      title: 'Spiritual Health Text Content',
      type: 'string',
      description: 'The text content of spiritual health pillar',
    }),
    defineField({
      name: 'physicalHealthTitle',
      title: 'Title of Physical Health Pillar',
      type: 'string',
      description: 'The title of physical health pillar',
    }),
    defineField({
      name: 'physicalHealthTextContent',
      title: 'Physical Health Text Content',
      type: 'string',
      description: 'The text content of physical health pillar',
    }),

  ],

  preview: {
    select: {
      pageTitle: 'pageTitle',
      headerBgImage: 'headerBgImage',
      mentalHealthTitle: 'mentalHealthTitle',
      mentalHealthTextContent: 'mentalHealthTextContent',
      emotionalHealthTitle: 'emotionalHealthTitle',
      emotionalHealthTextContent: 'emotionalHealthTextContent',
      socialHealthTitle: 'socialHealthTitle',
      socialHealthTextContent: 'socialHealthTextContent',
      spiritualHealthTitle: 'spritualHealthTitle',
      spiritualHealthTextContent: 'spiritualHealthTextContent',
      physicalHealthTitle: 'physicalHealthTitle',
      physicalHealthTextContent: 'physicalHealthTextContent',
    },
    prepare(selection) {
      const { 
        pageTitle, headerBgImage, mentalHealthTitle, mentalHealthTextContent, emotionalHealthTitle,
        emotionalHealthTextContent, socialHealthTitle, socialHealthTextContent, spiritualHealthTitle, spiritualHealthTextContent,
        physicalHealthTitle, physicalHealthTextContent 
      } = selection;
      return {
        title: 'Pillars of Health',
        media: headerBgImage,
      };
    },
  },
});