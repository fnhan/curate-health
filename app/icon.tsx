import { FAVICON_QUERYResult } from '../sanity.types';
import { FAVICON_QUERY } from '../sanity/lib/queries';
import { sanityFetch } from '../sanity/lib/server-client';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 128,
  height: 128,
};
export const contentType = 'image/png';

// Image generation
export default async function Icon() {
  const result = await sanityFetch<FAVICON_QUERYResult>({
    query: FAVICON_QUERY,
  });

  const faviconUrl = result?.url;

  if (!faviconUrl) {
    // Handle the error or provide a fallback
    return new Response('Favicon not found', { status: 404 });
  }

  const response = await fetch(faviconUrl);
  const arrayBuffer = await response.arrayBuffer();

  return new Response(arrayBuffer, {
    headers: {
      'Content-Type': contentType,
      'Content-Length': arrayBuffer.byteLength.toString(),
    },
  });
}
