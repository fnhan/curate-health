import { defineField, defineType } from "sanity";

/**
 * The class schedule, CH-107.
 *
 * Three classes run in the Recovery Sanctuary on a fixed weekly day and time,
 * and until this page there was nowhere on the site that said so. Two of them
 * had a treatment page describing what the class is for and neither said when
 * it is; Tai Chi had nothing at all. Somebody searching "tai chi Toronto" or
 * "yoga class Toronto" found no page of ours that answered them.
 *
 * ONE DOCUMENT, NOT ONE PER CLASS
 *
 * Same reasoning as cafeMenu. A class's description, photograph and benefits
 * already live on its treatment document; what is new here is a day, a time
 * and a length. Three more documents to hold three times would be three more
 * things to open when Jane changes, and three slugs for pages that already
 * exist.
 *
 * THE DAY AND TIME ARE STORED, NOT READ FROM JANE
 *
 * Jane has no public feed of a recurring class, and its openings API only
 * answers seven days at a time. Read ahead sixteen weeks on 2026-10-20 it
 * returned one Pilates opening and two Yoga ones, because Jane only holds the
 * next fortnight open. So a page built off Jane would publish a schedule that
 * runs out, and an Event with a date in the past is worse than no Event.
 *
 * What is published instead is the recurrence, which is what schema.org's
 * Schedule type is for: this class, this day, this time, every week. That
 * stays true between bookings. WHEN A CLASS MOVES IN JANE, MOVE IT HERE.
 * Nothing notices on its own.
 */
export default defineType({
  name: "classSchedule",
  title: "Classes | Schedule",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "The page's one h1.",
      validation: (Rule) => Rule.required().error("A title is required"),
    }),
    defineField({
      name: "heroImage",
      title: "Hero photograph",
      type: "image",
      options: { hotspot: true },
      description:
        "The photograph across the top. Left empty, the page uses the Recovery Sanctuary's own hero, so there is always one.",
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative text",
          description:
            "What the photograph shows. Describe the picture, not the page.",
        },
      ],
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "text",
      rows: 6,
      description:
        "The prose under the hero. Say where the classes run and what turning up is like, rather than describing the table below. This is the part an answer engine quotes. Blank lines separate paragraphs.",
    }),
    defineField({
      name: "note",
      title: "Standing note",
      type: "text",
      rows: 3,
      description:
        "Lines that apply to every class, shown under the intro. What to bring, what happens in bad weather. One per line.",
    }),
    defineField({
      name: "classes",
      title: "Classes",
      type: "array",
      of: [
        {
          type: "object",
          name: "scheduledClass",
          fields: [
            defineField({
              name: "treatment",
              title: "Treatment page",
              type: "reference",
              to: [{ type: "treatments" }],
              description:
                "The page that describes this class. Its title, photograph and description are used here, so nothing is written twice. Leave empty for a class with no page yet: it still appears in the schedule, as a name rather than a link.",
            }),
            defineField({
              name: "name",
              title: "Name",
              type: "string",
              description:
                "Only for a class with no treatment page. Ignored when one is set, so the two can never disagree.",
              hidden: ({ parent }) => Boolean(parent?.treatment),
            }),
            defineField({
              name: "summary",
              title: "Summary",
              type: "text",
              rows: 3,
              description:
                "One or two sentences, for a class with no treatment page to take a description from. Keep it to what the class is, not what it treats: anything clinical needs the practitioner's own sign-off.",
              hidden: ({ parent }) => Boolean(parent?.treatment),
            }),
            defineField({
              name: "dayOfWeek",
              title: "Day",
              type: "string",
              options: {
                list: [
                  { title: "Monday", value: "Monday" },
                  { title: "Tuesday", value: "Tuesday" },
                  { title: "Wednesday", value: "Wednesday" },
                  { title: "Thursday", value: "Thursday" },
                  { title: "Friday", value: "Friday" },
                  { title: "Saturday", value: "Saturday" },
                  { title: "Sunday", value: "Sunday" },
                ],
                layout: "dropdown",
              },
              validation: (Rule) => Rule.required().error("A day is required"),
            }),
            defineField({
              name: "startTime",
              title: "Start time",
              type: "string",
              description:
                "24 hour, as 09:00 or 18:00. The page shows it as 9:00 AM.",
              validation: (Rule) =>
                Rule.required()
                  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, { name: "24 hour time" })
                  .error("Use 24 hour time, for example 09:00 or 18:00"),
            }),
            defineField({
              name: "durationMinutes",
              title: "Length in minutes",
              type: "number",
              validation: (Rule) =>
                Rule.required()
                  .integer()
                  .min(5)
                  .max(300)
                  .error("Length in minutes is required"),
            }),
            defineField({
              name: "instructor",
              title: "Taught by",
              type: "reference",
              to: [{ type: "practitioner" }],
              description:
                "Shown beside the class and linked to their page. A practitioner switched off does not appear, so the schedule cannot name somebody the site has taken down.",
            }),
            defineField({
              name: "capacity",
              title: "Spaces",
              type: "number",
              description:
                "How many people the class takes. Left empty, nothing is said about it.",
              validation: (Rule) => Rule.min(1).max(100),
            }),
            defineField({
              name: "price",
              title: "Price",
              type: "number",
              description:
                "In dollars, numbers only, for one drop-in place. Left empty, no price is shown and none is published in the markup. Everything else on this site keeps pricing in Jane; a class is the exception only because the price is one fixed number per place.",
            }),
            defineField({
              name: "bookingUrl",
              title: "Booking link",
              type: "url",
              description:
                "The Jane link for this class. Left empty, the treatment page's own booking link is used. Open it in Jane rather than pasting an id: one pasted id turned out to be Cold Plunge.",
            }),
            defineField({
              name: "note",
              title: "Note",
              type: "string",
              description: "Optional line for this class alone, shown under it.",
            }),
          ],
          preview: {
            select: {
              treatmentTitle: "treatment.title",
              name: "name",
              day: "dayOfWeek",
              time: "startTime",
              who: "instructor.name",
            },
            prepare({ treatmentTitle, name, day, time, who }) {
              const bits = [day, time, who].filter(Boolean);
              return {
                title: treatmentTitle || name || "Untitled class",
                subtitle: bits.length ? bits.join("  ") : undefined,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
  ],

  preview: {
    select: { title: "title", classes: "classes", media: "heroImage" },
    prepare({ title, classes, media }) {
      const n = (classes || []).length;
      return {
        title: title || "Class Schedule",
        subtitle: `${n} class${n === 1 ? "" : "es"}`,
        media,
      };
    },
  },
});
