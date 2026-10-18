"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { HOVER_UNDERLINE_INLINE, UNDERLINE_DRAWN } from "@/lib/hover-underline";

/**
 * THE SECOND MENU. THE ONE PATTERN, FOR EVERY SECTION OF THE SITE.
 *
 * Frank's rule, 2026-09-20: a section page carries this menu rather than a
 * breadcrumb trail, and every section's menu looks and behaves the same. It
 * was built twice before that, once for services and once for products, with
 * the hover effect pasted between them; this is the single copy both now use,
 * and the one to use for any section added later.
 *
 * What the pattern is, so it can be repeated without reading the classes:
 *
 *   Band      full width, sage (bg-secondary), directly under the hero
 *   Type      the page's own font, light weight, dark green
 *   Spacing   the site container, 2rem above and below, 1rem between items
 *   Hover     a hairline sweeps in under the word, left to right, over half
 *             a second, and stays drawn on the page you are on
 *   Overflow  one line that scrolls sideways on a phone, never wraps
 *
 * The label is the section itself, first, then a divider, then the pages in
 * it. Give it an href when the section has a hub page; leave it off when it
 * does not, as the legal pages do, and it renders as plain text rather than
 * as a link to a page that would 404.
 */

export type SectionNavItem = {
  title: string;
  href: string;
};

/** Drawn already, for the page being viewed. */

export function SectionNavigation({
  label,
  labelHref,
  items,
  ariaLabel,
}: {
  label: string;
  labelHref?: string;
  items: SectionNavItem[];
  /** Names the menu for screen readers, e.g. "Services". */
  ariaLabel: string;
}) {
  const pathname = usePathname();
  const isCurrent = (href: string) => pathname === href;

  return (
    <div className="bg-secondary">
      <nav aria-label={ariaLabel} className="container font-light text-primary">
        <ul className="scrollbar-thumb-rounded-full flex items-center gap-4 overflow-x-auto whitespace-nowrap py-8 scrollbar-thin scrollbar-track-secondary scrollbar-thumb-primary">
          <li>
            {labelHref ? (
              <Link
                href={labelHref}
                aria-current={isCurrent(labelHref) ? "page" : undefined}
                className={`${HOVER_UNDERLINE_INLINE} ${isCurrent(labelHref) ? UNDERLINE_DRAWN : ""}`}
              >
                {label}
              </Link>
            ) : (
              <span>{label}</span>
            )}
          </li>
          <li aria-hidden="true" className="text-primary">
            |
          </li>
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isCurrent(item.href) ? "page" : undefined}
                className={`${HOVER_UNDERLINE_INLINE} ${isCurrent(item.href) ? UNDERLINE_DRAWN : ""}`}
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
