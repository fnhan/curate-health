/**
 * Formats the clinic address for display.
 *
 * WHY THIS EXISTS
 *
 * Three places rendered the address by putting the fields next to each other
 * in JSX and trusting something to separate them:
 *
 *   {address?.city}
 *   {address?.state}
 *   {address?.zip}
 *
 * Nothing does. React strips whitespace-only JSX between adjacent
 * expressions, so the site footer has been reading "TorontoONM6C 2C6" on every
 * page, and the contact page did the same underneath the street. The values in
 * Sanity were correct the whole time, which is what made it survive CH-021:
 * that ticket fixed the data and the data was never the problem.
 *
 * One function, so there is one answer to how an address is written and no
 * fourth place to get it wrong.
 *
 * `.filter(Boolean)` on each line means a partly filled address degrades to
 * what it has instead of printing "undefined", which is the failure CH-025
 * records on the second location.
 */

/**
 * Accepts undefined as well as null, because every caller reaches this through
 * optional chaining on a Sanity result and gets one or the other.
 */
export type Address =
  | {
      street?: string | null;
      city?: string | null;
      state?: string | null;
      zip?: string | null;
      country?: string | null;
    }
  | null
  | undefined;

const clean = (value: string | null | undefined) => (value ?? "").trim();

/**
 * The address as lines, street first.
 *
 * Canada Post puts no comma between province and postal code, so it is
 * "Toronto, ON M6C 2C6" rather than "Toronto, ON, M6C 2C6".
 */
export function addressLines(address: Address): string[] {
  const cityLine = [
    [clean(address?.city), clean(address?.state)].filter(Boolean).join(", "),
    clean(address?.zip),
  ]
    .filter(Boolean)
    .join(" ");

  return [clean(address?.street), cityLine].filter(Boolean);
}

/** The whole address on one line, for a link title or a meta description. */
export function addressOneLine(address: Address): string {
  return addressLines(address).join(", ");
}
