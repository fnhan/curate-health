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
 * A BAR, NOT A CHART
 *
 * The overall score gets one rule with two marks on it, the pass mark and the
 * median, because a number is only meaningful against those. The five areas
 * are a plain list: they are not comparable to each other (the areas carry
 * different maximums) so drawing them as five bars of one length would
 * invent a comparison nobody can make.
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

  // The scale the bar is drawn against. 200 is the assessment's own ceiling,
  // so the rule means the same thing on this page as it does on B Lab's.
  const SCALE = 200;
  const pct = (n: number) => `${(n / SCALE) * 100}%`;

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

        <div className="mt-10 md:mt-14">
          <div className="flex items-baseline gap-4">
            <span className="text-5xl md:text-7xl">{overall}</span>
            <span className="text-sm md:text-base">
              out of {SCALE}
              {certifiedSince ? `, certified since ${certifiedSince}` : ""}
            </span>
          </div>

          {/*
            The rule, with the two marks that give the number its meaning.
            Decorative, so it is hidden from assistive technology: every value
            on it is written out in the line underneath.
          */}
          <div aria-hidden className="relative mt-6 h-px w-full bg-primary/25">
            <span
              className="absolute top-0 h-3 -translate-y-1/2 border-l border-primary/40"
              style={{ left: pct(median ?? 0) }}
            />
            <span
              className="absolute top-0 h-3 -translate-y-1/2 border-l border-primary/40"
              style={{ left: pct(threshold ?? 0) }}
            />
            <span
              className="absolute top-0 h-1 -translate-y-1/2 bg-primary"
              style={{ width: pct(overall) }}
            />
          </div>

          <p className="mt-4 text-sm leading-6">
            {typeof threshold === "number"
              ? `A business needs ${threshold} to be certified.`
              : null}{" "}
            {typeof median === "number"
              ? `The median for businesses that complete the assessment is ${median}.`
              : null}
          </p>
        </div>

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
