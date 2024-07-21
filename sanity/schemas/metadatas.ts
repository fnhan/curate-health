import { defineField, defineType } from 'sanity';

export default defineType({
  title: 'The MetaDatas',
  name: 'metadatas',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
    }),
    defineField({
      name: 'datas',
      type: 'array',
      of: [
        {
          name: 'metas',
          type: 'object',
          fields: [
            {
              title: 'slug',
              name: 'slug',
              type: 'slug',
            },
            {
              title: 'Title',
              name: 'title',
              type: 'string',
            },
            {
              title: 'Description',
              name: 'description',
              type: 'string',
            },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
});
