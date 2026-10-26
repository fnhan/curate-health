import React from "react";

import Layout from "@/components/shared/layout";
import { LAYOUT_QUERY_RESULT } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import { LAYOUT_QUERY } from "@/sanity/lib/queries";

/**
 * /classes had no layout, so it shipped without the header: no sidebar
 * trigger, no home link, no Book Now, and no footer. Frank found it on
 * 2026-10-26. CH-107 built the route and missed this.
 *
 * **Every route segment needs one of these. There is no exception.** The root
 * layout deliberately does not wrap the site in `Layout`, because /studio,
 * /coming-soon and /login must not carry the marketing header, so each
 * section opts in instead. That makes forgetting one silent: the page renders,
 * every audit passes, and the only thing missing is the thing every other page
 * has.
 */
export default async function ClassesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const layout = await sanityFetch<LAYOUT_QUERY_RESULT>({
    query: LAYOUT_QUERY,
  });
  return <Layout layout={layout}>{children}</Layout>;
}
