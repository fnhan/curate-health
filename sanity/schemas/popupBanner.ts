import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'popup',
  title: 'Popup-Banner',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Apt title that tells what the banner is about',
      initialValue: false,
    }),
    defineField({
      name: 'isVisible',
      title: 'Is Active',
      type: 'boolean',
      description: 'Toggle to show/hide this banner on the website.',
      initialValue: false,
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'blockContent',
    }),
  ],
});
