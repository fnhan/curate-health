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
import { PRACTITIONER_BY_SLUG_QUERY } from "@/sanity/lib/queries";

/**
 * One page per practitioner. CH-104.
 *
 * Seven credentialed people shared one page, and their bios sat inside
 * collapsed accordions, which left 203 words of visible text for the whole
 * team. Searching any of them by name landed nowhere. This is the single
 * largest gap between what the clinic is and what a search engine can see.
 *
 * WHAT IS DELIBERATELY NOT HERE
 *
 * Registration numbers. The restructure brief settled this: they belong on a
 * receipt, not a public page. CLAUDE.md's CH-104 text still asks for them and
 * is stale on that point.
 *
 * Availability. It lives in Jane and would go stale here the first week.
 *
 * A short bio. No such copy exists for anyone, and Frank chose to drop the
 * field rather than have one written.
 *
 * Commonly treats and the services list are both allowed to be empty, and
 * their sections are left out rather than rendered as a heading with nothing
 * under it. Everything under commonly treats reads as a clinical claim and
 * needs the practitioner's own sign-off.
 */

/**
 * Where the booking button goes when someone has no Jane profile.
 *
 * A choice rather than a URL, so replacing the referral form updates this
 * button with it instead of leaving it on the old file.
 */
const CTA_TARGETS: Record<string, string> = {
  curateLifestyleReferralForm: "/services/curate-lifestyle#referral",
  curateLifestyleProgram: "/services/curate-lifestyle",
};

/*
 * No generateStaticParams, deliberately.
 *
 * It would need the slug list at build time, and sanityFetch reads
 * draftMode(), which throws outside a request scope: "draftMode was called
 * outside a request scope", and the whole route fails to build. Every other
 * dynamic route here does the same thing and renders on demand with ISR,
 * which also means adding a practitioner in the Studio publishes their page
 * without a deploy.
 */
function fetchPractitioner(slug: string) {
  return sanityFetch<PRACTITIONER_BY_SLUG_QUERYResult>({
    query: PRACTITIONER_BY_SLUG_QUERY,
    params: { slug },
  });
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

  return (
    <>
      <JsonLdScript
        data={buildPractitionerJsonLd(person)}
        id={`practitioner-${params.practitioner}-json-ld`}
      />
      <Breadcrumbs crumbs={practitionerCrumbs(name!, params.practitioner)} />

      <article className="bg-white pb-20 pt-8 text-primary md:pb-28">
        <div className="container flex flex-col gap-12 md:flex-row md:gap-16">
          {photo?.url ? (
            <div className="md:w-[320px] md:shrink-0 lg:w-[380px]">
              <Image
                src={photo.url}
                alt={photo.alt || name || ""}
                width={760}
                height={950}
                priority
                sizes="(min-width: 1024px) 380px, (min-width: 768px) 320px, 100vw"
                className="w-full object-cover"
              />
            </div>
          ) : null}

          <div className="flex max-w-[70ch] flex-col gap-8">
            <header className="flex flex-col gap-3">
              <h1 className="text-3xl font-light md:text-5xl">{name}</h1>
              {credentials?.length ? (
                <ul className="flex flex-col gap-1 text-base font-light text-primary/80">
                  {credentials.map((credential) => (
                    <li key={credential}>{credential}</li>
                  ))}
                </ul>
              ) : null}
              {languages?.length ? (
                <p className="text-sm font-light text-primary/60">
                  Speaks {languages.join(", ")}
                </p>
              ) : null}
            </header>

            {/*
              The booking block has three states and the third one matters.
              A Jane URL gives a button straight to that person's own booking
              page. No Jane URL but a note explains how someone reaches them
              instead, which is Dr. Leong: he is not publicly bookable and
              patients come through the Curate Lifestyle Program. Neither, and
              the block is omitted rather than pointing somewhere generic,
              which is the case for anyone who does not take bookings.
              Dr. Leong is configured with the button but no note, so the
              block renders on the strength of the button alone rather than
              disappearing. A referral form with a label is meaningful without
              a paragraph explaining it; an empty bordered box is not.
            */}
            {janeBookingUrl ? (
              <div>
                <a
                  href={janeBookingUrl}
                  {...externalLinkProps(janeBookingUrl)}
                  className="inline-flex border border-primary bg-primary px-8 py-3 text-base font-light text-white transition-colors hover:bg-transparent hover:text-primary"
                >
                  Book with {name}
                </a>
              </div>
            ) : bookingNote || (ctaHref && bookingCtaLabel) ? (
              <div className="flex flex-col items-start gap-4 border border-secondary bg-platinum/40 p-6">
                {bookingNote ? (
                  <p className="text-pretty font-light leading-7">
                    {bookingNote}
                  </p>
                ) : null}
                {ctaHref && bookingCtaLabel ? (
                  <Link
                    href={ctaHref}
                    className="inline-flex border border-primary px-6 py-2.5 text-base font-light transition-colors hover:bg-primary hover:text-white"
                  >
                    {bookingCtaLabel}
                  </Link>
                ) : null}
              </div>
            ) : null}

            {fullBio?.length ? (
              <div className="prose max-w-none text-primary prose-p:font-light prose-p:leading-7">
                <PortableText value={fullBio} />
              </div>
            ) : null}

            {commonlyTreats?.length ? (
              <section className="flex flex-col gap-3">
                <h2 className="text-xl font-medium">Commonly treats</h2>
                <ul className="flex flex-wrap gap-2">
                  {commonlyTreats.map((item) => (
                    <li
                      key={item}
                      className="border border-secondary px-3 py-1 text-sm font-light"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {services.length ? (
              <section className="flex flex-col gap-3">
                <h2 className="text-xl font-medium">Services</h2>
                <ul className="flex flex-col gap-1">
                  {services.map((service) => (
                    <li key={service.slug}>
                      <Link
                        className="font-light hover:underline"
                        href={treatmentPath(service.serviceSlug, service.slug!)}
                      >
                        {service.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <p className="pt-2">
              <Link
                href="/about/our-team"
                className="font-light hover:underline"
              >
                Back to the team
              </Link>
            </p>
          </div>
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

  /*
   * The fallbacks are built from the record rather than left generic, because
   * none of the seven has seo filled in yet and a page that says only
   * "Curate Health" in the result is the defect CH-024 exists to fix. A title
   * of "{name}, {first credential}" is what somebody searching a name expects
   * to see.
   */
  const lead = person.credentials?.[0];

  /*
   * The credential joins the title only when the whole thing still fits.
   *
   * "| Curate Health" costs 15 of the 60 characters Google shows, so the page
   * title has 45. "Safa Karoumi, Registered Psychotherapist (Qualifying)" is
   * 53 and would be cut mid-credential, which reads worse in a result than
   * the name on its own. The credential is on the page either way, in the h1
   * block and in the markup.
   *
   * All of this is a fallback. Filling seo.pageTitle on the practitioner
   * record overrides it, and that is the right answer for anyone whose
   * credential does not fit.
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
  });
}
