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
 * second is a clinical claim that needs a practitioner's name against it, and
 * Frank declined a reviewed-by line on 2026-09-15.
 *
 * The <time> element carries the machine-readable value in dateTime, which is
 * what a parser reads, while the visible text stays in the long form a person
 * reads.
 *
 * On blog posts, the same date is published as dateModified in the BlogPosting
 * markup, built by buildBlogPostingJsonLd in lib/structured-data.tsx. CH-105.
 * Treatment pages carry no dateModified: Google reads it on Article and
 * BlogPosting, and putting it on a Service node would be markup nothing
 * consumes.
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
