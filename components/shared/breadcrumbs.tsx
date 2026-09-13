import Link from "next/link";

import { ChevronRightIcon } from "lucide-react";

import type { Crumb } from "@/lib/breadcrumbs";
import { JsonLdScript, buildBreadcrumbJsonLd } from "@/lib/structured-data";

/**
 * The visible breadcrumb trail and its markup. CH-009.
 *
 * It emits both, from one Crumb[], because Google asks that the markup
 * describe what the page actually shows and the surest way to keep that true
 * is to make it impossible to add one without the other. A page wires this in
 * once and cannot end up with a trail its JSON-LD contradicts.
 *
 * It renders nothing below two items. A trail reading Home on its own says
 * less than the logo already does.
 *
 * On the markup: nav with an accessible name, because a screen reader lists
 * landmarks and "navigation" twice on a page tells a visitor nothing. An
 * ordered list, because the order carries the meaning. The separator is a
 * decorative icon, hidden from assistive technology, since the list structure
 * already conveys the nesting and a chevron read aloud between every item is
 * noise.
 */
export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  if (!crumbs || crumbs.length < 2) return null;

  return (
    <>
      <JsonLdScript
        data={buildBreadcrumbJsonLd(crumbs)}
        id="breadcrumb-json-ld"
      />
      <nav aria-label="Breadcrumb" className="bg-white">
        <div className="container">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 py-4 text-sm font-light text-primary">
            {crumbs.map((crumb, index) => {
              const isLast = index === crumbs.length - 1;

              return (
                <li
                  key={`${crumb.name}-${index}`}
                  className="flex items-center gap-x-2"
                >
                  {index > 0 ? (
                    <ChevronRightIcon
                      size={14}
                      aria-hidden="true"
                      className="shrink-0 opacity-60"
                    />
                  ) : null}
                  {crumb.path && !isLast ? (
                    <Link href={crumb.path} className="hover:underline">
                      {crumb.name}
                    </Link>
                  ) : (
                    /*
                     * aria-current marks the page being viewed. Without it the
                     * last item is just unlinked text and a screen reader gives
                     * no reason for the difference.
                     */
                    <span aria-current="page" className="text-primary/70">
                      {crumb.name}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </nav>
    </>
  );
}
