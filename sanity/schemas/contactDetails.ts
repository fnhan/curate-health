import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'contactDetails',
  title: 'Contact Details',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Contact Details Title',
      type: 'blockContent',
      description: 'Heading text for the Contact Details section',
    }),
    defineField({
      name: 'monHours',
      title: 'Monday Hours',
      type: 'blockContent',
      description: 'The Monday opening hours',
    }),
    defineField({
      name: 'tuesHours',
      title: 'Tuesday Hours',
      type: 'blockContent',
      description: 'The Tuesday opening hours',
    }),
    defineField({
      name: 'wedHours',
      title: 'Wednesday Hours',
      type: 'blockContent',
      description: 'The Wednesday opening hours',
    }),
    defineField({
      name: 'thursHours',
      title: 'Thursday Hours',
      type: 'blockContent',
      description: 'The Thursday opening hours',
    }),
    defineField({
      name: 'friHours',
      title: 'Friday Hours',
      type: 'blockContent',
      description: 'The Friday opening hours',
    }),
    defineField({
      name: 'satHours',
      title: 'Saturday Hours',
      type: 'blockContent',
      description: 'The Saturday opening hours',
    }),
    defineField({
      name: 'sunHours',
      title: 'Sunday Hours',
      type: 'blockContent',
      description: 'The Sunday opening hours',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      monHours: 'monHours',
      tuesHours: 'tuesHours',
      wedHours: 'wedHours',
      thursHours: 'thursHours',
      friHours: 'friHours',
      satHours: 'satHours',
      sunHours: 'sunHours',

    },
    prepare(selection) {
      const { title, monHours, tuesHours, wedHours, thursHours, friHours, satHours, sunHours } = selection;
      return {
        title: 'Contact Details',
      };
    },
  },
});