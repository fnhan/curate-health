import Image from "next/image";
import Link from "next/link";

import { ChevronRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * The practitioner card for the "Practitioners offering this service" block on
 * treatment pages, per page 1 of the approved mockup. CH-104.
 *
 * The team hub does not use this. It runs the component that was live before
 * #238, restored from git at Frank's direction, in
 * app/about/our-team/team-members-section.tsx. This card copies that design
 * (the Card, the 300px grayscale photo, the credentials list and the Learn More
 * row) so a service page and the team page look like the same system.
 *
 * The label varies by where it appears: "View Profile" on a service page.
 */
export type PractitionerCardData = {
  name?: string | null;
  slug?: string | null;
  credentials?: Array<string> | null;
  photo?:
    | ({
        url?: string | null;
        alt?: string | null;
        hotspot?: { x?: number; y?: number } | null;
      } & Record<string, unknown>)
    | null;
};

const teamPhotoClassName =
  "h-full w-full object-cover grayscale transition-all duration-300 hover:cursor-pointer hover:grayscale-0";

export function PractitionerCard({
  person,
  label = "Learn More",
}: {
  person: PractitionerCardData;
  label?: string;
}) {
  if (!person?.slug || !person.name) return null;

  const hotspot = person.photo?.hotspot;
  const objectPosition =
    hotspot && typeof hotspot.x === "number" && typeof hotspot.y === "number"
      ? `${hotspot.x * 100}% ${hotspot.y * 100}%`
      : undefined;

  return (
    <Link href={`/about/our-team/${person.slug}`} className="block">
      <Card className="flex min-h-[580px] w-full flex-col rounded-none">
        <div className="h-[300px]">
          {person.photo?.url ? (
            <Image
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 90vw"
              className={teamPhotoClassName}
              style={objectPosition ? { objectPosition } : undefined}
              src={person.photo.url}
              alt={person.photo.alt || person.name}
              width={400}
              height={400}
            />
          ) : null}
        </div>
        <CardHeader className="flex-1">
          <CardTitle className="font-light not-italic">{person.name}</CardTitle>
          {person.credentials?.length ? (
            <div className="text-sm text-muted-foreground">
              <div className="prose text-sm [&_li]:my-0 [&_li]:p-0 [&_ul]:m-0 [&_ul]:list-none [&_ul]:p-0">
                <ul>
                  {person.credentials.map((credential) => (
                    <li key={credential}>{credential}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </CardHeader>
        <CardContent>
          <span className="flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline">
            {label}
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}

/**
 * The grid for a service page's "Practitioners offering this service" block.
 *
 * The classes are the ones the original team section used for its no-script
 * fallback, so the block sits in the same visual system as the team page:
 * three across, and a service with one provider shows one card rather than a
 * card stretched across the page.
 */
export function PractitionerGrid({
  practitioners,
  label,
}: {
  practitioners: PractitionerCardData[];
  label?: string;
}) {
  if (!practitioners?.length) return null;

  return (
    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
      {practitioners.map((person) => (
        <PractitionerCard key={person.slug} person={person} label={label} />
      ))}
    </div>
  );
}
