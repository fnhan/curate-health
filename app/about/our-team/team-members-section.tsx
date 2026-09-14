"use client";

import Masonry from "react-masonry-css";

import { PractitionerCard } from "@/components/shared/practitioner-card";
import { TEAM_PAGE_QUERYResult } from "@/sanity.types";

/**
 * The team grid, restored. CH-104.
 *
 * The same section, the same Masonry layout at three, two and one columns, the
 * same spacing, and the same order. The only change from before #238 is inside
 * the card: its footer is a link to the practitioner's page instead of an
 * accordion holding their bio.
 *
 * The bio in the accordion was the whole problem. It shipped with
 * data-state="closed", so seven people's training and experience sat in the
 * markup and counted for nothing: 203 visible words for the whole team page.
 * The card around it was never the problem, and a first attempt at this
 * redrew it anyway.
 *
 * The order comes from ourTeam.practitioners, the drag-to-reorder list set in
 * #205, not from sorting by name. Sorting by name is what #238 did, and it
 * moved Safa ahead of Dr. Gabriele and Andrew ahead of Ariel on a page whose
 * order had been chosen.
 *
 * useSearchParams and the Suspense wrapper are gone with the accordion. They
 * existed only to open a bio when a link arrived with ?member=, and those links
 * now go straight to the practitioner page.
 */
type Practitioner = NonNullable<TEAM_PAGE_QUERYResult["practitioners"]>[number];

const breakpointColumns = {
  default: 3,
  1023: 2,
  767: 1,
};

export function TeamMembersSection({
  practitioners,
}: {
  practitioners: Practitioner[];
}) {
  const visible = (practitioners ?? []).filter(
    (person) => person?.isActive && person.slug && person.name
  );

  if (!visible.length) return null;

  return (
    <section className="bg-white pb-24 pt-12 text-primary md:pb-28 md:pt-14 2xl:pb-40 2xl:pt-20">
      <Masonry
        breakpointCols={breakpointColumns}
        className="container flex"
        columnClassName="ml-4 flex flex-col gap-4"
      >
        {visible.map((person) => (
          <PractitionerCard
            key={person.slug}
            person={person}
            label="Learn More"
          />
        ))}
      </Masonry>
    </section>
  );
}

export default TeamMembersSection;
