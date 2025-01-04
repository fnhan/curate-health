/**
 * Separate Sanity client instance for middleware to avoid token tainting issues.
 * When using Sanity with Next.js App Router, the main client token is tainted
 * to prevent exposing it to the client. However, this causes issues in middleware
 * where we need to fetch the coming soon status. This separate client bypasses
 * the tainting mechanism while remaining secure since middleware only runs
 * server-side.
 */

import { createClient } from "@sanity/client";

export const middlewareClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});
