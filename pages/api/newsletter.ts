import { NextApiRequest, NextApiResponse } from 'next';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<string | void>
) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send('Email is required');
  }

  try {
    // Configure your Systeme.io API endpoint and payload
    const SYSTEME_ENDPOINT =
      'https://systeme.io/embedded/12083593/subscription';
    const payload = { email };

    // Send the data to Systeme.io
    const response = await fetch(SYSTEME_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit to Systeme.io: ${response.statusText}`);
    }

    // Handle success
    return res.status(200).send('Form submitted successfully');
  } catch (error) {
    // Handle errors
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
}
