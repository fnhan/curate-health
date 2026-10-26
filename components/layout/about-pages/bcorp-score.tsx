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
  areas?: Area[] | null;
};

/**
 * The score block on /about/b-corp. CH-119.
 *
 * WHY THE NUMBER IS ON THE PAGE
 *
 * Reading fourteen B Corp pages across healthcare, coffee and fitness, the
 * ones that read as credible publish the score and the ones that read as
 * marketing publish adjectives. It is also the only part of the claim a reader
 * can check for themselves.
 *
 * THE CEILING IS NOT ON THE PAGE
 *
 * The assessment runs to 200 and nothing here says so. Frank's call on
 * 2026-10-25: a reader told the total reads 91.7 against it and concludes we
 * are halfway, which is the wrong comparison. The right ones are the score a
 * company needs to certify and what an ordinary business scores, and both are
 * here, under the total rather than beside it.
 *
 * THE BAR IS THE COMPOSITION, NOT THE SCALE
 *
 * Frank asked on 2026-10-25 for a visual showing how the five areas add up to
 * the total. So the bar IS 91.7, divided into the five parts that make it,
 * each segment proportional to its own share. It carries no empty remainder,
 * which is the point: a bar drawn against an unstated maximum would invite
 * exactly the halfway reading the omission avoids, and one drawn against a
 * shorter scale would flatter it.
 *
 * The five areas are not comparable to each other, since they carry different
 * maximums, so nothing here invites that comparison either. The bar answers
 * one question, which is what the total is made of.
 *
 * The ramp runs dark to light through the house greens. It is ordered by the
 * array, which is stored largest first, so the widths fall left to right and
 * the eye reads it without a key.
 */

/**
 * Five steps on the brand's own hue, running dark to light but stopping well
 * short of platinum: the section background is 86% lightness, and a final step
 * at 67% left the smallest segment of the ring barely visible on it. 58% is
 * the lightest that still reads. Written as hsl rather than Tailwind classes because the segment
 * colours are data-driven: a class string built at runtime is one Tailwind
 * never sees, which is the trap recorded under the hover sweep on 2026-10-18.
 */
/**
 * The ring. 240 square viewBox, so the numbers read as the drawing does.
 *
 * `strokeDasharray` on one circle per segment, offset by what came before,
 * is what makes five arcs out of five circles. Butt caps, the default, so
 * neighbours meet cleanly instead of overlapping at a rounded end, and the
 * whole thing is rotated -90 degrees so it starts at twelve o'clock.
 */
const RADIUS = 92;
const STROKE = 16;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const RAMP = [
  "hsl(89 37% 15%)",
  "hsl(88 28% 26%)",
  "hsl(85 20% 36%)",
  "hsl(80 14% 47%)",
  "hsl(77 11% 58%)",
];

export function BcorpScore({
  heading,
  intro,
  overall,
  threshold,
  median,
  certifiedSince,
  areas,
}: Props) {
  if (typeof overall !== "number") return null;

  const live = (areas ?? []).filter(
    (area): area is Area & { name: string; value: number } =>
      Boolean(area?.name) && typeof area?.value === "number"
  );

  // The segments are shares of the total the page shows, so they always fill
  // the bar. Sanity rounds each area to one decimal, so they can sum a little
  // either side of the overall; normalising on their own sum keeps the bar
  // exact rather than leaving a sliver of background at the end.
  const sum = live.reduce((n, a) => n + a.value, 0);

  return (
    <section className="bg-platinum py-14 md:py-24">
      <div className="container font-light text-primary">
        {heading ? <h2 className="text-2xl md:text-4xl">{heading}</h2> : null}

        {intro ? (
          <p className="mr-auto mt-4 max-w-[70ch] text-pretty leading-7 md:mt-6">
            {intro}
          </p>
        ) : null}

        {/*
          The total, with the five areas drawn as a ring around it. Frank's
          design on 2026-10-25, replacing a stacked bar: the ring puts the
          number and what it is made of in one object rather than two, and the
          segments close the circle, which says they add to the total more
          plainly than a bar sitting under it did.
        */}
        <figure className="relative mx-auto mt-12 w-full max-w-[260px] md:mt-16 md:max-w-[320px]">
          {live.length > 0 && sum > 0 ? (
            <svg
              viewBox="0 0 240 240"
              className="w-full -rotate-90"
              aria-hidden
            >
              {
                live.reduce<{ at: number; nodes: React.ReactNode[] }>(
                  (acc, area, i) => {
                    const length = (area.value / sum) * CIRCUMFERENCE;
                    acc.nodes.push(
                      <circle
                        key={area._key ?? area.name}
                        cx="120"
                        cy="120"
                        r={RADIUS}
                        fill="none"
                        stroke={RAMP[i % RAMP.length]}
                        strokeWidth={STROKE}
                        // butt caps, so neighbouring segments meet cleanly
                        // rather than overlapping at a rounded end.
                        strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                        strokeDashoffset={-acc.at}
                      />
                    );
                    acc.at += length;
                    return acc;
                  },
                  { at: 0, nodes: [] }
                ).nodes
              }
            </svg>
          ) : null}

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl leading-none md:text-6xl">{overall}</span>
          </div>
        </figure>

        <p className="mt-6 text-center text-sm md:text-base">
          Our B Impact Score
          {certifiedSince ? `, certified ${certifiedSince}` : ""}
        </p>

        {/* The two figures that give it meaning, under it rather than beside. */}
        <dl className="mt-10 flex justify-center gap-6 text-center sm:gap-12 md:gap-20">
          {/*
            Both labels hold two lines. Frank, 2026-10-25: the first ran to
            two and the second to four, which left the pair lopsided and took
            more vertical space than two reference numbers are worth. The
            measure and the wording were cut together, since widening alone
            would have put the first on one line and kept the imbalance.
          */}
          {typeof threshold === "number" ? (
            <div>
              <dd className="text-3xl leading-none md:text-4xl">{threshold}</dd>
              <dt className="mx-auto mt-3 max-w-[24ch] text-sm leading-6">
                Needed to certify
              </dt>
            </div>
          ) : null}

          {typeof median === "number" ? (
            <div>
              <dd className="text-3xl leading-none md:text-4xl">{median}</dd>
              <dt className="mx-auto mt-3 max-w-[24ch] text-sm leading-6">
                Median business score
              </dt>
            </div>
          ) : null}
        </dl>

        {live.length > 0 && sum > 0 ? (
          <div className="mt-14 md:mt-20">
            <p className="text-sm md:text-base">
              What the {overall} is made of
            </p>

            <dl className="mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {live.map((area, i) => (
                <div
                  key={area._key ?? area.name}
                  className="flex items-baseline gap-3 border-b border-primary/10 pb-3"
                >
                  <span
                    aria-hidden
                    className="size-3 shrink-0 translate-y-px rounded-[2px]"
                    style={{ backgroundColor: RAMP[i % RAMP.length] }}
                  />
                  <dt className="text-pretty">
                    {area.name}
                    {area.note ? (
                      <span className="block text-sm text-primary/70">
                        {area.note}
                      </span>
                    ) : null}
                  </dt>
                  <dd className="ml-auto shrink-0 text-xl tabular-nums md:text-2xl">
                    {area.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </div>
    </section>
  );
}
