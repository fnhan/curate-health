import { CLASS_SCHEDULE_PATH } from "@/lib/structured-data";

/**
 * Drop the Classes entry from a list of links while no class is switched on.
 * CH-107.
 *
 * The schedule page 404s when every class is off, so anything linking to it
 * has to close at the same moment. The menu, the footer and the footer's
 * mobile accordion all show a list that may carry that link, and three copies
 * of this test would eventually disagree.
 *
 * It is decided here rather than in SITE_SETTINGS_QUERY because a GROQ filter
 * holding a subquery is legal and `sanity typegen` cannot type it: it drops
 * the whole query, and every import of SITE_SETTINGS_QUERY_RESULT then fails
 * to compile. The query reports `classScheduleActive` instead and this reads
 * it.
 *
 * Matched on the address rather than the label, because an editor may reword
 * "Classes" and the path is what decides where it goes.
 */
export function withoutDeadClassesLink<T>(
  links: T[] | null | undefined,
  href: (link: T) => string | null | undefined,
  classScheduleActive: boolean | null | undefined
): T[] | null | undefined {
  if (classScheduleActive) return links;

  return links?.filter((link) => href(link)?.trim() !== CLASS_SCHEDULE_PATH);
}
