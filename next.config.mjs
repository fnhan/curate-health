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

      // Renamed categories, applied to Sanity on 2026-09-08.
      //
      // These were served by RENAMED_SERVICE_SLUGS in
      // app/services/[slug]/page.tsx while the rename happened, which is what
      // made it gap-free: that alias only fires once the Sanity slug changes,
      // so neither ordering could break the old URL.
      //
      // Now that the new slugs exist, the redirect belongs here instead. A
      // config redirect is served before rendering rather than after a Sanity
      // round trip, and permanentRedirect from next/navigation emits 308 while
      // every other redirect on this site is 301. Google treats the two the
      // same, but one convention is easier to audit than two.
      //
      // The alias stays in the route as a backstop, so dropping an entry here
      // still redirects rather than 404s.
      {
        source: "/services/rehab",
        destination: "/services/clinical-care",
        statusCode: 301,
      },
      {
        source: "/services/exercise-therapy",
        destination: "/services/movement-and-training",
        statusCode: 301,
      },
      {
        source: "/services/one-on-one-care",
        destination: "/services/clinical-care",
        statusCode: 301,
      },

      // Retired categories. Both documents are kept, but neither is listed
      // and neither hub should be reachable.
      //
      // Mental Health is unpublished, not deleted, for when
      // /help-with/mental-health is built. It goes to /services rather than
      // to /services/psychotherapy: someone searching for mental health
      // support is asking a broader question than one modality answers, and
      // pointing the URL at a single service forfeits the broader query.
      // Retarget it at the concern page once that exists.
      //
      // Lifestyle Medicine was a second service taxonomy contradicting the
      // main one: live, indexed, in no sitemap, and reachable by no internal
      // link. It goes to /our-programs, the closest live ancestor of where
      // the restructure brief wants it, /our-programs/curate-lifestyle.
      // Retarget when that page exists.
      {
        source: "/services/mental-health",
        destination: "/services",
        statusCode: 301,
      },
      {
        source: "/services/lifestyle-medicine",
        destination: "/our-programs",
        statusCode: 301,
      },
      // Straight to the hub rather than via /services/exercise-therapy, which
      // is itself a redirect. Its content was compared against all three
      // Movement and Training pages and holds nothing they do not.
      {
        source: "/services/lifestyle-medicine/exercise-therapy",
        destination: "/services/movement-and-training",
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
      //
      // /services/primary-care now points at the renamed category directly.
      // It used to point at /services/rehab, which became a redirect the
      // moment the rename landed, making it a two hop chain.
      {
        source: "/services/primary-care",
        destination: "/services/clinical-care",
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
