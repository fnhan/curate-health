"use client";

import { useEffect, useRef, useState } from "react";

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
 * are halfway, which is the wrong comparison.
 *
 * THE RING IS THE COMPOSITION, NOT THE SCALE
 *
 * The five areas draw a ring around the total rather than a bar under it, so
 * the number and what it is made of are one object. The segments close the
 * circle, which says they add up. There is no empty remainder in it, because a
 * ring drawn against an unstated maximum would invite exactly the halfway
 * reading that leaving the ceiling off avoids.
 *
 * The five areas carry different maximums and are not comparable to each
 * other, so nothing here invites that comparison either. The ring answers one
 * question: what the total is made of.
 *
 * THE COMPARISON FIGURES ARE REFERENCE, NOT HEADLINE
 *
 * 80 and 50.9 sit in a bordered box below the legend rather than under the
 * total. Frank, 2026-10-26: centred and large beneath the ring they drew
 * attention they do not deserve, and read as though they were part of the
 * arithmetic. They are the opposite: they are what the 91.7 is measured
 * against, which is why the box separates them from it.
 *
 * Below the legend is also the order the questions come in. What did we score,
 * what is it made of, how does that compare. The border and the smaller type
 * do the rest.
 */

/**
 * Five steps on the brand's own hue, running dark to light but stopping well
 * short of platinum: the section background is 86% lightness, and a final step
 * at 67% left the smallest segment of the ring barely visible on it. 58% is
 * the lightest that still reads.
 *
 * Inline `hsl` rather than Tailwind classes, because the segment colours are
 * data-driven: a class string built at runtime is one Tailwind never sees,
 * which is the trap recorded under the hover sweep on 2026-10-18.
 */
const RAMP = [
  "hsl(89 37% 15%)",
  "hsl(88 28% 26%)",
  "hsl(85 20% 36%)",
  "hsl(80 14% 47%)",
  "hsl(77 11% 58%)",
];

/**
 * The ring. 240 square viewBox, so the numbers read as the drawing does.
 *
 * `strokeDasharray` on one circle per segment, offset by what came before, is
 * what makes five arcs out of five circles. Butt caps, the default, so
 * neighbours meet cleanly instead of overlapping at a rounded end, and the
 * whole thing is rotated -90 degrees so it starts at twelve o'clock.
 */
const RADIUS = 92;
const STROKE = 16;
/** How much a hovered segment thickens. It grows both ways from the path. */
const STROKE_HOVER = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * One arc of the ring, as an SVG path.
 *
 * WHY PATHS AND NOT DASHED CIRCLES
 *
 * The first version drew five full circles and used `stroke-dasharray` to show
 * only each one's slice. It looked right and could not be hovered: a browser
 * hit-tests a dashed stroke along the whole path, gaps included, so all five
 * circles answered the pointer everywhere on the ring and the last one in the
 * document won every time. Hovering the legend worked, which is what made the
 * ring look broken rather than the hover.
 *
 * A path that is only the arc has no gaps to hit-test, so the pointer lands on
 * the segment under it. `pathLength` is normalised to 1, which also simplifies
 * the draw: the dash runs 0 to 1 whatever the arc's real length.
 *
 * Angles start at -90 degrees, twelve o'clock, and run clockwise, so no
 * rotation is needed on the svg.
 */
function arcPath(from: number, to: number) {
  const point = (fraction: number) => {
    const angle = (fraction * 360 - 90) * (Math.PI / 180);
    return [
      120 + RADIUS * Math.cos(angle),
      120 + RADIUS * Math.sin(angle),
    ] as const;
  };

  const [x0, y0] = point(from);
  const [x1, y1] = point(to);
  const largeArc = to - from > 0.5 ? 1 : 0;

  return `M ${x0.toFixed(3)} ${y0.toFixed(3)} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x1.toFixed(3)} ${y1.toFixed(3)}`;
}

/** How long the whole sweep takes. Each arc gets the share it occupies. */
const DRAW_MS = 900;

export function BcorpScore({
  heading,
  intro,
  overall,
  threshold,
  median,
  certifiedSince,
  areas,
}: Props) {
  const figureRef = useRef<HTMLElement | null>(null);
  const [drawn, setDrawn] = useState(false);
  const [active, setActive] = useState<number | null>(null);

  /**
   * The ring draws when it comes into view, and after load when it is already
   * there, which is the case on a phone where this section can open above the
   * fold. Frank asked for both on 2026-10-26.
   *
   * One code path covers them: IntersectionObserver fires immediately for an
   * element that is already intersecting when it starts observing, and this
   * effect only runs after hydration, so "already visible" and "scrolled to"
   * arrive the same way. The short delay is so the sweep is something a reader
   * watches rather than something already finished by the time they look.
   *
   * It runs once. A ring that redraws every time it scrolls past is a
   * distraction rather than a flourish.
   */
  useEffect(() => {
    const el = figureRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDrawn(true);
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        timer = setTimeout(() => setDrawn(true), 180);
      },
      // A third of it showing is enough to be worth starting.
      { threshold: 0.33 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  if (typeof overall !== "number") return null;

  const live = (areas ?? []).filter(
    (area): area is Area & { name: string; value: number } =>
      Boolean(area?.name) && typeof area?.value === "number"
  );

  // The segments are shares of the total the page shows, so they always close
  // the ring. Sanity rounds each area to one decimal, so they can sum a little
  // either side of the overall; normalising on their own sum keeps the ring
  // exact rather than leaving a gap at twelve o'clock.
  const sum = live.reduce((n, a) => n + a.value, 0);
  const hasRing = live.length > 0 && sum > 0;

  // Each arc starts where the last one ended and waits that long before
  // drawing, so the five read as one sweep rather than five animations.
  let at = 0;
  const segments = live.map((area, i) => {
    const fraction = area.value / sum;
    const seg = { area, i, d: arcPath(at, at + fraction), delay: at * DRAW_MS };
    at += fraction;
    return seg;
  });

  return (
    <section className="bg-platinum py-14 md:py-24">
      <div className="container font-light text-primary">
        {heading ? <h2 className="text-2xl md:text-4xl">{heading}</h2> : null}

        {intro ? (
          <p className="mt-4 text-pretty leading-7 md:mt-6">
            {intro}
          </p>
        ) : null}

        <figure
          ref={figureRef}
          className="relative mx-auto mt-12 w-full max-w-[260px] md:mt-16 md:max-w-[320px]"
        >
          {hasRing ? (
            <svg viewBox="0 0 240 240" className="w-full" aria-hidden>
              {segments.map(({ area, i, d, delay }) => (
                <path
                  key={area._key ?? area.name}
                  d={d}
                  pathLength={1}
                  fill="none"
                  stroke={RAMP[i % RAMP.length]}
                  strokeWidth={active === i ? STROKE_HOVER : STROKE}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  className={cn(
                    "transition-[stroke-width,opacity] duration-200",
                    // Before it draws the dash is nothing, so the ring starts
                    // empty rather than flashing whole and then animating.
                    drawn ? "animate-draw-arc" : "[stroke-dasharray:0_1]",
                    active !== null && active !== i
                      ? "opacity-40"
                      : "opacity-100"
                  )}
                  style={
                    {
                      // pathLength is 1, so the dash runs in those units and
                      // one keyframe serves arcs of any real length.
                      "--len": 1,
                      "--circumference": 1,
                      animationDelay: `${delay}ms`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </svg>
          ) : null}

          {/*
            pointer-events-none, or this covers the whole figure and the ring
            never sees the pointer. That is what made the arcs unhoverable while
            the legend worked.
          */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="text-5xl leading-none md:text-6xl">{overall}</span>
          </div>
        </figure>

        <p className="mt-6 text-center text-sm md:text-base">
          Our B Impact Score
          {certifiedSince ? `, certified ${certifiedSince}` : ""}
        </p>

        {hasRing ? (
          <div className="mt-14 md:mt-20">
            <p className="text-sm md:text-base">What the {overall} is made of</p>

            {/*
              Hovering either an arc or its row lights both, so a reader can
              tell which part of the ring is which without a key drawn on it.
              The rows are not links and take no keyboard focus: every name and
              value is written out here already, so nothing is lost by the
              highlight being mouse-only.
            */}
            <dl className="mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {live.map((area, i) => (
                <div
                  key={area._key ?? area.name}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  className={cn(
                    "flex items-baseline gap-3 border-b pb-3 transition-all duration-200",
                    active === i
                      ? "border-primary/40 font-normal"
                      : "border-primary/10",
                    active !== null && active !== i
                      ? "opacity-50"
                      : "opacity-100"
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "shrink-0 translate-y-px rounded-[2px] transition-all duration-200",
                      active === i ? "size-4" : "size-3"
                    )}
                    style={{ backgroundColor: RAMP[i % RAMP.length] }}
                  />
                  <dt className="text-pretty">
                    {area.name}
                    {area.note ? (
                      <span className="block text-sm font-light text-primary/70">
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

        {/*
          The two comparison figures, boxed and below everything the 91.7 is
          made of, so they read as reference rather than as part of the sum.

          Flexed apart rather than gridded in two. On a two column grid the
          padding is symmetric and does not look it: the second description is
          shorter than its column, so the text stopped about 200px before the
          right edge while the first sat flush against the left. Frank saw it
          as uneven padding on 2026-10-26. `justify-between` puts each block
          against its own side, so both now clear the border by the same 32px.
        */}
        {typeof threshold === "number" || typeof median === "number" ? (
          <dl className="mt-10 flex flex-col gap-6 border border-primary/25 px-6 py-5 sm:flex-row sm:justify-between sm:gap-10 md:mt-14 md:px-8 md:py-6">
            {typeof threshold === "number" ? (
              <div className="flex flex-col gap-1">
                <dd className="text-2xl leading-none tabular-nums">
                  {threshold}
                </dd>
                <dt className="text-sm leading-6">
                  The minimum score a company needs to certify
                </dt>
              </div>
            ) : null}

            {typeof median === "number" ? (
              <div className="flex flex-col gap-1">
                <dd className="text-2xl leading-none tabular-nums">{median}</dd>
                <dt className="text-sm leading-6">
                  The median for businesses that complete the assessment
                </dt>
              </div>
            ) : null}
          </dl>
        ) : null}
      </div>
    </section>
  );
}
