import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'popup',
  title: 'Pop-up banner',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Apt title that tells what the banner is about',
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      description:
        'Toggle to show/hide this banner on the website. Choose one document to toggle off from the list',
      initialValue: false,
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'blockContent',
    }),
  ],
});
