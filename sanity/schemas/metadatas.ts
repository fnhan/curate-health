import { defineField, defineType } from 'sanity';

export default defineType({
  title: 'The MetaDatas',
  name: 'metadatas',
  type: 'document',
  fields: [
    defineField({
      name: 'datas',
      type: 'array',
      filter: 'true',
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
    defineField({
      name: 'meta',
      type: 'object',
      fields: [
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
    }),
  ],
  preview: {
    select: {
      title: 'title.title',
    },
  },
});
