/**
 * The complimentary consult button. Frank, 2026-11-02 and 2026-11-26.
 *
 * WHERE THE LINK LIVES
 *
 * On the practitioner's record, `consultUrl`, because the consult is that
 * person's offering. A treatment or product page names whose consult it
 * offers with `consultPractitioner`, so switching a practitioner off takes
 * the button off every page at once, the same way the "Show on website"
 * switch takes them off everything else.
 *
 * A consult is discipline-specific. Dr. Nhan's is a chiropractic one, so a
 * service page offers it only where it fits the service, and acupuncture,
 * with three providers and no acupuncture consult, offers none. That is why
 * the page chooses rather than inheriting every provider's consult.
 *
 * THE LABEL IS IN CODE, like "Book a Private Session" and every navigation
 * label on the site, since it reads the same on every page. "Complimentary"
 * is Frank's word and the content rules allow it.
 */
export const CONSULT_LABEL = "Book a Complimentary Consult";

type ConsultSource =
  | { consultUrl?: string | null; isActive?: boolean | null }
  | null
  | undefined;

/**
 * The consult address, or nothing when the practitioner is switched off or
 * offers none. `isActive !== false` rather than `=== true`, per the house
 * rule: a record written before the field existed carries no value and must
 * keep showing.
 */
export function consultHref(practitioner: ConsultSource): string | undefined {
  if (!practitioner || practitioner.isActive === false) return undefined;
  return practitioner.consultUrl?.trim() || undefined;
}
