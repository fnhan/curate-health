import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'siteMetadata',
  title: 'Site Metadata',
  type: 'document',
  fields: [
    defineField({
      name: 'homePageTitle',
      title: 'Home Page Meta Title',
      type: 'string',
      description:
        'The ideal length for a meta title is generally between 50-60 characters. This range ensures that your title is fully visible in search engine results without being truncated.',
      validation: (Rule) =>
        Rule.required()
          .max(60)
          .error('Meta title should be less than 60 characters'),
    }),
    defineField({
      name: 'templateTitlePrefix',
      title: 'Meta Template Title Prefix',
      type: 'string',
      description: 'Prefix to add to the page title',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'defaultDescription',
      title: 'Default Meta Description',
      description:
        'Keep it brief. Meta descriptions should be around 155 to 160 characters long, although 100 characters is an excellent middle ground to ensure that your meta description is also mobile friendly',
      type: 'text',
      validation: (Rule) =>
        Rule.required()
          .max(160)
          .error('Meta description must be 160 characters or less'),
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
      description: 'Recommended size: 128x128px',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'socialMeta',
      title: 'Social Media Meta',
      type: 'socialMeta',
    }),
  ],
});
