import { defineField, defineType } from "sanity";

import { fieldDescriptions } from "../schema-helpers";

/**
 * A practitioner, as their own document.
 *
 * Until now the bios lived as array items inside the single "About | Our Team
 * Page" document. Array items cannot be referenced from other documents, which
 * is why the blog author type links to a team member by typing their name into
 * a string field rather than pointing at them. Giving each person a document
 * makes them referenceable, which is what lets a service page list who provides
 * it without copying credentials onto every page.
 *
 * Deliberately absent, per the restructure brief:
 *
 *   Registration number. It belongs on a receipt, not a public page.
 *   Availability. That lives in Jane and would go stale here immediately.
 *   Short bio. No such copy exists for anyone, and Frank chose on 2026-09-07
 *   to drop the field rather than have one written. Cards show name and
 *   credentials.
 *
 * SERVICES OFFERED IS NOT A FIELD HERE, AND SHOULD NOT BECOME ONE
 *
 * Each treatment already carries a `practitioners` list saying who provides
 * it. The services a practitioner offers is the same relationship read from
 * the other end, so the page asks "which treatments reference this person"
 * rather than storing a second copy:
 *
 *   *[_type == "treatments" && isActive == true && references(^._id)]
 *
 * A field here would be the same fact typed in two places. The moment someone
 * adds a practitioner to a service page and forgets to come back here, the two
 * disagree and there is no way to tell which is right. Editing the service
 * page's practitioner list stays the single place this is controlled, and the
 * practitioner page follows automatically.
 *
 * THE BOOKING BUTTON DESTINATION IS A CHOICE, NOT A URL, FOR THE SAME REASON
 *
 * `bookingCtaTarget` picks from a list. The page resolves the actual link at
 * render time from `serviceLifestyle.referral_form_pdf`, which is the same
 * asset the Curate Lifestyle page already serves and which `serviceLifestyle`,
 * `serviceLifestyleProgram` and `ourPrograms` all reference today.
 *
 * Storing the CDN URL here instead would make a fourth copy. Sanity mints a
 * new URL when a file is replaced, so the day someone uploads a new version of
 * the referral form, three pages would update and this one would quietly keep
 * serving the old PDF. A referral form is the wrong thing to be silently stale.
 */
export default defineType({
  name: "practitioner",
  title: "Shared | Practitioners",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description:
        "As it should appear on the page, including any title. For example, Dr. Frank Nhan.",
      validation: (Rule) => Rule.required().error("A name is required"),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description:
        "Used to build the page address, /about/our-team/{slug}. Generated from the name, but editable. Changing it after the page is live breaks any existing link to it, so it needs a redirect.",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error("A slug is required"),
    }),
    defineField({
      name: "isActive",
      title: "Is Active",
      type: "boolean",
      description:
        "Untick to remove this person from the team page, from every service page, and from their own page, without editing any of those pages.",
      initialValue: true,
      validation: (Rule) =>
        Rule.required().error("Is Active status is required"),
    }),
    // No display order field, deliberately. Order is set by dragging, in the
    // reference list on "About | Our Team Page", exactly as the old embedded
    // list worked. A number field here would mean editing seven documents to
    // move one person, and would silently fight the drag order.
    //
    // Each service page carries its own practitioners list, so a service can
    // order its providers differently from the team page without any conflict.
    defineField({
      name: "credentials",
      title: "Credentials",
      type: "array",
      of: [{ type: "string" }],
      description:
        "One credential per entry, in the order they should be listed. For example, Doctor of Chiropractic, then Acupuncture Provider. These are shown verbatim, so they must match what the practitioner is entitled to use.",
      validation: (Rule) =>
        Rule.required().min(1).error("At least one credential is required"),
    }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative Text",
          type: "string",
          description: fieldDescriptions.altImageDescription,
          validation: (Rule) =>
            Rule.required().error("Alternative text is required"),
        }),
      ],
    }),
    defineField({
      name: "fullBio",
      title: "Full Bio",
      type: "blockContent",
      description:
        "The biography shown on this practitioner's own page. Migrated verbatim from the old team page.",
    }),
    defineField({
      name: "languages",
      title: "Languages",
      type: "array",
      of: [{ type: "string" }],
      description:
        "Languages this practitioner can treat in. One per entry, in the order they should be listed. Leave empty and the section is left off the page rather than showing an empty heading.",
      validation: (Rule) =>
        Rule.unique().error("That language is listed twice"),
    }),
    defineField({
      name: "commonlyTreats",
      title: "Commonly Treats",
      type: "array",
      of: [{ type: "string" }],
      description:
        "Conditions and presentations this practitioner sees often. One per entry. Keep these to what the practitioner actually treats: everything here reads as a clinical claim, so it needs their sign-off, not a guess from their bio. Leave empty and the section is left off the page.",
      validation: (Rule) => Rule.unique().error("That entry is listed twice"),
    }),
    // No "Services Offered" field, deliberately. See the note at the bottom of
    // this file: it is derived from the service pages rather than typed twice.
    defineField({
      name: "janeBookingUrl",
      title: "Jane Booking URL",
      type: "url",
      description:
        "This practitioner's own Jane page, for example https://curatehealth.janeapp.com/#/staff_member/1. Leave empty for anyone without a Jane profile, and the booking button is omitted rather than pointing somewhere generic.",
      validation: (Rule) =>
        Rule.uri({ scheme: ["https"] }).error(
          "Must be a full https URL, or empty"
        ),
    }),
    defineField({
      name: "bookingNote",
      title: "Booking Note",
      type: "text",
      rows: 3,
      description:
        "Shown in place of the booking button when Jane Booking URL is empty. Explains how someone reaches this practitioner instead. Dr. Leong is the current case: he is not publicly bookable and patients come through the Curate Lifestyle Program. Leave both this and the Jane URL empty and the whole block is omitted.",
    }),
    defineField({
      name: "bookingCtaLabel",
      title: "Booking Button Label",
      type: "string",
      description:
        "Text on the button shown with the Booking Note, for example Curate Lifestyle Referral Form. Ignored when a Jane Booking URL is set, since that button reads Book with {name}.",
    }),
    defineField({
      name: "bookingCtaTarget",
      title: "Booking Button Destination",
      type: "string",
      description:
        "Where the button goes. Chosen from a list rather than typed as a link so that replacing the referral form on the Curate Lifestyle page updates this button too, instead of leaving it pointing at the old file.",
      options: {
        list: [
          {
            title: "Curate Lifestyle referral form (the PDF)",
            value: "curateLifestyleReferralForm",
          },
          {
            title: "Curate Lifestyle program page",
            value: "curateLifestyleProgram",
          },
        ],
        layout: "radio",
      },
    }),
    // Not in the restructure brief's field list, added deliberately. Every
    // other document type that backs a page carries this, and without it the
    // seven new practitioner pages would ship with no title and no meta
    // description, which is the defect CH-024 exists to fix. Optional, so it
    // does not block the migration.
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
  ],
  orderings: [
    {
      title: "Name",
      name: "nameAsc",
      by: [{ field: "name", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "name",
      credentials: "credentials",
      isActive: "isActive",
      media: "photo",
    },
    prepare({ title, credentials, isActive, media }) {
      const first = Array.isArray(credentials) ? credentials[0] : null;

      return {
        title: isActive === false ? `${title} (hidden)` : title,
        subtitle: first || "No credentials set",
        media,
      };
    },
  },
});
