import Image from "next/image";
import Link from "next/link";

import {
  PRACTITIONER_PHOTO_HEIGHT,
  PRACTITIONER_PHOTO_WIDTH,
  urlForPractitionerPhoto,
} from "@/sanity/lib/image";

/**
 * The team card, used in three places. CH-104.
 *
 * The team hub, the practitioner block on a service page, and anywhere else a
 * person needs to be shown. One component, because the mockup is explicit
 * that all three are the same card: same photo treatment, same grayscale
 * hover, same credential list, same footer link.
 *
 * THE PHOTO IS FIXED AT ONE SIZE, ON PURPOSE
 *
 * The seven source images are different shapes, from 3001x3001 to 3920x5593,
 * and rendering them at their natural ratio gave a grid of seven different
 * card heights. The frame is a fixed 4:5 with object-cover, so every card is
 * identical and the crop takes the difference. The requested width is 720,
 * which is double the widest the card is ever painted, so the photo stays
 * sharp on a 2x screen.
 *
 * Only the link label changes between the two contexts, because the mockup
 * says "Learn More" on the team hub and "View Profile" on a service page.
 */
export type PractitionerCardData = {
  name?: string | null;
  slug?: string | null;
  credentials?: Array<string> | null;
  photo?:
    | ({ url?: string | null; alt?: string | null } & Record<string, any>)
    | null;
};

export function PractitionerCard({
  person,
  label = "Learn More",
}: {
  person: PractitionerCardData;
  label?: string;
}) {
  if (!person?.slug || !person.name) return null;

  return (
    <Link
      href={`/about/our-team/${person.slug}`}
      className="group flex h-full flex-col border border-border bg-white"
    >
      <div className="aspect-[4/5] w-full overflow-hidden">
        {person.photo?.url ? (
          <Image
            src={
              urlForPractitionerPhoto(person.photo as never) || person.photo.url
            }
            alt={person.photo.alt || person.name}
            width={PRACTITIONER_PHOTO_WIDTH}
            height={PRACTITIONER_PHOTO_HEIGHT}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 90vw"
            className="h-full w-full object-cover grayscale transition-all duration-300 group-hover:grayscale-0"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="space-y-1">
          <p className="text-xl font-light text-primary">{person.name}</p>
          {person.credentials?.length ? (
            /*
             * One credential per line, as the mockup shows and as the old
             * card did. Joining them with commas reads as a single long
             * qualification rather than as four separate ones.
             */
            <ul className="space-y-0.5 text-sm font-light text-muted-foreground">
              {person.credentials.map((credential) => (
                <li key={credential}>{credential}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <span className="mt-auto flex items-center justify-between pt-4 text-base font-medium text-primary group-hover:underline">
          {label}
          <span aria-hidden="true" className="text-lg">
            &rsaquo;
          </span>
        </span>
      </div>
    </Link>
  );
}

/** The grid the cards sit in, so all three places space them identically. */
export function PractitionerGrid({
  practitioners,
  label,
}: {
  practitioners: PractitionerCardData[];
  label?: string;
}) {
  if (!practitioners?.length) return null;

  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {practitioners.map((person) => (
        <li key={person.slug} className="flex">
          <PractitionerCard person={person} label={label} />
        </li>
      ))}
    </ul>
  );
}
