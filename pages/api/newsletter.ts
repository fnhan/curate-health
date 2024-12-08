import { NextApiRequest, NextApiResponse } from "next";

import { getClient } from "../../sanity/lib/client";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<string | void>
) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send("Email is required");
  }

  try {
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
    return res.status(200).send("Form submitted successfully");
  } catch (error) {
    // Handle errors
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
}
