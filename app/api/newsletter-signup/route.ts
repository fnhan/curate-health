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

/**
 * Where a refused signup goes so it is not lost.
 *
 * NOT SANITY, AND THAT IS THE POINT. The production dataset answers queries
 * with no token at all, checked 2026-10-18, so a document holding somebody's
 * email address would be readable by anyone who asked for it. A newsletter
 * address is ordinary personal information and it does not belong on a public
 * API.
 *
 * Formspree instead, which the contact and programs forms already post to, so
 * it is private, already in the stack, and it emails Frank the moment it
 * happens. That last part is the half that matters: the fault this guards
 * against ran for two years and nine months precisely because nothing ever
 * said a word.
 *
 * With no endpoint configured it writes the address to the log rather than
 * dropping it, which is weaker (Vercel keeps those briefly) but is never
 * nothing. Set NEWSLETTER_FALLBACK_ENDPOINT to a Formspree form id to turn
 * the email on.
 */
async function keepRefusedSignup(email: string, why: string) {
  const endpoint = process.env.NEWSLETTER_FALLBACK_ENDPOINT;

  if (!endpoint) {
    console.error(
      `[newsletter] NOT DELIVERED, address kept here only: ${email} (${why}). ` +
        `Set NEWSLETTER_FALLBACK_ENDPOINT so these are emailed instead.`
    );
    return;
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      /*
       * NOT A FIELD CALLED `email`, and this is the whole trap.
       *
       * Formspree treats a field of that name as the reply-to address and
       * validates it, so it answered 422 "should be an email" and sent
       * nothing. Found 2026-10-19 when the first real refusal produced no
       * message.
       *
       * The addresses most likely to be refused by Systeme.io are malformed
       * ones, which are exactly the ones Formspree also refuses, so the
       * safety net was failing for precisely the class of address it was
       * built to catch. Under any other name the value is passed through
       * untouched.
       */
      body: JSON.stringify({
        _subject: "Newsletter signup was refused by Systeme.io",
        refusedAddress: email,
        reason: why,
        submittedAt: new Date().toISOString(),
        message:
          `${email} tried to join the newsletter and Systeme.io refused it (${why}). ` +
          `Add them by hand, and check the signup form is still working.`,
      }),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    console.error(`[newsletter] refused, address forwarded for recovery (${why})`);
  } catch (err) {
    /*
     * Log the address if the forward itself fails, so a bad endpoint cannot
     * turn this back into a silent loss.
     */
    console.error(
      `[newsletter] NOT DELIVERED and could not forward, address kept here only: ${email} (${why})`,
      err
    );
  }
}

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
      const why = rejected ? "form returned" : `status ${response.status}`;
      await keepRefusedSignup(email, why);
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
