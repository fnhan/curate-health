import { NextResponse } from "next/server";
import { z } from "zod";

import { getCachedJaneAvailability } from "@/lib/jane-availability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const availabilityRequestSchema = z.object({
  bookingUrl: z.string().url(),
  serviceName: z.string().min(1),
  practitionerName: z.string().min(1).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must use YYYY-MM-DD"),
  limit: z.number().int().positive().max(50).optional(),
});

function isTimeoutError(error: unknown) {
  return error instanceof Error && /timeout/i.test(error.message);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = availabilityRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid request body.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  try {
    const result = await getCachedJaneAvailability(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[check-availability] Request failed", error);

    return NextResponse.json(
      {
        error: isTimeoutError(error)
          ? "Jane availability check timed out."
          : "Unable to check Jane availability.",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: isTimeoutError(error) ? 504 : 502 }
    );
  }
}
