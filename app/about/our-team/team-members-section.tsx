import { PractitionerGrid } from "@/components/shared/practitioner-card";
import { TEAM_PAGE_QUERYResult } from "@/sanity.types";

/**
 * The team grid. CH-104.
 *
 * The design is the one that was already here: same cards, same order, same
 * grayscale photo that colours on hover, credentials one per line, "Learn
 * More" at the foot. The only change is what that footer does. It used to
 * open an accordion holding the bio; it is now a link to the person's page.
 *
 * That matters more than it sounds. The bios shipped inside accordions
 * carrying data-state="closed", which left the whole team page at 203 visible
 * words for seven people. The words were always in the markup and counted for
 * nothing.
 *
 * A first attempt at this redrew the card, and it should not have. The card
 * was not the problem.
 */
type Practitioner = NonNullable<TEAM_PAGE_QUERYResult["practitioners"]>[number];

export function TeamMembersSection({
  practitioners,
}: {
  practitioners: Practitioner[];
}) {
  if (!practitioners?.length) return null;

  return (
    <section className="bg-white pb-20 md:pb-28">
      <div className="container">
        <PractitionerGrid practitioners={practitioners} label="Learn More" />
      </div>
    </section>
  );
}

export default TeamMembersSection;
