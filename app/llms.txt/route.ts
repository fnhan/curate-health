import { NextResponse } from "next/server";

import {
  BRAND_AI_CONTEXT_REVALIDATE,
  getBrandAiContext,
} from "@/lib/brand-ai-context";

export const revalidate = BRAND_AI_CONTEXT_REVALIDATE;

export async function GET() {
  const llmsTxt = await getBrandAiContext();

  return new NextResponse(llmsTxt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
