import { NextResponse } from "next/server";

import { getClient } from "@/sanity/lib/client";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const client = getClient();
    const query = `*[_type == "newsletterSection"][0]`;
    const { endpointUrl } = await client.fetch(query);

    if (!endpointUrl) {
      throw new Error("API endpoint URL not found in Sanity");
    }

    // Send the data to the fetched API endpoint
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit to Systeme.io: ${response.statusText}`);
    }

    // Handle success
    return NextResponse.json(
      { message: "Form submitted successfully" },
      { status: 200 }
    );
  } catch (error) {
    // Handle errors
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
