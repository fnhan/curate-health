import { defineField, defineType } from "sanity";

import { getBlogAuthorDisplayName } from "@/lib/author-team-link";

import TeamMemberNameSelect from "../components/TeamMemberNameSelect";

export default defineType({
  name: "author",
  title: "Blog | Author",
  type: "document",
  fields: [
    defineField({
      name: "linkedTeamMemberName",
      title: "Name & Our Team link",
      type: "string",
      description:
        "This is the byline name and controls the Our Team link. Pick a person from About → Our Team, “Curate Health Team” for the team page only, or “None” for a photo-only / unlinked author.",
      components: {
        input: TeamMemberNameSelect,
      },
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
  ],
  preview: {
    select: {
      linkedTeamMemberName: "linkedTeamMemberName",
      media: "image",
    },
    prepare({ linkedTeamMemberName, media }) {
      const title =
        getBlogAuthorDisplayName(linkedTeamMemberName) || "Author";
      return { title, media };
    },
  },
});
