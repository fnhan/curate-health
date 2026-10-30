/**
 * `nextOccurrence` against the clock changes and the week boundary.
 *
 *   node --env-file=.env.local --import ./scripts/lib/alias-loader.mjs \
 *     scripts/test-class-dates.ts
 *
 * WHY THIS IS A UNIT TEST AND NOT AN AUDIT OF THE PAGE
 *
 * A rendered page can only ever show today's answer. The interesting cases
 * are the two Sundays a year when Toronto changes offset, the moment a class
 * stops being today's and becomes next week's, and the end of a month. None
 * of them can be exercised by fetching /classes, and waiting until March to
 * find out is not a test.
 *
 * `nextOccurrence` takes `now` as an argument for exactly this reason.
 *
 * The expected values below were worked out from the IANA rules for
 * America/Toronto: EDT is UTC-4 and runs from the second Sunday in March to
 * the first Sunday in November, EST is UTC-5 and covers the rest.
 */
import { isDayName, isPaused, nextOccurrence } from "@/lib/class-dates";

type Case = {
  what: string;
  day: string;
  start: string;
  end: string;
  now: string;
  resumesOn?: string | null;
  startDate: string;
  endDate: string;
};

/** The three live classes, as CH-107 and the 50 minute change left them. */
const YOGA = { day: "Tuesday", start: "18:00", end: "18:50" };
const PILATES = { day: "Wednesday", start: "09:00", end: "09:50" };
const TAI_CHI = { day: "Sunday", start: "09:00", end: "09:50" };

const cases: Case[] = [
  {
    what: "Tai Chi lands on the day the clocks go back, so it is EST",
    ...TAI_CHI,
    now: "2026-10-29T13:00:00Z",
    startDate: "2026-11-01T09:00:00-05:00",
    endDate: "2026-11-01T09:50:00-05:00",
  },
  {
    what: "the Tuesday before that is still EDT",
    ...YOGA,
    now: "2026-10-29T13:00:00Z",
    startDate: "2026-11-03T18:00:00-05:00",
    endDate: "2026-11-03T18:50:00-05:00",
  },
  {
    what: "a Sunday in July is EDT",
    ...TAI_CHI,
    now: "2026-07-01T13:00:00Z",
    startDate: "2026-07-05T09:00:00-04:00",
    endDate: "2026-07-05T09:50:00-04:00",
  },
  {
    what: "a Sunday in January is EST",
    ...TAI_CHI,
    now: "2027-01-06T13:00:00Z",
    startDate: "2027-01-10T09:00:00-05:00",
    endDate: "2027-01-10T09:50:00-05:00",
  },
  {
    what: "the Sunday the clocks go forward is EDT",
    ...TAI_CHI,
    now: "2027-03-09T13:00:00Z",
    startDate: "2027-03-14T09:00:00-04:00",
    endDate: "2027-03-14T09:50:00-04:00",
  },
  {
    what: "today's class still counts an hour before it starts",
    ...YOGA,
    // 16:00 EST on Tuesday 2026-12-01, two hours before the 18:00 class.
    now: "2026-12-01T21:00:00Z",
    startDate: "2026-12-01T18:00:00-05:00",
    endDate: "2026-12-01T18:50:00-05:00",
  },
  {
    what: "a minute after it starts, the answer is next week",
    ...YOGA,
    // 18:01 EST on the same Tuesday.
    now: "2026-12-01T23:01:00Z",
    startDate: "2026-12-08T18:00:00-05:00",
    endDate: "2026-12-08T18:50:00-05:00",
  },
  {
    what: "exactly on the hour it has started, so next week",
    ...YOGA,
    now: "2026-12-01T23:00:00Z",
    startDate: "2026-12-08T18:00:00-05:00",
    endDate: "2026-12-08T18:50:00-05:00",
  },
  {
    what: "the next occurrence rolls into the following month",
    ...PILATES,
    // Thursday 2026-12-31, so the next Wednesday is in January.
    now: "2026-12-31T15:00:00Z",
    startDate: "2027-01-06T09:00:00-05:00",
    endDate: "2027-01-06T09:50:00-05:00",
  },
  {
    what: "late UTC evening is still the same Toronto day",
    ...PILATES,
    // 2026-11-05T02:00Z is 2026-11-04 21:00 EST, a Wednesday, class over.
    now: "2026-11-05T02:00:00Z",
    startDate: "2026-11-11T09:00:00-05:00",
    endDate: "2026-11-11T09:50:00-05:00",
  },
  {
    what: "early UTC morning is still the previous Toronto day",
    ...PILATES,
    // 2026-11-04T03:00Z is 2026-11-03 22:00 EST, a Tuesday.
    now: "2026-11-04T03:00:00Z",
    startDate: "2026-11-04T09:00:00-05:00",
    endDate: "2026-11-04T09:50:00-05:00",
  },
];

/*
 * A class on a break. These are the cases that caused the whole correction:
 * Pilates was published as running on 4 November when it does not run again
 * until December, because the first version assumed a weekly rhythm.
 */
const paused: Case[] = [
  {
    what: "a Pilates break until December gives the first Wednesday after it",
    ...PILATES,
    now: "2026-10-30T13:00:00Z",
    resumesOn: "2026-12-01",
    startDate: "2026-12-02T09:00:00-05:00",
    endDate: "2026-12-02T09:50:00-05:00",
  },
  {
    what: "a resume date landing on the class's own weekday is that very day",
    ...PILATES,
    now: "2026-10-30T13:00:00Z",
    resumesOn: "2026-12-02",
    startDate: "2026-12-02T09:00:00-05:00",
    endDate: "2026-12-02T09:50:00-05:00",
  },
  {
    /*
     * Once the resume day has arrived the break is over, so the ordinary rule
     * takes back over and a class that has already run today points at next
     * week. The first version of this case expected the 2nd and was simply
     * wrong: it would have had the page advertising a class that finished
     * fourteen hours earlier.
     */
    what: "the evening of the resume day points at the week after",
    ...PILATES,
    // 2026-12-02 at 23:00 EST, long after a 9:00 AM class would have run.
    now: "2026-12-03T04:00:00Z",
    resumesOn: "2026-12-02",
    startDate: "2026-12-09T09:00:00-05:00",
    endDate: "2026-12-09T09:50:00-05:00",
  },
  {
    what: "a resume date already past is ignored, so the class runs normally",
    ...PILATES,
    now: "2027-02-04T13:00:00Z",
    resumesOn: "2026-12-01",
    startDate: "2027-02-10T09:00:00-05:00",
    endDate: "2027-02-10T09:50:00-05:00",
  },
  {
    what: "a resume date on the far side of a clock change takes that offset",
    ...TAI_CHI,
    now: "2027-02-04T13:00:00Z",
    resumesOn: "2027-04-01",
    startDate: "2027-04-04T09:00:00-04:00",
    endDate: "2027-04-04T09:50:00-04:00",
  },
];

/*
 * The date a reader is shown and the date Google is given come from this one
 * pair of functions, so a class cannot say one thing on the page and another
 * in the markup.
 */
const pausedNow = new Date("2026-10-30T13:00:00Z");
const pauseStates: [string, string | null | undefined, boolean][] = [
  ["a future date is a break", "2026-12-01", true],
  ["a past date is not", "2026-01-01", false],
  ["empty is not", null, false],
  ["undefined is not", undefined, false],
  ["nonsense is not", "December", false],
];

let failed = 0;
console.log();

for (const c of [...cases, ...paused]) {
  const got = nextOccurrence(
    c.day,
    c.start,
    c.end,
    new Date(c.now),
    c.resumesOn
  );
  const ok = got?.startDate === c.startDate && got?.endDate === c.endDate;

  if (!ok) failed += 1;
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${c.what}`);
  if (!ok) {
    console.log(`          want ${c.startDate} / ${c.endDate}`);
    console.log(`          got  ${got?.startDate} / ${got?.endDate}`);
  }
}

/*
 * The whole reason the computed date is defensible: it cannot be in the past.
 * Checked across a year of hourly instants rather than argued.
 */
const classes = [YOGA, PILATES, TAI_CHI];
let stale = 0;
let checked = 0;

for (let hour = 0; hour < 24 * 366; hour += 1) {
  const now = new Date(Date.UTC(2026, 0, 1) + hour * 3600_000);
  for (const k of classes) {
    const got = nextOccurrence(k.day, k.start, k.end, now);
    checked += 1;
    if (!got || new Date(got.startDate).getTime() < now.getTime()) stale += 1;
  }
}

console.log();
console.log(
  `  ${stale === 0 ? "ok  " : "FAIL"}  no date in the past, across ${checked} instants`
);
if (stale) failed += 1;

/* Nor more than a week out, which would mean a class had been skipped. */
let far = 0;
for (let hour = 0; hour < 24 * 366; hour += 1) {
  const now = new Date(Date.UTC(2026, 0, 1) + hour * 3600_000);
  for (const k of classes) {
    const got = nextOccurrence(k.day, k.start, k.end, now);
    if (!got) { far += 1; continue; }
    const days = (new Date(got.startDate).getTime() - now.getTime()) / 86_400_000;
    if (days > 7.05) far += 1;
  }
}
console.log(
  `  ${far === 0 ? "ok  " : "FAIL"}  never more than a week ahead`
);
if (far) failed += 1;


/*
 * `isDayName` is the only list of the seven days now, so it is worth proving
 * it accepts exactly those seven. `buildClassScheduleJsonLd` gates on it, and
 * a day it wrongly rejected would silently drop a class off the schedule.
 */
const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const rejects = ["", "monday", "Mon", "Tues", "Caturday", "constructor", "toString"];

const accepted = days.filter((d) => isDayName(d));
const leaked = rejects.filter((d) => isDayName(d));

console.log(
  `  ${accepted.length === 7 ? "ok  " : "FAIL"}  isDayName accepts all seven days`
);
console.log(
  `  ${leaked.length === 0 ? "ok  " : "FAIL"}  and nothing else${leaked.length ? ": " + leaked.join(", ") : ""}`
);
if (accepted.length !== 7 || leaked.length) failed += 1;

/*
 * **Nothing here may throw.** An earlier version did, on exactly these kinds
 * of input, and it failed the prerender of the whole /classes page on Vercel
 * while a local build and all thirteen checks passed. A date helper is not
 * worth a page, so an input it cannot work from comes back null and the
 * callers fall back.
 */
/** A dated local time carrying an offset, which is what Google needs. */
const SHAPE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;

const unusable: [string, () => unknown][] = [
  ["an unknown day", () => nextOccurrence("Caturday", "09:00", "09:50", new Date())],
  ["a lowercase day", () => nextOccurrence("monday", "09:00", "09:50", new Date())],
  ["an empty day", () => nextOccurrence("", "09:00", "09:50", new Date())],
  ["a prototype key as a day", () => nextOccurrence("constructor", "09:00", "09:50", new Date())],
  ["a nonsense time", () => nextOccurrence("Monday", "nine", "09:50", new Date())],
  ["an empty time", () => nextOccurrence("Monday", "", "09:50", new Date())],
  ["an invalid now", () => nextOccurrence("Monday", "09:00", "09:50", new Date("rhubarb"))],
  ["a nonsense resume date", () => nextOccurrence("Monday", "09:00", "09:50", new Date(), "soon")],
  ["an impossible resume date", () => nextOccurrence("Monday", "09:00", "09:50", new Date(), "2026-13-45")],
  ["an invalid date for isPaused", () => isPaused(new Date("rhubarb"), "2027-12-01")],
];

console.log();
for (const [what, run] of unusable) {
  let outcome: string;
  try {
    const got = run();
    /*
     * The contract is that it never throws, not that it always refuses. An
     * unusable DAY or TIME has no answer, so it comes back null. An unusable
     * RESUME DATE does have one: the break is ignored and the class runs
     * normally, which is what happens to a break nobody cleared. Both are
     * correct, so both pass, and a throw is the only failure.
     */
    const shaped =
      got === null ||
      typeof got === "boolean" ||
      (typeof got === "object" &&
        SHAPE.test((got as { startDate: string }).startDate));
    outcome = shaped ? "ok  " : "FAIL";
    if (!shaped) console.log("          returned: " + JSON.stringify(got));
  } catch (e) {
    outcome = "FAIL";
    console.log(`          threw: ${(e as Error).message}`);
  }
  if (outcome === "FAIL") failed += 1;
  console.log(`  ${outcome}  refuses rather than throws: ${what}`);
}

console.log();
for (const [what, value, want] of pauseStates) {
  const got = isPaused(pausedNow, value);
  if (got !== want) failed += 1;
  console.log(`  ${got === want ? "ok  " : "FAIL"}  isPaused: ${what}`);
}

console.log();
if (failed) {
  console.error(`  ${failed} FAILED`);
  process.exitCode = 1;
} else {
  console.log("  All checks pass.");
}
