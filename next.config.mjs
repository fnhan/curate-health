/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // CH-022 hotfix. The Sanity slug was corrected from "acupunture" to
      // "acupuncture" on 2026-08-24. The dataset is shared with production, so
      // that rename went live immediately while this redirect sat unmerged,
      // leaving a previously indexed URL returning 404 in the meantime.
      //
      // Shipped on its own, ahead of the rest of the route work in #195, to
      // close that window. statusCode 301 rather than permanent: true, which
      // Next emits as a 308.
      //
      // When the flatten lands and acupuncture moves to /services/acupuncture,
      // retarget this entry rather than adding a second hop. Every legacy URL
      // resolves to its final destination in one redirect.
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
