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

/**
 * The same backstop, for ordinary page queries. One hour, not one minute.
 *
 * **This is the ISR Writes fix. 2026-10-26.** The default was 60, so every
 * page re-rendered at most once a minute whenever anybody asked for it, and
 * every re-render is a write against Vercel's ISR Writes allowance. At 56
 * pages that is up to 80,000 writes a day, which is how the free tier's
 * 200,000 went in a matter of days. Crawlers and the audit scripts in this
 * repo are enough to hold a page at that ceiling on their own.
 *
 * A minute never bought freshness anyway. The webhook at `app/api/revalidate`
 * purges a document's pages the moment it is published, so a page is already
 * correct within seconds; the window only decides how stale things get **if
 * that webhook silently stops firing**, which is the same question
 * SEARCH_REVALIDATE_SECONDS above answers, so it gets the same answer.
 *
 * **Raising this required the webhook to cover site-wide documents**, which it
 * did not. `pathsForDocument` returns nothing for siteSettings, because those
 * change every page at once and IndexNow asks sites not to resubmit
 * everything. Nothing called `revalidatePath` for them either, so the navigation
 * and the footer were being kept fresh purely by the 60 second window. The
 * route now purges the whole site for those types. Do not shorten this back
 * without checking that is still true.
 */
export const PAGE_REVALIDATE_SECONDS = 3600;

export async function sanityFetch<QueryResponse>({
  query,
  params = {},
  revalidate = PAGE_REVALIDATE_SECONDS,
  tags = [],
}: {
  query: string;
  params?: QueryParams;
  revalidate?: number | false;
  tags?: string[];
}) {
  const isDraftMode = (await draftMode()).isEnabled;
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
