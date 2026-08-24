import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import {
  SIGNATURE_HEADER_NAME,
  assertValidSignature,
  isSignatureError,
} from "@sanity/webhook";

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

  // Used for the log line only. Nothing below branches on the payload.
  let document = "unparseable-payload";

  try {
    const payload = JSON.parse(body);
    document = `${payload?._type ?? "unknown-type"}/${payload?._id ?? "unknown-id"}`;
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

  return NextResponse.json({
    revalidated: true,
    tags: TAGS,
    document,
  });
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
