/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // ===================================================================
      // READ THIS BEFORE ADDING THE RESTRUCTURE REDIRECTS
      //
      // Every entry in this block points INTO /services/rehab/*. The
      // restructure brief flattens those same URLs back OUT, so each entry
      // here has to be removed or retargeted in the same commit that adds
      // the flatten. Adding the flatten on top of this block, without
      // touching it, produces two infinite redirect loops:
      //
      //   /services/physiotherapy   -> /services/rehab/physiotherapy
      //   /services/rehab/physiotherapy -> /services/physiotherapy   (flatten)
      //
      // and the same for massage-therapy. Config redirects run before
      // routing, so the pair never resolves and the visitor gets
      // ERR_TOO_MANY_REDIRECTS rather than the page.
      //
      // What each entry needs when the flatten lands:
      //
      //   /services/physiotherapy    DELETE. Becomes the real page.
      //   /services/massage-therapy  DELETE. Becomes the real page.
      //   /services/primary-care     RETARGET to /services/one-on-one-care
      //   /services/chiropractic     RETARGET to /services/chiropractic-care
      //   /services/rehab/acupunture RETARGET to /services/acupuncture
      //
      // Retarget rather than chain. The brief's standing rule is that every
      // legacy URL reaches its final destination in exactly one hop, and a
      // redirect whose target is itself a redirect should be collapsed.
      // ===================================================================
      //
      // CH-002. The legacy service URLs, which predate the move of these
      // treatments under /services/rehab. Until CH-001 they returned 500, so
      // they are the four paths named in the CH-001 acceptance check.
      //
      // These are correct as they stand: today /services/rehab/* is where
      // the pages actually live, and pointing at the future flat URLs would
      // redirect to pages that do not exist yet.
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
