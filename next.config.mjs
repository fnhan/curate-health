/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // ===================================================================
      // TREATMENTS ARE FLAT. THE CATEGORY IS NOT IN A CHILD URL.
      //
      // /services/rehab/physiotherapy is now /services/physiotherapy. The
      // point of dropping the category is that renaming a category stops
      // being a redirect exercise across every child.
      //
      // Recovery Sanctuary is the deliberate exception and keeps its nested
      // children. Do not add redirects for those: they are live URLs, and
      // /services/recovery-sanctuary/flowpresso-therapy is the strongest
      // ranking page on the site. lib/service-urls.ts is the source of truth.
      //
      // STILL TO DO, when the categories are renamed in Sanity:
      //
      //   /services/rehab            -> /services/one-on-one-care
      //   /services/exercise-therapy -> /services/movement-and-training
      //   /services/mental-health/*  -> breathwork and meditation move under
      //                                 recovery-sanctuary and stay nested
      //   /services/lifestyle-medicine/* -> the orphaned branch
      //
      // Retarget the entries below at that point rather than adding a second
      // hop. /services/primary-care already points at /services/rehab, so it
      // becomes a chain the moment that category moves.
      // ===================================================================

      // Old nested treatment URLs. Every one of these was live and indexed.
      {
        source: "/services/rehab/acupuncture",
        destination: "/services/acupuncture",
        statusCode: 301,
      },
      {
        source: "/services/rehab/chiropractic-care",
        destination: "/services/chiropractic-care",
        statusCode: 301,
      },
      {
        source: "/services/rehab/massage-therapy",
        destination: "/services/massage-therapy",
        statusCode: 301,
      },
      {
        source: "/services/rehab/naturopathy",
        destination: "/services/naturopathy",
        statusCode: 301,
      },
      {
        source: "/services/rehab/physiotherapy",
        destination: "/services/physiotherapy",
        statusCode: 301,
      },
      {
        source: "/services/mental-health/psychotherapy",
        destination: "/services/psychotherapy",
        statusCode: 301,
      },
      {
        source: "/services/exercise-therapy/exercise-rehab",
        destination: "/services/exercise-rehab",
        statusCode: 301,
      },
      {
        source: "/services/exercise-therapy/fitness-training",
        destination: "/services/fitness-training",
        statusCode: 301,
      },
      {
        source: "/services/exercise-therapy/performance-training",
        destination: "/services/performance-training",
        statusCode: 301,
      },

      // Legacy URLs that never matched a page, kept from CH-002.
      //
      // /services/chiropractic points straight at the flat URL rather than
      // via /services/rehab/chiropractic-care, which is now itself a
      // redirect. Same for the acupunture typo. One hop, never a chain.
      //
      // /services/physiotherapy and /services/massage-therapy are gone from
      // this list on purpose: they are real pages now, and redirecting them
      // would have pointed each at itself.
      {
        source: "/services/primary-care",
        destination: "/services/rehab",
        statusCode: 301,
      },
      {
        source: "/services/chiropractic",
        destination: "/services/chiropractic-care",
        statusCode: 301,
      },
      {
        source: "/services/rehab/acupunture",
        destination: "/services/acupuncture",
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
