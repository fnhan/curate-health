/**
 * When a weekly class next runs, in Toronto's own time. CH-107.
 *
 * Its own file rather than part of lib/structured-data.tsx, which carries JSX
 * and so cannot be run by Node directly. This is pure arithmetic over a time
 * zone, it has the only logic on the page that can be wrong in a way nobody
 * notices for months, and scripts/test-class-dates.ts exercises it against
 * both clock changes. That is worth more than keeping it beside its caller.
 */
const TORONTO = "America/Toronto";

/**
 * Sunday is 0, matching getUTCDay().
 *
 * This is the only list of the seven days. `buildClassScheduleJsonLd` used to
 * keep its own `DAYS` set to decide whether a stored day was usable, and two
 * lists of the same seven days in two files is how one of them eventually
 * disagrees. It reads `isDayName` instead.
 */
const DAY_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

/**
 * The instant to search forward from: the resume date when one is set and
 * still ahead, otherwise now.
 *
 * A date with no time is read as noon in Toronto rather than midnight UTC.
 * `new Date("2026-12-01")` is midnight UTC, which is 7:00 PM on 30 November
 * in Toronto, so a class resuming on a Tuesday would have been searched from
 * the Monday evening and could land a day early. Noon cannot.
 */
function resumeFloor(now: Date, resumesOn?: string | null) {
  if (!resumesOn || !/^\d{4}-\d{2}-\d{2}$/.test(resumesOn)) return now;

  const at = new Date(`${resumesOn}T12:00:00${torontoOffset(new Date(`${resumesOn}T12:00:00Z`))}`);
  if (Number.isNaN(at.getTime())) return now;

  return at.getTime() > now.getTime() ? at : now;
}

/**
 * Whether a class is on a break today, so the page can say so. Reads the same
 * date by the same rule as `resumeFloor`, which is what stops the sentence on
 * the page and the date in the markup disagreeing.
 */
export function isPaused(now: Date, resumesOn?: string | null) {
  return resumeFloor(now, resumesOn) !== now;
}

/**
 * Whether a stored value is a day `nextOccurrence` can work from.
 *
 * `Object.hasOwn`, not `in`. `"constructor" in DAY_INDEX` is true, because
 * `in` walks the prototype chain, so the first version of this accepted
 * "constructor" and "toString" and then read a function out of the lookup,
 * which makes the arithmetic NaN and the date Invalid Date. Caught by
 * scripts/test-class-dates.ts, which is the reason it lists those two.
 */
export function isDayName(value: string) {
  return Object.hasOwn(DAY_INDEX, value);
}

/**
 * The offset Toronto was on at a given instant, as "-04:00" or "-05:00".
 *
 * Read off the zone rather than assumed, because the whole reason the
 * schedule names a zone instead of an offset is that the offset changes twice
 * a year. Jane returned the same 9:00 AM class as -04:00 in October and
 * -05:00 in November, which is exactly what a hardcoded offset gets wrong.
 */
function torontoOffset(at: Date) {
  const named = new Intl.DateTimeFormat("en-US", {
    timeZone: TORONTO,
    timeZoneName: "longOffset",
  })
    .formatToParts(at)
    .find((part) => part.type === "timeZoneName")?.value;

  const offset = (named ?? "").replace("GMT", "");

  // Toronto is never at an offset of zero, where this would come back bare.
  return /^[+-][0-9]{2}:[0-9]{2}$/.test(offset) ? offset : "-05:00";
}

/** Toronto's own calendar date and clock at a given instant. */
function torontoParts(at: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TORONTO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(at);

  const value = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);

  const hour = value("hour");

  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    // en-CA gives midnight as 24 rather than 0.
    hour: hour === 24 ? 0 : hour,
    minute: value("minute"),
  };
}

/**
 * When a weekly class next runs, as a dated local time carrying Toronto's own
 * offset, for example "2026-11-03T18:00:00-05:00".
 *
 * **Google requires `startDate` on an Event and will not read a recurrence
 * instead**, so the next occurrence is computed rather than published as a
 * list of dates nobody has. It is right by construction rather than by being
 * kept up to date: today's class counts until its start time passes, and
 * after that the answer is next week's. It can never be in the past.
 *
 * **`resumesOn` is why this takes a floor at all, and it is the correction to
 * a real mistake.** The first version assumed every class runs every week, so
 * it published a Pilates date in November for a class that does not run again
 * until December. Instructors take holidays. A class on a break carries the
 * date it comes back, and the search from there gives its first class back
 * rather than a date nobody can book.
 *
 * The offset is the one in force on the target date, not today's, so a class
 * the far side of a clock change is still stated correctly. Noon UTC on that
 * date is used to read it, which is morning in Toronto and so safely past the
 * 2:00 AM transition whichever way it goes.
 */
export function nextOccurrence(
  day: string,
  startTime: string,
  endTime: string,
  now: Date,
  resumesOn?: string | null
) {
  const target = DAY_INDEX[day];
  const [hour, minute] = startTime.split(":").map(Number);

  /*
   * The later of today and the resume date. A resume date already past is
   * ignored, so a break nobody cleared in the Studio stops holding the class
   * on a date behind us rather than freezing it there.
   */
  const from = resumeFloor(now, resumesOn);
  const here = torontoParts(from);
  const today = new Date(
    Date.UTC(here.year, here.month - 1, here.day)
  ).getUTCDay();

  let ahead = (target - today + 7) % 7;

  /*
   * Today's class counts until its start time passes. Not applied on a resume
   * date: that date is a statement about the day, not the minute, so a class
   * resuming on its own weekday runs that day whatever the clock says now.
   */
  if (
    ahead === 0 &&
    from === now &&
    (here.hour > hour || (here.hour === hour && here.minute >= minute))
  ) {
    ahead = 7;
  }

  // Date.UTC rolls a day past the end of the month over for us.
  const date = new Date(Date.UTC(here.year, here.month - 1, here.day + ahead))
    .toISOString()
    .slice(0, 10);
  const offset = torontoOffset(new Date(`${date}T12:00:00Z`));

  return {
    startDate: `${date}T${startTime}:00${offset}`,
    endDate: `${date}T${endTime}:00${offset}`,
  };
}
