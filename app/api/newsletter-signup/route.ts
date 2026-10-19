import { NextResponse } from "next/server";

import { client } from "@/sanity/lib/client";

/**
 * Newsletter signup, posted to the Systeme.io embed endpoint held in Sanity
 * at `newsletterSection.endpointUrl`.
 *
 * NOTHING THIS SENDS WAS REACHING SYSTEME.IO, found 2026-10-18.
 *
 * Frank added an address through the form on the live site and no contact
 * appeared in Systeme.io. The form sits in `components/shared/layout.tsx`, so
 * it is on every page of the site, and it has been telling everyone who used
 * it that they were signed up.
 *
 * Two separate faults, and the second is what hid the first:
 *
 * 1. The endpoint is an ordinary HTML page with a form on it, and that form
 *    posts `email=...` the standard way, as form-encoded data. This route was
 *    sending JSON, which Systeme.io does not read, so it rejected every
 *    submission.
 *
 * 2. Systeme.io answers 200 to anything posted at it, including a body with
 *    no email in it at all. The old code took that 200 as proof of success,
 *    so the route reported "Form submitted successfully" every time and the
 *    visitor was thanked for a subscription that never happened.
 *
 * So the status code must never be trusted here. A rejected submission hands
 * the subscribe form back, which is the ordinary web pattern; an accepted one
 * returns the thank-you page, which has no form on it. That is the signal,
 * confirmed against both outcomes on the live endpoint.
 *
 * SYSTEME.IO IS DOUBLE OPT-IN. A success means the confirmation email has
 * been sent, not that the contact is confirmed. Expect a new contact to sit
 * unconfirmed until the person clicks the link in it.
 *
 * The sturdier form of this is Systeme.io's own API at api.systeme.io, which
 * answers in JSON and states plainly whether it worked. It needs an API key
 * from the Systeme.io account, which is why this still posts to the embed
 * endpoint.
 */

/**
 * The subscribe form, handed back when Systeme.io rejects a submission.
 * Matching the form rather than the wording of the thank-you page, because
 * the page can be re-themed in Systeme.io and the field name cannot.
 */
const REJECTED_MARKER = 'name="email"';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required" },
        { status: 400 }
      );
    }

    const query = `*[_type == "newsletterSection"][0]`;
    const section = await client.fetch(query);
    const endpointUrl = section?.endpointUrl;

    if (!endpointUrl) {
      console.error("[newsletter] misconfigured, no endpointUrl in Sanity");
      return NextResponse.json(
        { error: "Newsletter is not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ email }).toString(),
    });

    const html = await response.text();
    const rejected = html.includes(REJECTED_MARKER);

    if (!response.ok || rejected) {
      console.error(
        `[newsletter] rejected, status=${response.status} formReturned=${rejected}`
      );
      return NextResponse.json(
        { error: "The newsletter service did not accept that address" },
        { status: 502 }
      );
    }

    console.log("[newsletter] ok, confirmation email sent by Systeme.io");
    return NextResponse.json({ message: "Subscribed" }, { status: 200 });
  } catch (error) {
    console.error("[newsletter] failed", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
