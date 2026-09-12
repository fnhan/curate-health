import { MapPinIcon, PhoneIcon } from "lucide-react";

import { addressOneLine } from "@/lib/address";
import { externalLinkProps } from "@/lib/links";
import { SITE_SETTINGS_QUERYResult } from "@/sanity.types";

/**
 * Where the cafe is, when it is open, and how to reach it.
 *
 * WHY THIS EXISTS AT ALL
 *
 * Frank pointed the cafe's Google Business Profile at /cafe on 2026-09-12, so
 * this is the page somebody lands on from Google Maps. It had no hours, no
 * address and no phone anywhere on it. Hours are the first thing that visitor
 * wants and the page could not answer.
 *
 * It also keeps the page honest about its own markup. The CafeOrCoffeeShop
 * entity on this page publishes openingHoursSpecification, and structured data
 * is supposed to describe what the page shows rather than assert things the
 * page keeps to itself.
 *
 * EVERYTHING HERE IS THE CLINIC'S, BY DESIGN
 *
 * The cafe keeps the clinic's hours, address and phone, confirmed by Frank on
 * 2026-09-12, and when the clinic's change the cafe's change with them. So this
 * reads siteSettings rather than holding a copy. A second set of fields would
 * let the two drift the moment somebody edited one, which is the failure CH-025
 * spent a whole ticket undoing for the address.
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

const TITLE_CASE: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export function CafeHours({
  siteSettings,
}: {
  siteSettings: SITE_SETTINGS_QUERYResult;
}) {
  const hours = siteSettings?.businessHours;
  const contact = siteSettings?.contactInfo;

  if (!hours) return null;

  const standard =
    hours.standardHours === "custom"
      ? hours.customStandardHours
      : hours.standardHours;

  const exceptions = new Map(
    (hours.exceptions ?? [])
      .filter((e) => e.day)
      .map((e) => [e.day!.toLowerCase(), e.hours])
  );

  const open = new Set([
    ...(hours.daysOpen ?? []).map((d) => d.toLowerCase()),
    ...exceptions.keys(),
  ]);

  // Every day is listed, closed ones included, in week order rather than the
  // order Sanity happens to store them in. A visitor scanning for today should
  // not have to work out whether a missing day means closed or unknown, which
  // is the same reasoning the schema uses.
  const rows = DAY_ORDER.map((day) => ({
    day: TITLE_CASE[day],
    hours: open.has(day)
      ? (exceptions.has(day) ? exceptions.get(day) : standard) || "Closed"
      : "Closed",
  }));

  return (
    <section className="bg-white py-14 text-primary md:py-24">
      <div className="container grid gap-10 md:grid-cols-2 md:gap-16">
        <div className="space-y-4">
          <h2 className="text-2xl font-light md:text-3xl">Visit the cafe</h2>
          <p className="max-w-prose font-light leading-7">
            The cafe is inside Curate Health and keeps the same hours as the
            clinic.
          </p>
          <address className="space-y-3 text-sm not-italic md:text-base">
            <a
              className="flex w-fit items-start gap-2 hover:underline"
              href={contact?.mapLink ?? ""}
              {...externalLinkProps(contact?.mapLink ?? "")}
            >
              <MapPinIcon size={18} className="mt-1 shrink-0" />
              <span>{addressOneLine(contact?.address)}</span>
            </a>
            {contact?.phone ? (
              <a
                className="flex w-fit items-center gap-2 hover:underline"
                href={`tel:${contact.phone}`}
              >
                <PhoneIcon size={18} className="shrink-0" />
                <span>{contact.phone}</span>
              </a>
            ) : null}
          </address>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-medium">Hours</h3>
          <dl className="space-y-2 text-sm md:text-base">
            {rows.map((row) => (
              <div key={row.day} className="grid grid-cols-2 gap-4">
                <dt className="font-medium">{row.day}</dt>
                <dd className="text-right tabular-nums">{row.hours}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
