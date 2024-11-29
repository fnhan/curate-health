import { defineField, defineType } from "sanity";

export default defineType({
  name: "popupBanner",
  title: "Shared | Popup banner",
  type: "document",
  fields: [
    defineField({
      name: "isActive",
      title: "Is Active",
      type: "boolean",
      description: "Toggle to show/hide this banner on the website.",
      initialValue: false,
    }),
    defineField({
      name: 'title',
      title: 'Popup Title',
      type: 'string',
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "blockContent",
    }),
  ],
});
