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
        defineField({
          name: 'metas',
          type: 'object',
          fields: [
            {
              title: 'Slug',
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
          preview: {
            select: {
              title: 'slug.current', // Select the slug field
              subtitle: 'description',
            },
            prepare(selection) {
              const { title, subtitle } = selection;
              return {
                title: `Slug: ${title}`, // Customize the preview title
                subtitle: `Desc: ${subtitle}`,
              };
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
});
