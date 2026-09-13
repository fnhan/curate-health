/**
 * A visible "last reviewed" line. CH-111.
 *
 * On a clinic site, how old a page is matters to a reader deciding whether to
 * trust it, and to Google's assessment of whether health content is being
 * maintained. Nothing on the site said anything about it.
 *
 * THE DATE IS SANITY'S _updatedAt, AND THAT IS A REAL LIMIT
 *
 * It changes whenever the document is saved, including for a typo or an alt
 * text fix. So this says "last reviewed", not "medically reviewed by": the
 * second is a clinical claim and needs a practitioner's name against it, which
 * is CH-105's job and belongs with the byline work.
 *
 * The <time> element carries the machine-readable value in dateTime, which is
 * what a parser reads, while the visible text stays in the long form a person
 * reads.
 *
 * The dateModified property in structured data is deliberately not emitted
 * here. Google reads it on Article and BlogPosting, and neither exists on this
 * site yet. Putting it on the Service nodes these pages currently carry would
 * be markup nothing consumes, so it goes in with BlogPosting under CH-105.
 */

const FORMAT = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "America/Toronto",
});

export function LastUpdated({
  date,
  className = "",
}: {
  date?: string | null;
  className?: string;
}) {
  if (!date) return null;

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;

  return (
    <p className={`text-sm font-light text-primary/60 ${className}`}>
      Last reviewed{" "}
      <time dateTime={parsed.toISOString().slice(0, 10)}>
        {FORMAT.format(parsed)}
      </time>
    </p>
  );
}
