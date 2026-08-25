/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // CH-002. The legacy service URLs, which predate the move of these
      // treatments under /services/rehab. Until CH-001 they returned 500, so
      // they are the four paths named in the CH-001 acceptance check.
      //
      // statusCode 301 rather than permanent: true, which Next emits as a 308.
      // The tickets call for 301 and it is what the rest of the site's
      // redirects are measured against.
      {
        source: "/services/primary-care",
        destination: "/services/rehab",
        statusCode: 301,
      },
      {
        source: "/services/physiotherapy",
        destination: "/services/rehab/physiotherapy",
        statusCode: 301,
      },
      {
        source: "/services/chiropractic",
        destination: "/services/rehab/chiropractic-care",
        statusCode: 301,
      },
      {
        source: "/services/massage-therapy",
        destination: "/services/rehab/massage-therapy",
        statusCode: 301,
      },

      // CH-022. The Sanity slug was "acupunture". It is now "acupuncture", so
      // this catches anything still pointing at the misspelling. Keep it: the
      // typo was the live URL for long enough to be linked and indexed.
      {
        source: "/services/rehab/acupunture",
        destination: "/services/rehab/acupuncture",
        statusCode: 301,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://us.i.posthog.com/decide",
      },
    ];
  },
  // ! This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  experimental: {
    taint: true,
  },
  // ...other config settings
};

export default nextConfig;
