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
 * Five steps on the brand's own hue, primary through secondary and out to
 * platinum. Written as hsl rather than Tailwind classes because the segment
 * colours are data-driven: a class string built at runtime is one Tailwind
 * never sees, which is the trap recorded under the hover sweep on 2026-10-18.
 */
const RAMP = [
  "hsl(89 37% 15%)",
  "hsl(88 26% 27%)",
  "hsl(84 17% 41%)",
  "hsl(77 10% 51%)",
  "hsl(82 13% 67%)",
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

        {/* The total, which is what somebody came to this block for. */}
        <div className="mt-12 text-center md:mt-16">
          <p className="text-7xl leading-none md:text-8xl">{overall}</p>
          <p className="mt-4 text-sm md:text-base">
            Our B Impact Score
            {certifiedSince ? `, certified ${certifiedSince}` : ""}
          </p>
        </div>

        {/* The two figures that give it meaning, under it rather than beside. */}
        <dl className="mt-10 flex justify-center gap-12 text-center md:gap-20">
          {typeof threshold === "number" ? (
            <div>
              <dd className="text-3xl leading-none md:text-4xl">{threshold}</dd>
              <dt className="mx-auto mt-3 max-w-[18ch] text-sm leading-6">
                The score a company needs to certify
              </dt>
            </div>
          ) : null}

          {typeof median === "number" ? (
            <div>
              <dd className="text-3xl leading-none md:text-4xl">{median}</dd>
              <dt className="mx-auto mt-3 max-w-[18ch] text-sm leading-6">
                The median for businesses that complete the assessment
              </dt>
            </div>
          ) : null}
        </dl>

        {live.length > 0 && sum > 0 ? (
          <figure className="mt-14 md:mt-20">
            <figcaption className="text-sm md:text-base">
              What the {overall} is made of
            </figcaption>

            {/*
              Decorative: every name and value on it is written out in the list
              underneath, so a screen reader is handed the list rather than a
              row of unlabelled boxes.
            */}
            <div
              aria-hidden
              className="mt-4 flex h-11 w-full overflow-hidden rounded-sm md:h-14"
            >
              {live.map((area, i) => (
                <div
                  key={area._key ?? area.name}
                  style={{
                    width: `${(area.value / sum) * 100}%`,
                    backgroundColor: RAMP[i % RAMP.length],
                  }}
                />
              ))}
            </div>

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
          </figure>
        ) : null}
      </div>
    </section>
  );
}
