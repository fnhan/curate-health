import Image from "next/image";
import Link from "next/link";

import { ArrowRightIcon } from "lucide-react";

import { TEAM_PAGE_QUERYResult } from "@/sanity.types";

/**
 * The team grid. CH-104.
 *
 * This used to be a client component rendering an accordion per person, with
 * the bio inside it. Three things were wrong with that, and only the first is
 * a design opinion.
 *
 * The bios shipped with data-state="closed", so the whole team page carried
 * 203 words of visible text. Seven people's training and experience existed in
 * the markup and counted for nothing.
 *
 * Nobody had a URL. A search for any practitioner by name had nowhere to land,
 * and nothing on the site could link to a specific person.
 *
 * And it read teamMembers, an array inside the ourTeam document, which is a
 * second copy of the seven practitioner records. Arrays cannot be referenced
 * or addressed, which is why they were migrated out in #205.
 *
 * A card is now a link to that person's page. No accordion, no client
 * JavaScript, and the bio lives somewhere a crawler can read it.
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
        <ul className="grid gap-px border border-secondary bg-secondary sm:grid-cols-2 lg:grid-cols-3">
          {practitioners.map((person) => (
            <li key={person.slug} className="bg-white">
              <Link
                href={`/about/our-team/${person.slug}`}
                className="group flex h-full flex-col transition-colors duration-300 hover:bg-platinum focus-visible:bg-platinum"
              >
                {person.photo?.url ? (
                  <Image
                    src={person.photo.url}
                    alt={person.photo.alt || person.name || ""}
                    width={640}
                    height={800}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="aspect-[4/5] w-full object-cover"
                  />
                ) : null}
                <div className="flex flex-1 flex-col gap-2 p-6">
                  <span className="flex items-center gap-2 text-lg font-medium text-primary group-hover:underline">
                    {person.name}
                    <ArrowRightIcon
                      size={16}
                      aria-hidden="true"
                      className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </span>
                  {person.credentials?.length ? (
                    <span className="text-pretty text-sm font-light leading-6 text-primary/75">
                      {person.credentials.join(", ")}
                    </span>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default TeamMembersSection;
