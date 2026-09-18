import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import {
  SIGNATURE_HEADER_NAME,
  assertValidSignature,
  isSignatureError,
} from "@sanity/webhook";

import {
  DOCUMENT_PATHS_QUERY,
  type DocumentForPaths,
  pathsForDocument,
  submitToIndexNow,
} from "@/lib/indexnow";
import { client } from "@/sanity/lib/client";

/**
 * CH-026: purge the search index caches when Sanity content changes.
 *
 * Sanity POSTs here on publish. Every delivery must carry a valid signature in
 * the `sanity-webhook-signature` header, checked against
 * SANITY_REVALIDATE_SECRET. Unsigned requests are refused, always.
 *
 * The search queries in `app/api/search/route.ts` and `app/search/page.tsx`
 * also carry a one hour time window, which is the backstop for this endpoint
 * failing silently. See SEARCH_REVALIDATE_SECONDS in `sanity/lib/client.ts`.
 *
 * CH-114 added a second job: refresh the pages the published document
 * appears on, and tell IndexNow they changed. See refreshPages below.
 */

/**
 * Purged on every accepted delivery, whatever the payload says.
 *
 * Deliberately not derived from the document type. This is a 44 page site
 * where a redundant purge costs one query against Sanity, while routing logic
 * that silently misses a type costs content that never appears in search. The
 * cheap failure is the right one to choose.
 */
const TAGS = ["search", "search-index"];

/** Kept short so it is greppable in the Vercel log stream. */
const LOG = "[revalidate]";

export async function POST(request: Request) {
  const startedAt = Date.now();
  const secret = process.env.SANITY_REVALIDATE_SECRET;

  if (!secret) {
    console.error(`${LOG} misconfigured, SANITY_REVALIDATE_SECRET is not set`);

    return NextResponse.json(
      { revalidated: false, reason: "not configured" },
      { status: 500 }
    );
  }

  const signature = request.headers.get(SIGNATURE_HEADER_NAME);

  if (!signature) {
    console.warn(`${LOG} rejected, reason=missing-signature`);

    return NextResponse.json(
      { revalidated: false, reason: "missing signature" },
      { status: 401 }
    );
  }

  /**
   * Must be the raw body. Reading with `.json()` and re-encoding with
   * `JSON.stringify()` can change key order and spacing, which changes the
   * hash and fails every real delivery.
   */
  const body = await request.text();

  try {
    await assertValidSignature(body, signature, secret);
  } catch (error) {
    const reason = isSignatureError(error) ? error.type : "unknown";
    console.warn(`${LOG} rejected, reason=${reason}`);

    return NextResponse.json(
      { revalidated: false, reason: "invalid signature" },
      { status: 401 }
    );
  }

  // The search purge below never branches on the payload. Only the page
  // refresh and the IndexNow submission after it read the id.
  let document = "unparseable-payload";
  let documentId: string | undefined;

  try {
    const payload = JSON.parse(body);
    document = `${payload?._type ?? "unknown-type"}/${payload?._id ?? "unknown-id"}`;
    documentId = typeof payload?._id === "string" ? payload._id : undefined;
  } catch {
    // The signature already passed, so an unparseable body is strange but not
    // a reason to skip the purge.
  }

  for (const tag of TAGS) {
    revalidateTag(tag);
  }

  console.log(
    `${LOG} ok, purged=${TAGS.join(",")} doc=${document} ms=${Date.now() - startedAt}`
  );

  const pages = await refreshPages(documentId, document);

  return NextResponse.json({
    revalidated: true,
    tags: TAGS,
    document,
    ...pages,
  });
}

/** Kept short so it is greppable in the Vercel log stream. */
const INDEXNOW_LOG = "[indexnow]";

/**
 * CH-114. Refreshes the pages the document appears on, then tells IndexNow
 * they changed.
 *
 * The refresh comes first because the notice is pointless without it. Pages
 * here are rebuilt at most once a minute, and the first visitor after that
 * minute is still handed the old copy while the new one renders. On a quiet
 * page that first visitor could be Bing, arriving because of this notice, and
 * reading the version the notice was about to replace. Refreshing the page
 * outright means the next request renders the new one.
 *
 * Unlike the search purge, this is routed by document type, because a URL
 * cannot be announced without knowing which URL it is. A type that is missed
 * costs a minute's delay and an unannounced change, not missing content, and
 * the log line names it.
 *
 * Never fails the delivery. The search purge above has already happened, and
 * a failed notice is not worth Sanity retrying the whole webhook for.
 */
async function refreshPages(documentId: string | undefined, document: string) {
  if (!documentId) return { paths: [], indexNow: "no-document" };

  try {
    const doc = await client.fetch<DocumentForPaths>(
      DOCUMENT_PATHS_QUERY,
      { id: documentId },
      // Never cached, and never stega-encoded: a slug carrying invisible
      // preview markers would announce an address that does not exist.
      { cache: "no-store", stega: false }
    );

    const paths = pathsForDocument(doc);

    if (!paths.length) {
      // Also the path for a deleted document, which can no longer be read to
      // find its address. Bing finds the 404 on its next crawl.
      console.log(
        `${INDEXNOW_LOG} skipped, reason=${doc ? "no-page-for-type" : "document-not-found"} doc=${document}`
      );
      return { paths, indexNow: "skipped" };
    }

    for (const path of paths) {
      revalidatePath(path);
    }

    // Local runs and the test script refresh pages but announce nothing.
    // Only production serves the key file at the address IndexNow checks.
    if (process.env.VERCEL_ENV !== "production") {
      console.log(
        `${INDEXNOW_LOG} skipped, reason=not-production paths=${paths.join(",")}`
      );
      return { paths, indexNow: "not-production" };
    }

    const { status } = await submitToIndexNow(paths);
    const outcome = status === 200 || status === 202 ? "ok" : "refused";

    console.log(
      `${INDEXNOW_LOG} ${outcome}, status=${status} paths=${paths.join(",")} doc=${document}`
    );

    return { paths, indexNow: String(status) };
  } catch (error) {
    const reason = error instanceof Error ? error.name : "unknown";
    console.error(`${INDEXNOW_LOG} failed, reason=${reason} doc=${document}`);

    return { paths: [], indexNow: "failed" };
  }
}

/**
 * Lets Frank confirm the route is deployed with a plain browser request or
 * curl, without needing to produce a signature.
 */
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      message: "Sanity revalidation endpoint. POST with a signature.",
    },
    { status: 405 }
  );
}
