import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PortableText } from "next-sanity";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { practitionerCrumbs } from "@/lib/breadcrumbs";
import { externalLinkProps } from "@/lib/links";
import { buildPageMetadata } from "@/lib/page-metadata";
import { treatmentPath } from "@/lib/service-urls";
import { JsonLdScript, buildPractitionerJsonLd } from "@/lib/structured-data";
import { PRACTITIONER_BY_SLUG_QUERYResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import {
  PRACTITIONER_PHOTO_HEIGHT,
  PRACTITIONER_PHOTO_WIDTH,
  urlForPractitionerPhoto,
} from "@/sanity/lib/image";
import { PRACTITIONER_BY_SLUG_QUERY } from "@/sanity/lib/queries";

/**
 * One page per practitioner. CH-104, laid out to the approved mockup.
 *
 * Two columns. The left is the photo, then whatever the booking situation is,
 * then Languages. The right is the name, the credential list, the bio, then
 * Commonly Treats. Services runs full width underneath both.
 *
 * That split is not arbitrary. Everything on the left is about reaching this
 * person; everything on the right is who they are. A first version put the
 * booking button in the right column above the bio, which pushed the bio, the
 * thing this page exists for, down the page.
 *
 * WHAT IS DELIBERATELY NOT HERE
 *
 * Registration numbers. The restructure brief settled this: they belong on a
 * receipt, not a public page. Availability, which lives in Jane and would go
 * stale here in a week. A short bio, which exists for nobody.
 *
 * Commonly Treats and Services are both allowed to be empty, and their
 * sections are left out rather than rendered as a heading over nothing.
 */

/**
 * Where the booking button goes when someone has no Jane profile.
 *
 * A choice rather than a URL, so replacing the referral form updates this
 * with it instead of leaving the button on the old file.
 */
const CTA_TARGETS: Record<string, string> = {
  curateLifestyleReferralForm: "/services/curate-lifestyle#referral",
  curateLifestyleProgram: "/services/curate-lifestyle",
};

/** The first name, for "Book with Ariel" and "Services Ariel offers". */
function firstName(name: string) {
  const parts = name.replace(/^Dr\.?\s+/i, "").split(/\s+/);
  return parts[0] || name;
}

function fetchPractitioner(slug: string) {
  return sanityFetch<PRACTITIONER_BY_SLUG_QUERYResult>({
    query: PRACTITIONER_BY_SLUG_QUERY,
    params: { slug },
  });
}

/** A small caps label, used for Languages and Commonly Treats. */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </p>
  );
}

export default async function PractitionerPage({
  params,
}: {
  params: { practitioner: string };
}) {
  const person = await fetchPractitioner(params.practitioner);

  // An unknown or switched-off practitioner is a 404, not an empty 200. The
  // same trap as CH-001: destructuring a null result throws a 500, and a 500
  // costs crawl budget across the whole domain where a 404 costs nothing.
  if (!person) notFound();

  const {
    name,
    credentials,
    languages,
    commonlyTreats,
    commonlyTreatsLabel,
    fullBio,
    photo,
    janeBookingUrl,
    bookingNote,
    bookingCtaLabel,
    bookingCtaTarget,
    provides,
  } = person;

  const ctaHref = bookingCtaTarget ? CTA_TARGETS[bookingCtaTarget] : undefined;
  const services = (provides ?? []).filter((t) => t.title && t.slug);
  const given = firstName(name!);

  return (
    <>
      <JsonLdScript
        data={buildPractitionerJsonLd(person)}
        id={`practitioner-${params.practitioner}-json-ld`}
      />
      <Breadcrumbs crumbs={practitionerCrumbs(name!, params.practitioner)} />

      <article className="bg-white pb-16 pt-6 text-primary md:pb-24">
        <div className="container">
          <div className="flex flex-col gap-10 md:flex-row md:gap-14">
            {/* Left: photo, how to reach them, languages. */}
            <div className="flex flex-col gap-6 md:w-[340px] md:shrink-0 lg:w-[400px]">
              {photo?.url ? (
                <Image
                  src={urlForPractitionerPhoto(photo as never) || photo.url}
                  alt={photo.alt || name || ""}
                  width={PRACTITIONER_PHOTO_WIDTH}
                  height={PRACTITIONER_PHOTO_HEIGHT}
                  priority
                  sizes="(min-width: 1024px) 400px, (min-width: 768px) 340px, 100vw"
                  className="aspect-[4/5] w-full object-cover grayscale"
                />
              ) : null}

              {/*
                Three booking states. A Jane URL gives a button straight to
                that person. No Jane URL gives the note and whatever the
                record's CTA points at, which is Dr. Leong: he has no bookable
                session in Jane and is reached through the Curate Lifestyle
                Program. Neither gives nothing at all, rather than a button
                pointing somewhere generic.
              */}
              {janeBookingUrl ? (
                <a
                  href={janeBookingUrl}
                  {...externalLinkProps(janeBookingUrl)}
                  className="block w-full border border-primary bg-primary px-6 py-4 text-center text-base font-medium text-white transition-colors hover:bg-transparent hover:text-primary"
                >
                  Book with {given}
                </a>
              ) : bookingNote || (ctaHref && bookingCtaLabel) ? (
                <div className="flex flex-col gap-4">
                  {bookingNote ? (
                    <div className="border border-border bg-platinum/40 p-5">
                      <p className="text-pretty text-sm font-light leading-6">
                        {bookingNote}
                      </p>
                    </div>
                  ) : null}
                  {ctaHref && bookingCtaLabel ? (
                    <Link
                      href={ctaHref}
                      className="block w-full border border-primary px-6 py-4 text-center text-base font-medium transition-colors hover:bg-primary hover:text-white"
                    >
                      {bookingCtaLabel}
                    </Link>
                  ) : null}
                </div>
              ) : null}

              {languages?.length ? (
                <div className="space-y-1">
                  <FieldLabel>Languages</FieldLabel>
                  <p className="font-light">{languages.join(", ")}</p>
                </div>
              ) : null}
            </div>

            {/* Right: who they are. */}
            <div className="flex max-w-[72ch] flex-col gap-6">
              <header className="space-y-3">
                <h1 className="text-4xl font-light md:text-6xl">{name}</h1>
                {credentials?.length ? (
                  <ul className="space-y-0.5 text-base font-light text-muted-foreground">
                    {credentials.map((credential) => (
                      <li key={credential}>{credential}</li>
                    ))}
                  </ul>
                ) : null}
              </header>

              {fullBio?.length ? (
                <div className="prose max-w-none text-primary prose-p:font-light prose-p:leading-7">
                  <PortableText value={fullBio} />
                </div>
              ) : null}

              {commonlyTreats?.length ? (
                <section className="space-y-3 pt-2">
                  {/*
                    The heading is editable because "Commonly treats" is wrong
                    for anyone who is not a regulated health professional. A
                    yoga teacher does not treat people, and that heading over
                    a list of class focuses would read as a clinical claim
                    nobody made.
                  */}
                  <FieldLabel>
                    {commonlyTreatsLabel || "Commonly treats"}
                  </FieldLabel>
                  <ul className="flex flex-wrap gap-2">
                    {commonlyTreats.map((item) => (
                      <li
                        key={item}
                        className="border border-border px-3 py-1.5 text-sm font-light"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          </div>

          {/* Full width, below both columns. */}
          {services.length ? (
            <section className="mt-14 border-t border-border pt-12 md:mt-20">
              <h2 className="mb-6 text-2xl font-light md:text-3xl">
                Services {given} offers
              </h2>
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <li key={service.slug}>
                    <Link
                      href={treatmentPath(service.serviceSlug, service.slug!)}
                      className="group flex h-full items-center justify-between gap-4 border border-border bg-white p-6 transition-colors hover:bg-platinum/40"
                    >
                      <span className="space-y-1">
                        <span className="block text-lg font-light group-hover:underline">
                          {service.title}
                        </span>
                        {service.serviceName ? (
                          <span className="block text-sm text-muted-foreground">
                            {service.serviceName}
                          </span>
                        ) : null}
                      </span>
                      <span aria-hidden="true" className="text-lg">
                        &rsaquo;
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </article>
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { practitioner: string };
}) {
  const person = await fetchPractitioner(params.practitioner);

  // generateMetadata runs before the component, so an unguarded read here
  // throws a 500 before the 404 can happen. See CH-001.
  if (!person) notFound();

  const lead = person.credentials?.[0];

  /*
   * The credential joins the title only when the whole thing still fits.
   *
   * "| Curate Health" costs 15 of the 60 characters Google shows, so the page
   * title has 45. "Safa Karoumi, Registered Psychotherapist (Qualifying)" is
   * 53 and would be cut mid-credential, which reads worse in a result than
   * the name on its own. The credential is on the page either way.
   *
   * All of this is a fallback. Filling seo.pageTitle on the record overrides
   * it, and that is the right answer for anyone whose credential does not fit.
   */
  const withCredential = lead ? `${person.name}, ${lead}` : person.name;
  const title =
    withCredential && withCredential.length <= 45
      ? withCredential
      : person.name || "Our Team";

  return buildPageMetadata(person.seo ?? null, {
    path: `/about/our-team/${params.practitioner}`,
    title,
    description: lead
      ? `${person.name}, ${lead} at Curate Health in Midtown Toronto.`
      : `${person.name} at Curate Health in Midtown Toronto.`,
    image: shareImageFromPhoto(person.photo),
  });
}

/**
 * Where a share card centres a photo that has no hotspot set: across the
 * middle, and a third of the way down.
 *
 * A share card is 1200x630, far wider than most of these photos, so it keeps
 * a band and cuts the rest. Centred, that band cut through Dr. Nhan's and
 * Andrew's foreheads. A third of the way down is where a face sits in a
 * portrait, and on the wide photos the band barely moves. A hotspot dragged
 * in the Studio replaces this.
 */
const PORTRAIT_FOCUS = {
  _type: "sanity.imageHotspot" as const,
  x: 0.5,
  y: 0.3,
  width: 1,
  height: 0.6,
};

/**
 * The practitioner's own photo is their share image unless a different one
 * is set under SEO in the Studio. Every practitioner, including anyone added
 * later, gets a card with their face on it without anyone remembering to.
 */
function shareImageFromPhoto(
  photo: NonNullable<PRACTITIONER_BY_SLUG_QUERYResult>["photo"]
) {
  const assetId = photo?.asset?._ref;
  if (!assetId || !photo?.url) return undefined;

  return {
    asset: { _id: assetId, url: photo.url, alt: photo.alt },
    crop: photo.crop ?? null,
    hotspot: photo.hotspot ?? PORTRAIT_FOCUS,
  };
}
