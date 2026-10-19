import { SectionNavigation } from "@/components/shared/section-navigation";
import { ABOUT_INDEX_QUERY_RESULT } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import { ABOUT_INDEX_QUERY } from "@/sanity/lib/queries";

/**
 * The About second menu, on the hub and on all five pages under it.
 *
 * /about had this band and its children did not, while every page under
 * /services carries the services one. Frank spotted the gap on 2026-10-18.
 *
 * **It fetches its own list**, the way the page shape of this site makes
 * easiest: the five children come from `ABOUT_INDEX_QUERY`, and a child page's
 * own query knows nothing about its siblings. ServicesNavigation takes its
 * list as a prop because every services page already had it to hand; these do
 * not, and six separate fetches of a six item list on a statically rendered
 * page is not worth a prop drill through five routes.
 *
 * The look and the hover both live in `section-navigation.tsx`, which every
 * section uses.
 */
export async function AboutNavigation() {
  const about = await sanityFetch<ABOUT_INDEX_QUERY_RESULT>({
    query: ABOUT_INDEX_QUERY,
  });

  const items = (about?.children ?? [])
    .filter((child) => child?.title && child?.slug)
    .map((child) => ({
      title: child!.title!,
      href: `/about/${child!.slug}`,
    }));

  if (items.length === 0) return null;

  return (
    <SectionNavigation
      ariaLabel="About"
      label="About"
      labelHref="/about"
      items={items}
    />
  );
}
