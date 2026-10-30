import Link from "next/link";
import { notFound } from "next/navigation";

import SectionHero from "@/components/shared/section-hero";
import SectionIntro, { toParagraphs } from "@/components/shared/section-intro";
import { SanityImage } from "@/components/shared/sanity-image";
import { isPaused, nextOccurrence } from "@/lib/class-dates";
import { externalLinkProps } from "@/lib/links";
import { HOVER_UNDERLINE_INLINE } from "@/lib/hover-underline";
import { buildPageMetadata } from "@/lib/page-metadata";
import { treatmentPath } from "@/lib/service-urls";
import {
  CLASS_SCHEDULE_PATH,
  JsonLdScript,
  buildClassScheduleJsonLd,
  buildClassScheduleListJsonLd,
  classAnchor,
  classPhoto,
  classTimeLabel,
  menuPrice,
} from "@/lib/structured-data";
import { CLASS_SCHEDULE_QUERY_RESULT } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import { CLASS_SCHEDULE_QUERY } from "@/sanity/lib/queries";

/**
 * The class schedule. CH-107.
 *
 * Three classes run in the Recovery Sanctuary every week on a fixed day, and
 * before this page nothing on the site said when any of them was. Two had a
 * treatment page describing what the class is for and neither gave a day or a
 * time; Tai Chi had no page at all, so a search for "tai chi Toronto" reached
 * nothing of ours.
 *
 * WHAT A READER CAME FOR IS THE FLAT FACTS
 *
 * The day, the time, how long it runs, who teaches it, how many people are in
 * it, and where to book. Those are the lines an answer engine quotes and the
 * questions the front desk fields, and they are all text in the HTML here, in
 * a definition list rather than a table, so each class reads as a block on a
 * phone instead of scrolling sideways.
 *
 * THE DAY AND TIME COME FROM THE STUDIO, NOT FROM JANE
 *
 * Jane has no public feed for a recurring class, and its openings API answers
 * only seven days at a time: read sixteen weeks ahead on 2026-10-20 it gave
 * one Pilates opening and two Yoga ones, because Jane holds about a fortnight
 * open. A page built off that would publish a schedule that runs out. So the
 * recurrence is stored, and WHEN A CLASS MOVES IN JANE IT HAS TO BE MOVED IN
 * THE STUDIO TOO. Nothing notices on its own.
 *
 * THE CLASSES ARE NOT RE-DESCRIBED HERE
 *
 * Each entry points at its treatment page, and takes its name, photograph and
 * description from it. There is deliberately no field holding a second copy of
 * a class's description, which is the mistake CH-025 spent a whole ticket
 * undoing for the address.
 */

const FALLBACK = {
  title: "Class Schedule",
  description:
    "Weekly yoga, Pilates and Tai Chi classes in the Recovery Sanctuary at Curate Health in Midtown Toronto. Day, time, teacher and how to book each one.",
};

type ScheduledClass = NonNullable<
  NonNullable<CLASS_SCHEDULE_QUERY_RESULT>["classes"]
>[number];

/**
 * "2026-12-02" to "Wednesday 2 December".
 *
 * Toronto, not the server's zone. A plain date read in UTC and formatted
 * anywhere west of it comes back a day early, which on this page would name
 * the wrong weekday beside a time.
 */
function longDate(ymd: string) {
  return new Date(`${ymd}T12:00:00Z`).toLocaleDateString("en-CA", {
    timeZone: "America/Toronto",
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** 50 to "50 minutes", 60 to "1 hour", 90 to "1 hour 30 minutes". */
function lengthLabel(minutes: number | null | undefined) {
  if (typeof minutes !== "number" || minutes <= 0) return null;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  const parts = [
    hours ? `${hours} hour${hours === 1 ? "" : "s"}` : null,
    rest ? `${rest} minutes` : null,
  ].filter(Boolean);

  return parts.join(" ");
}

/** One row of the schedule: the photograph, the facts, and the booking link. */
function ClassBlock({ entry }: { entry: ScheduledClass }) {
  const name = entry.name?.trim();

  if (!name) return null;

  const time = classTimeLabel(entry.startTime);
  // The entry own photograph, else its treatment page hero. Shared with the
  // Event markup so the two cannot name different pictures.
  const photo = classPhoto(entry);
  const length = lengthLabel(entry.durationMinutes);

  /*
   * The class's own page, where there is one that is switched on. A class
   * whose page is off, or whose category is, shows as a heading rather than a
   * link: the same reasoning as a practitioner with no Jane url getting the
   * note instead of a button, since a link into a 404 is worse than no link.
   */
  const page =
    entry.treatmentActive && entry.serviceSlug && entry.treatmentSlug
      ? treatmentPath(entry.serviceSlug, entry.treatmentSlug)
      : null;

  /*
   * A class on a break says so, and names the first class back rather than a
   * weekday it is not running on. The same `resumesOn` decides the date in
   * the Event markup, through the same two functions, so the line a reader
   * sees and the date Google reads cannot disagree.
   *
   * The whole reason this exists: the first version of the computed date
   * assumed every class runs every week and published a Pilates date four
   * weeks before the class was back.
   */
  const paused = isPaused(new Date(), entry.resumesOn);

  /*
   * `nextOccurrence` returns null for anything it cannot date, so a class
   * with an unusable day or time falls back to its weekday line rather than
   * taking the page down. That is not hypothetical: an earlier version threw
   * here and failed the prerender of the whole page on Vercel.
   */
  const back =
    paused && entry.dayOfWeek && entry.startTime
      ? (nextOccurrence(
          entry.dayOfWeek,
          entry.startTime,
          entry.startTime,
          new Date(),
          entry.resumesOn
        )?.startDate.slice(0, 10) ?? null)
      : null;

  const facts = [
    time
      ? {
          label: back ? "Back on" : "When",
          value: back
            ? `${longDate(back)}, ${time}`
            : `${entry.dayOfWeek}, ${time}`,
        }
      : null,
    length ? { label: "Length", value: length } : null,
    entry.instructor?.name
      ? {
          label: "Taught by",
          value: entry.instructor.name,
          href: entry.instructor.slug
            ? `/about/our-team/${entry.instructor.slug}`
            : null,
          note: entry.instructor.credentials?.[0] ?? null,
        }
      : null,
    typeof entry.capacity === "number"
      ? { label: "Spaces", value: `Up to ${entry.capacity}` }
      : null,
    /*
     * The price only when somebody has typed one in. Pricing lives in Jane
     * everywhere else on this site, so this field starts empty and nothing is
     * published in the markup until it is filled.
     */
    typeof entry.price === "number"
      ? { label: "Drop-in", value: `$${menuPrice(entry.price)}` }
      : null,
  ].filter(Boolean) as {
    label: string;
    value: string;
    href?: string | null;
    note?: string | null;
  }[];

  return (
    <li
      /*
       * The anchor the Event node publishes as its url, so a result pointing
       * at one class lands on that class rather than at the top of the list.
       * `scroll-mt` clears the sticky header.
       */
      id={classAnchor(name)}
      className="scroll-mt-28 border-t border-primary/15 pt-10 first:border-t-0 first:pt-0"
    >
      {/*
        A grid with a fixed first column rather than a flex row, so the
        picture cell is still there when a class has no picture.

        Tai Chi has none, because it has no treatment page to take one from,
        and with a flex row its heading started at the container edge while
        the other two started 328px in. Three headings on two different left
        edges reads as a mistake rather than as a class without a photograph.
        The empty cell costs some white space and keeps the scan line.

        One column below the medium breakpoint, where there is no second
        column to line up with.
      */}
      <div className="flex flex-col gap-8 md:grid md:grid-cols-[280px_1fr] md:gap-12">
        {photo?.url ? (
          (() => {
            const picture = (
              <SanityImage
                source={photo.source}
                src={photo.url}
                alt={photo.alt ?? ""}
                width={440}
                height={330}
                loading="lazy"
                sizes="(min-width: 768px) 280px, 100vw"
                className="h-[220px] w-full object-cover md:h-[210px]"
              />
            );

            if (!page) return picture;

            /*
             * The photograph opens the class's page, the same as its name
             * above. Frank asked for it on 2026-10-24, and it is the rule
             * already set for a blog card on 2026-10-12.
             *
             * It adds no keyboard stop and is hidden from a screen reader,
             * because the heading beside it already reaches the same page
             * and already names the class. Two tab stops to one destination
             * rather than four.
             */
            return (
              <Link
                href={page}
                tabIndex={-1}
                aria-hidden
                className="block overflow-hidden"
              >
                {picture}
              </Link>
            );
          })()
        ) : (
          <div aria-hidden className="hidden md:block" />
        )}

        <div className="flex flex-col gap-5">
          <h2 className="text-2xl font-light tracking-tight md:text-3xl">
            {page ? (
              <Link href={page} className={HOVER_UNDERLINE_INLINE}>
                {name}
              </Link>
            ) : (
              name
            )}
          </h2>

          {entry.summary?.trim() ? (
            <p className="text-pretty font-light leading-7">
              {entry.summary.trim()}
            </p>
          ) : null}

          {/*
            A description list, not a table. Each class is a handful of
            label-and-value pairs, which is what `dl` is for, and it stacks on
            a phone where a table would scroll sideways. The whole thing is in
            the HTML, so a crawler reads what a reader reads.
          */}
          <dl className="flex flex-col gap-2 font-light sm:flex-row sm:flex-wrap sm:gap-x-10 sm:gap-y-3">
            {facts.map((fact) => (
              <div key={fact.label} className="flex gap-2 sm:flex-col sm:gap-1">
                <dt className="text-sm uppercase tracking-wider text-muted-foreground">
                  {fact.label}
                </dt>
                <dd>
                  {fact.href ? (
                    <Link href={fact.href} className={HOVER_UNDERLINE_INLINE}>
                      {fact.value}
                    </Link>
                  ) : (
                    fact.value
                  )}
                  {fact.note ? (
                    <span className="block text-sm text-muted-foreground">
                      {fact.note}
                    </span>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>

          {entry.note?.trim() ? (
            <p className="font-light italic text-muted-foreground">
              {entry.note.trim()}
            </p>
          ) : null}

          {entry.bookingUrl?.trim() ? (
            /*
             * A link to Jane, so CH-113's delegated listener counts it as a
             * `book_now` without this component knowing anything about
             * analytics. Nothing here has to be wired up for that.
             */
            <p>
              <a
                href={entry.bookingUrl.trim()}
                {...externalLinkProps(entry.bookingUrl.trim())}
                className="inline-flex items-center border border-primary px-6 py-3 text-sm uppercase tracking-wider text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                Book {name}
              </a>
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export default async function ClassesPage() {
  const schedule = await sanityFetch<CLASS_SCHEDULE_QUERY_RESULT>({
    query: CLASS_SCHEDULE_QUERY,
  });

  const classes = (schedule?.classes ?? []).filter((entry) =>
    entry.name?.trim()
  );

  /*
   * A schedule document with no classes on it is not a page. It 404s rather
   * than rendering an empty one, and SITEMAP_QUERY, llms.txt and the link in
   * the navigation all gate on the same condition, so the four cannot
   * disagree and nothing ever links at a page that is not there.
   */
  if (!schedule || classes.length === 0) {
    return notFound();
  }

  const heading = schedule.title?.trim() || FALLBACK.title;
  const paragraphs = toParagraphs(schedule.intro);

  // The schedule's own photograph if one is set, otherwise the Recovery
  // Sanctuary's, since that is where every class runs. Per the every-page
  // rule: default the picture to one the page already relates to.
  const hero = schedule.heroImage?.url
    ? schedule.heroImage
    : schedule.sanctuaryHeroImage;

  return (
    <>
      <JsonLdScript
        data={buildClassScheduleJsonLd(schedule)}
        id="classes-json-ld"
      />
      <JsonLdScript
        data={buildClassScheduleListJsonLd(schedule)}
        id="classes-list-json-ld"
      />

      {hero?.url ? (
        <SectionHero
          image={hero.url}
          imageSource={hero.source}
          alt={hero.alt ?? ""}
          title={heading}
          subtitle={paragraphs[0]}
        />
      ) : null}

      {/*
        The first paragraph is the hero's standing line and the rest is the
        band, which is how every section page splits one intro field. One
        field, so there is no second one to drift and an editor writes in one
        place.
      */}
      <SectionIntro paragraphs={paragraphs.slice(1)} className="pb-0 md:pb-0" />

      <section className="bg-white pb-28 pt-16 text-primary md:pb-36">
        <div className="container flex flex-col gap-10">
          {schedule.note?.trim() ? (
            <div className="flex flex-col gap-1">
              {schedule.note
                .trim()
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line) => (
                  <p
                    key={line}
                    className="font-light italic text-muted-foreground"
                  >
                    {line}
                  </p>
                ))}
            </div>
          ) : null}

          <ul className="flex flex-col gap-10">
            {classes.map((entry) => (
              <ClassBlock key={entry._key} entry={entry} />
            ))}
          </ul>

          <p className="pt-6 font-light">
            <Link
              className="underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
              href="/services/recovery-sanctuary"
            >
              Back to the Recovery Sanctuary
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

export async function generateMetadata() {
  const schedule = await sanityFetch<CLASS_SCHEDULE_QUERY_RESULT>({
    query: CLASS_SCHEDULE_QUERY,
  });

  const hero = schedule?.heroImage?.url
    ? schedule.heroImage
    : schedule?.sanctuaryHeroImage;

  return buildPageMetadata(schedule?.seo ?? null, {
    path: CLASS_SCHEDULE_PATH,
    title: FALLBACK.title,
    description: FALLBACK.description,
    /*
     * The hero doubles as the share card, so this page never shows a bare one
     * and nobody has to remember to choose a picture. The query selects the
     * url rather than the asset id; buildPageMetadata reads the id back out of
     * the url, so the 1200x630 crop still comes out.
     */
    image: hero?.url
      ? { asset: { url: hero.url }, alt: hero.alt ?? undefined }
      : undefined,
  });
}
