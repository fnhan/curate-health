import Image from "next/image";
import Link from "next/link";

import { ChevronRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * The team card, exactly as it was before the accordion came out. CH-104.
 *
 * Restored from the component that shipped before #238, not redrawn. The
 * approved mockup says it in as many words: cards stay exactly as they are,
 * design, order and spacing unchanged, and the one change is that the card
 * wrapper becomes a link and the accordion is removed. A first pass at this
 * rebuilt the card as a lookalike with a different photo frame, no Card
 * component and a different footer row, and it read as a redesign because it
 * was one.
 *
 * So everything here is the original markup and classes: the Card, the fixed
 * 300px photo in grayscale that colours on hover, the name in CardTitle, the
 * credentials one per line in the same prose wrapper, and the footer row with
 * the accordion trigger's own classes. Only three things differ, and none of
 * them is visible at rest:
 *
 *   The footer row is part of a link rather than a button that opened a bio,
 *   and its chevron points right, as the mockup draws it, because a down
 *   arrow on a link promises something opening in place.
 *
 *   The credentials sit in a div carrying CardDescription's classes rather
 *   than in CardDescription itself. That renders a paragraph, and the list
 *   inside it made invalid HTML the browser silently rearranged.
 *
 *   The photo takes its alt text from the record instead of the person's
 *   name, and honours a hotspot when one is set in the Studio. None is set
 *   today, so the crop is the original centre crop until someone drags one.
 *
 * The label is the only thing that varies by where the card appears: "Learn
 * More" on the team page, "View Profile" on a service page.
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
