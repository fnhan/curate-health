"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

/**
 * GA4, everywhere except the Studio.
 *
 * This used to sit inline in app/layout.tsx, which is the root layout, so it
 * loaded on /studio as well. Two things wrong with that.
 *
 * The data one: every editor session counted as site traffic. Page views, scroll
 * depth and session counts on /studio are staff using the CMS, and they were
 * landing in the same property the marketing numbers come from.
 *
 * The security one, found while writing the CSP in lib/security-headers.mjs:
 * the Studio runs under its own, looser policy, and GA4 on that page meant
 * widening the Studio policy to allow googletagmanager and the collect
 * endpoints. That is the wrong direction. The Studio's policy should be the
 * tightest thing the Studio tolerates, not the union of the Studio and the
 * marketing stack.
 *
 * A client component because the pathname is what decides, and a server
 * component cannot read it. The scripts still load afterInteractive, so this
 * adds no blocking work.
 */
const GA_MEASUREMENT_ID = "G-MJMZWNNWVP";

export function GoogleAnalytics() {
  const pathname = usePathname();

  // Covers /studio and everything under it. Written as a prefix test on the
  // segment rather than startsWith("/studio") alone, so a future /studios page
  // would still be measured.
  if (pathname === "/studio" || pathname?.startsWith("/studio/")) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
