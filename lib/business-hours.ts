/**
 * Opening hours as seven rows, Monday first, every day stated.
 *
 * One rule for both tables that show hours, /contact and the Visit the cafe
 * block on /cafe, so the two cannot disagree. Until 2026-11-26 /contact
 * listed only the days in `daysOpen`, so Saturday did not appear at all and a
 * visitor could not tell closed from unknown. Frank confirmed the clinic is
 * closed on Saturdays the same day. The structured data already stated all
 * seven days, CH-008, and the cafe block already did; this is the same
 * reasoning on the one page that did not.
 *
 * Days are stored lowercase in `daysOpen` and in `exceptions[].day`. An
 * exception's hours replace the standard hours for that day, and a day named
 * only as an exception still counts as open.
 */

const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const TITLE_CASE: Record<(typeof DAY_ORDER)[number], string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

type StoredHours =
  | {
      standardHours?: string | null;
      customStandardHours?: string | null;
      daysOpen?: Array<string> | null;
      exceptions?: Array<{
        day?: string | null;
        hours?: string | null;
        message?: string | null;
      }> | null;
    }
  | null
  | undefined;

export type HoursRow = {
  /** "Monday", for display. */
  day: string;
  /** The hours, or "Closed". */
  hours: string;
  /** An exception's note, when the editor wrote one. */
  message?: string;
};

export function weekRows(hours: StoredHours): HoursRow[] {
  if (!hours) return [];

  const standard =
    hours.standardHours === "custom"
      ? hours.customStandardHours
      : hours.standardHours;

  const exceptions = new Map(
    (hours.exceptions ?? [])
      .filter((e) => e.day)
      .map((e) => [e.day!.toLowerCase(), e])
  );

  const open = new Set([
    ...(hours.daysOpen ?? []).map((d) => d.toLowerCase()),
    ...exceptions.keys(),
  ]);

  return DAY_ORDER.map((day) => {
    const exception = exceptions.get(day);
    return {
      day: TITLE_CASE[day],
      hours: open.has(day)
        ? (exception ? exception.hours : standard) || "Closed"
        : "Closed",
      message: exception?.message || undefined,
    };
  });
}
