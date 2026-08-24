import { draftMode } from "next/headers";

import { type QueryOptions, type QueryParams, createClient } from "next-sanity";
import "server-only";

import { apiVersion, dataset, projectId } from "../env";
import { token } from "./token";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  stega: {
    enabled: process.env.NEXT_PUBLIC_VERCEL_ENV === "preview",
    studioUrl: "/studio",
  },
});

/**
 * Backstop window, in seconds, for the tag-purged search queries. See CH-026.
 *
 * The webhook at `app/api/revalidate` is what keeps search fresh in practice,
 * firing within seconds of a publish. This window exists for one reason: to
 * bound how long stale content is served if that webhook silently stops
 * firing. It is not the freshness mechanism and it is not redundant with the
 * webhook. Do not remove it.
 *
 * One hour is deliberate. Shorter, and the fixed cadence does the webhook's job
 * and masks its failure completely, so a dead webhook would never be noticed.
 * Longer, and newly published practitioner pages and blog posts stay missing
 * from site search long enough to look like the content does not exist.
 */
export const SEARCH_REVALIDATE_SECONDS = 3600;

export async function sanityFetch<QueryResponse>({
  query,
  params = {},
  revalidate = 60,
  tags = [],
}: {
  query: string;
  params?: QueryParams;
  revalidate?: number | false;
  tags?: string[];
}) {
  const isDraftMode = draftMode().isEnabled;
  if (isDraftMode && !token) {
    throw new Error("Missing environment variable SANITY_API_READ_TOKEN");
  }

  // Draft Mode is never cached. Otherwise the caller's revalidate stands.
  //
  // This used to force `revalidate: false` whenever tags were supplied, on the
  // theory that revalidateTag() would purge them. Nothing ever called
  // revalidateTag and no webhook existed, so tagged queries were cached
  // indefinitely and the search index only refreshed on redeploy. See CH-026.
  //
  // Tags are still attached, so app/api/revalidate can purge on publish. The
  // caller's time window is the backstop for that webhook failing silently,
  // which is why both mechanisms are here.
  const dynamicRevalidate = isDraftMode ? 0 : revalidate;

  return client.fetch<QueryResponse>(query, params, {
    ...(isDraftMode &&
      ({
        token: token,
        perspective: "previewDrafts",
        stega: true,
      } satisfies QueryOptions)),
    next: {
      revalidate: dynamicRevalidate,
      tags,
    },
  });
}
