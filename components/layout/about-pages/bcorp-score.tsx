import Link from "next/link";

import { HOVER_UNDERLINE } from "@/lib/hover-underline";
import { externalLinkProps } from "@/lib/links";
import { cn } from "@/lib/utils";

type Area = {
  _key?: string | null;
  name?: string | null;
  value?: number | null;
  note?: string | null;
};

type Props = {
  heading?: string | null;
  intro?: string | null;
  overall?: number | null;
  threshold?: number | null;
  median?: number | null;
  certifiedSince?: string | null;
  directoryUrl?: string | null;
  areas?: Area[] | null;
};

/**
 * The score block on /about/b-corp. CH-119.
 *
 * WHY THE NUMBER IS ON THE PAGE AT ALL
 *
 * Reading fourteen B Corp pages across healthcare, coffee and fitness, the
 * ones that read as credible publish the score and the ones that read as
 * marketing publish adjectives. The number also does work no adjective can:
 * 91.7 against a median of 50.9 says more in a line than a paragraph about
 * commitment, and it is checkable, which is the whole point of a certification
 * that most readers do not recognise.
 *
 * THE CEILING IS NOT ON THE PAGE
 *
 * The assessment runs to 200 and this block does not say so. Frank's call on
 * 2026-10-25: a reader who is told the total reads 91.7 as a fraction of it
 * and concludes we are halfway, which is the wrong comparison. The right ones
 * are the score a company needs to certify and what an ordinary business
 * scores, and those are both here.
 *
 * So there is no bar either. A rule drawn against an unstated maximum invites
 * exactly the reading the number is meant to avoid, and a rule drawn against a
 * shorter scale would flatter it. Three figures, plainly set out.
 *
 * The five areas are a plain list rather than bars: they carry different
 * maximums, so drawing them to one length would invent a comparison nobody
 * can make.
 *
 * It is a section of its own rather than a paragraph because these values live
 * in their own object in the Studio, per the note on the schema, and the
 * Certification markup reads the same fields. One source, three readers.
 */
export function BcorpScore({
  heading,
  intro,
  overall,
  threshold,
  median,
  certifiedSince,
  directoryUrl,
  areas,
}: Props) {
  if (typeof overall !== "number") return null;

  const live = (areas ?? []).filter(
    (area) => area?.name && typeof area.value === "number"
  );

  return (
    <section className="bg-platinum py-14 md:py-24">
      <div className="container font-light text-primary">
        {heading ? (
          <h2 className="text-2xl md:text-4xl">{heading}</h2>
        ) : null}

        {intro ? (
          <p className="mr-auto mt-4 max-w-[70ch] text-pretty leading-7 md:mt-6">
            {intro}
          </p>
        ) : null}

        {/*
          Three figures on one line: ours, the one a company needs, and the one
          an ordinary business gets. Each is a value over its label, so the
          numbers line up and read across.
        */}
        <dl className="mt-10 flex flex-wrap items-end gap-x-14 gap-y-8 md:mt-14">
          <div>
            <dd className="text-5xl leading-none md:text-7xl">{overall}</dd>
            <dt className="mt-3 text-sm md:text-base">
              Curate Health
              {certifiedSince ? `, certified ${certifiedSince}` : ""}
            </dt>
          </div>

          {typeof threshold === "number" ? (
            <div>
              <dd className="text-3xl leading-none md:text-4xl">{threshold}</dd>
              <dt className="mt-3 max-w-[22ch] text-sm leading-6">
                The score a company needs to certify
              </dt>
            </div>
          ) : null}

          {typeof median === "number" ? (
            <div>
              <dd className="text-3xl leading-none md:text-4xl">{median}</dd>
              <dt className="mt-3 max-w-[22ch] text-sm leading-6">
                The median for businesses that complete the assessment
              </dt>
            </div>
          ) : null}
        </dl>

        {live.length > 0 ? (
          <dl className="mt-10 grid gap-x-10 gap-y-5 border-t border-primary/15 pt-8 sm:grid-cols-2 lg:grid-cols-3 md:mt-14">
            {live.map((area) => (
              <div
                key={area._key ?? area.name}
                className="flex items-baseline justify-between gap-4 border-b border-primary/10 pb-3"
              >
                <dt className="text-pretty">
                  {area.name}
                  {area.note ? (
                    <span className="block text-sm text-primary/70">
                      {area.note}
                    </span>
                  ) : null}
                </dt>
                <dd className="shrink-0 text-xl tabular-nums md:text-2xl">
                  {area.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {/*
          The directory profile, not bcorp.com. This is the link that lets a
          reader check the number above, which is the only reason the number is
          worth printing. The mark's own link stays on bcorp.com wherever it
          appears, because B Lab's guidelines require that one.
        */}
        {directoryUrl ? (
          <Link
            href={directoryUrl}
            {...externalLinkProps(directoryUrl)}
            className={cn("mt-10 inline-block w-fit md:mt-12", HOVER_UNDERLINE)}
          >
            Read our full assessment on B Lab&rsquo;s directory
          </Link>
        ) : null}
      </div>
    </section>
  );
}
