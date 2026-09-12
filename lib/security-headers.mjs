/**
 * Response security headers. CH-012.
 *
 * PHIPA and general security, not SEO. The site carried none of these: no CSP,
 * no nosniff, no frame protection, no referrer policy, no permissions policy.
 * Only the Strict-Transport-Security header Vercel adds on its own.
 *
 * Kept out of next.config.mjs because that file is already 200 lines of
 * redirects and the two have nothing to do with each other. It is .mjs rather
 * than .ts because next.config.mjs imports it directly, before any TypeScript
 * step exists to compile it.
 *
 * THE ALLOWLIST IS AN INVENTORY, NOT A GUESS
 *
 * Every origin below was found in rendered production HTML or in the code that
 * runs at runtime, and each is annotated with what needs it. A CSP that misses
 * an origin warns nobody: the feature stops working, in the visitor's browser,
 * silently. So when something here becomes unused, delete it, and when a new
 * integration is added, add it in the same change rather than after somebody
 * reports a blank map.
 */

/** Sanity image CDN. Every photo on the site. */
const SANITY_CDN = "https://cdn.sanity.io";

/**
 * Sanity's API, including the websocket the Studio listens on.
 *
 * The broad *.sanity.io is here for Presentation mode, which frames the site
 * from the Studio and runs an overlay inside it that talks back to Sanity. That
 * path was not exercised locally, since draft mode needs a Studio session, so
 * it is allowed rather than discovered broken by an editor mid-preview. The
 * narrower entries stay because they document what the normal path uses.
 */
const SANITY_API = [
  "https://*.api.sanity.io",
  "wss://*.api.sanity.io",
  "https://*.apicdn.sanity.io",
  "https://*.sanity.io",
];

/**
 * Mux. image.mux.com serves the poster frame, stream.mux.com the video.
 *
 * THE WILDCARD IS LOAD-BEARING. DO NOT NARROW IT TO THE TWO HOSTS ABOVE.
 *
 * stream.mux.com is only where the player asks. Mux answers by redirecting the
 * HLS manifest and every segment to a regional edge host, and that name is
 * assembled from the region and the CDN of the moment:
 *
 *   manifest-oci-us-ashburn-1-vop1.fastly.mux.com   ?cdn=fastly
 *   manifest-oci-us-ashburn-1-vop1.fastly.mux.com   ?cdn=cloudflare
 *
 * With only the two literal hosts listed, the homepage hero video is blocked
 * outright: the player retries every quality level, fails each one, and the
 * hero sits on its poster frame. That was the state of the first version of
 * this file, and no amount of reading the source would have shown it. It took
 * loading the page in a browser and reading the console, which is what the
 * verification rule in CLAUDE.md is for.
 *
 * The visitor's own region decides the host, so this cannot be enumerated.
 */
const MUX = ["https://*.mux.com"];

/**
 * Mux Data, the playback analytics beacon the player sends on its own.
 * Wildcarded for the same reason: litix.io shards by region too.
 */
const MUX_DATA = "https://*.litix.io";

/**
 * GA4. Property G-MJMZWNNWVP, loaded by components/shared/google-analytics.tsx.
 *
 * Four origins for one tag, and all four are used. googletagmanager serves
 * gtag.js, google-analytics and analytics.google.com take the collect beacon,
 * and www.google.com takes a second beacon carrying gaf=1, which is the Google
 * Signals one. The last is easy to miss because it only fires on some loads:
 * it was found in the console, not in the documentation.
 */
const GOOGLE_ANALYTICS = [
  "https://www.googletagmanager.com",
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
  "https://www.google.com",
];

/** The embedded map on /contact. */
const GOOGLE_MAPS = ["https://www.google.com", "https://maps.google.com"];

/** Where the contact and our-programs forms POST. */
const FORMSPREE = "https://formspree.io";

/**
 * PostHog is deliberately absent.
 *
 * It is proxied through /ingest by the rewrites in next.config.mjs, so from the
 * browser's point of view it is same-origin and 'self' already covers it. Do
 * not add us.i.posthog.com here on the strength of seeing it in the source.
 * Adding it would let a later change talk to PostHog directly and quietly lose
 * the proxy, which is the thing keeping those requests past ad blockers.
 */

const csp = (directives) =>
  Object.entries(directives)
    .map(([key, values]) =>
      values.length ? `${key} ${values.join(" ")}` : key
    )
    .join("; ");

/**
 * next dev compiles and hot-reloads with eval and injects its error overlay
 * inline. Without this the dev server renders a blank page, which reads as a
 * broken build rather than as a working CSP.
 */
const isDev = process.env.NODE_ENV === "development";

/**
 * 'unsafe-inline' on script-src, and why it is not a nonce.
 *
 * A nonce has to be minted per request, which makes every page render
 * dynamically. This site is static and ISR, so a nonce trades the whole caching
 * model for the difference between a strict and a permissive script policy.
 * That is a bad trade on a marketing site with no authenticated surface.
 *
 * Be honest about what it leaves behind. With 'unsafe-inline' this CSP does not
 * stop injected inline script, so do not describe it as an XSS backstop. What
 * it does do: blocks script from any origin not listed, blocks plugin and
 * object embedding, pins the document base, stops the forms being repointed at
 * another host, and stops the site being framed. Those directives carry the
 * weight here and none of them need a nonce.
 *
 * If an authenticated surface is ever added, revisit. The upgrade is a nonce
 * minted in middleware.ts plus 'strict-dynamic'.
 */
const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  ...(isDev ? ["'unsafe-eval'"] : []),
  "https://www.googletagmanager.com",
  // The Mux player loads Google's Cast sender SDK from here, on its own, to
  // offer the cast-to-TV button. Blocking it costs no functionality on a muted
  // background video, but it throws on every page carrying a player, and a
  // console full of CSP errors is how a real violation goes unnoticed.
  "https://www.gstatic.com",
];

const SITE_CSP = csp({
  "default-src": ["'self'"],

  // Pins the document base so injected markup cannot retarget every relative
  // URL on the page, and blocks plugin embedding outright.
  "base-uri": ["'self'"],
  "object-src": ["'none'"],

  // Clickjacking. Does the same job as X-Frame-Options and is the directive
  // browsers actually honour now. Both are sent, because X-Frame-Options is
  // what an older scanner looks for.
  //
  // 'self' rather than 'none' because Sanity's Presentation tool frames the
  // site from the Studio, which is same-origin at /studio.
  "frame-ancestors": ["'self'"],

  // Stops a form being repointed at somebody else's host, which is the part
  // that matters here: the contact form carries health context.
  "form-action": ["'self'", FORMSPREE],

  "script-src": scriptSrc,

  // Tailwind and next/font both emit inline style. There is no version of this
  // site that does not need 'unsafe-inline' here, and style injection is a far
  // weaker vector than script injection.
  "style-src": ["'self'", "'unsafe-inline'"],

  // data: for inline SVG, blob: for the placeholders next/image generates.
  "img-src": [
    "'self'",
    "data:",
    "blob:",
    SANITY_CDN,
    ...MUX,
    ...GOOGLE_ANALYTICS,
    ...GOOGLE_MAPS,
  ],

  // next/font self-hosts Poppins at build time, so no fonts.gstatic.com.
  "font-src": ["'self'", "data:"],

  // blob: because the Mux player assembles HLS segments into a blob URL.
  "media-src": ["'self'", "blob:", SANITY_CDN, ...MUX],

  "connect-src": [
    "'self'",
    SANITY_CDN,
    ...SANITY_API,
    ...MUX,
    MUX_DATA,
    ...GOOGLE_ANALYTICS,
    FORMSPREE,
  ],

  // The map on /contact. Jane is linked rather than embedded, and a link needs
  // no directive, so curatehealth.janeapp.com is deliberately not here.
  "frame-src": ["'self'", ...GOOGLE_MAPS],

  "worker-src": ["'self'", "blob:"],
  "manifest-src": ["'self'"],

  // Rewrites any http:// subresource that slips into Sanity content.
  "upgrade-insecure-requests": [],
});

/**
 * The Studio needs a looser policy than the site, so it gets its own.
 *
 * Sanity Studio evaluates GROQ at runtime and loads parts of itself with eval,
 * so 'unsafe-eval' is not optional there. Scoping it to /studio keeps it off
 * the 43 pages the public reads, which is the whole reason for writing two
 * policies rather than one permissive one.
 *
 * /studio is publicly reachable and returns 200. That is Sanity's own login
 * gate rather than an open door, but it does mean this policy is reachable by
 * anyone, so it is scoped as tightly as the Studio tolerates.
 */
const STUDIO_CSP = csp({
  "default-src": ["'self'"],
  "base-uri": ["'self'"],
  "object-src": ["'none'"],
  "frame-ancestors": ["'self'"],
  "form-action": ["'self'"],
  // No googletagmanager and no GA4 collect endpoints, deliberately.
  //
  // gtag.js used to load here, because app/layout.tsx is the root layout and
  // injected it on every page. The first version of this file widened the
  // Studio policy to let it through, which is the wrong direction: the Studio
  // should get the tightest policy it tolerates, not the union of the Studio
  // and the marketing stack. GA4 is now suppressed on /studio instead, in
  // components/shared/google-analytics.tsx, which also stops editor sessions
  // counting as site traffic.
  "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "blob:"],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:", "blob:", SANITY_CDN, "https://*.sanity.io"],
  "font-src": ["'self'", "data:"],
  "media-src": ["'self'", "blob:", SANITY_CDN],
  "connect-src": ["'self'", SANITY_CDN, ...SANITY_API, "https://*.sanity.io"],
  // The Presentation tool frames the site it is editing.
  "frame-src": ["'self'", "blob:", "https://*.sanity.io"],
  "worker-src": ["'self'", "blob:"],
  "upgrade-insecure-requests": [],
});

/**
 * Switches off browser features the site does not use, so a third party script
 * cannot reach for them. Written as an allowlist of nothing, which is what the
 * empty () means.
 */
const PERMISSIONS_POLICY = [
  "accelerometer=()",
  "autoplay=(self)",
  "camera=()",
  "display-capture=()",
  "encrypted-media=()",
  "fullscreen=(self)",
  "geolocation=()",
  "gyroscope=()",
  "magnetometer=()",
  "microphone=()",
  "midi=()",
  "payment=()",
  "usb=()",
  "xr-spatial-tracking=()",
].join(", ");

/** Applied to every response, Studio included. */
const COMMON = [
  {
    // Stops a browser guessing that an uploaded .txt is really script.
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Superseded by frame-ancestors, kept because scanners still ask for it.
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    // Full URL to ourselves, origin only to anybody else, nothing over http.
    // Keeps GA4's referrer reporting intact without handing third parties the
    // page path, which on a clinic site means not telling them which condition
    // somebody was reading about.
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  { key: "Permissions-Policy", value: PERMISSIONS_POLICY },
];

/**
 * ONE CSP PER RESPONSE, NEVER TWO.
 *
 * Next applies every entry whose source matches. A second
 * Content-Security-Policy header does not replace the first, it is sent
 * alongside it, and the browser then enforces the INTERSECTION of the two. A
 * broad site rule plus a Studio rule would therefore hand the Studio both
 * policies and break it, while looking correct in the config.
 *
 * So the Studio matches first and the site rule excludes it by negative
 * lookahead. scripts/audit-security-headers.js asserts exactly one CSP header
 * on both, because this is the part that is easy to get wrong and invisible
 * until someone opens the Studio.
 */
export const securityHeaders = [
  {
    source: "/studio/:path*",
    headers: [...COMMON, { key: "Content-Security-Policy", value: STUDIO_CSP }],
  },
  {
    source: "/studio",
    headers: [...COMMON, { key: "Content-Security-Policy", value: STUDIO_CSP }],
  },
  {
    // studio$ and studio/ rather than a bare studio. A plain (?!studio)
    // is a string prefix test, so it also excluded /studios-that-do-not-exist
    // and /studio-ish, and because neither matches the Studio rule either they
    // shipped with NO security headers at all. Caught by
    // scripts/audit-security-headers.js, which is why it checks a path whose
    // name merely starts with the excluded segment.
    source: "/:path((?!studio$|studio/).*)",
    headers: [...COMMON, { key: "Content-Security-Policy", value: SITE_CSP }],
  },
];
