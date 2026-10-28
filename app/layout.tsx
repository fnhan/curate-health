import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { draftMode } from "next/headers";

// next-sanity 13 moved VisualEditing out of the root export into its own
// subpath. Same component, same behaviour.
import { VisualEditing } from "next-sanity/visual-editing";
import {
  SITE_METADATA_QUERY_RESULT,
  SITE_SETTINGS_PHONE_QUERY_RESULT,
} from "sanity.types";

import { CSPostHogProvider } from "@/components/providers/posthog-provider";
import { AnalyticsEvents } from "@/components/shared/analytics-events";
import { FloatingCallButton } from "@/components/shared/floating-call-button";
import { GoogleAnalytics } from "@/components/shared/google-analytics";
import SanityDisablePreviewButton from "@/components/shared/sanity-disable-preview-button";
import { Toaster } from "@/components/ui/toaster";
import { SITE_SHARE_IMAGE, imageEntry } from "@/lib/page-metadata";

import { sanityFetch } from "../sanity/lib/client";
import {
  SITE_METADATA_QUERY,
  SITE_SETTINGS_PHONE_QUERY,
} from "../sanity/lib/queries";
import "./globals.css";
import { BASEURL } from "./site-settings";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-poppins",
});

export async function generateMetadata(): Promise<Metadata> {
  const siteMetadata = await sanityFetch<SITE_METADATA_QUERY_RESULT>({
    query: SITE_METADATA_QUERY,
  });

  const { homePageTitle, templateTitlePrefix, defaultDescription, socialMeta } =
    siteMetadata!;
  const { ogImage, twitterImage } = socialMeta!;

  return {
    // Resolves every relative URL in page metadata, canonicals included,
    // against the real host. Without it Next has no absolute base and warns
    // at build time. CH-004.
    //
    // Canonical tags are deliberately NOT set here. Anything set in the layout
    // is inherited by every page that does not override it, so a canonical
    // here would tell Google that any page which forgot its own is a copy of
    // the homepage. Each page states its own, through buildPageMetadata, which
    // requires one.
    metadataBase: new URL(BASEURL),
    title: {
      template: `%s | ${templateTitlePrefix}`,
      default: homePageTitle!,
    },
    /*
     * The meta keywords tag is deliberately not emitted. CH-115.
     *
     * Google has ignored it since 2009 and Bing treats it as a spam signal
     * rather than a ranking one. The field stays in the Studio because
     * editors have filled it in and deleting their work is not this
     * ticket's job, but nothing renders it. Read siteMetadata.keywords here
     * again only if some other surface genuinely needs the list.
     */
    description: defaultDescription,
    openGraph: {
      siteName: templateTitlePrefix!,
      url: BASEURL,
      title: {
        template: `%s | ${templateTitlePrefix}`,
        default: homePageTitle!,
      },
      description: defaultDescription!,
      /*
       * Through the same builder every other page uses, since 2026-10-28.
       * Hand-assembled here before that, which cost the homepage two things
       * nobody could see from the source: it read the alt off the asset
       * document rather than the one written against the picture, so it
       * published none, and it served the file at its upload size instead of
       * cropped to 1200x630. The house card is the last resort, so the
       * homepage can never share a bare link either.
       */
      images:
        imageEntry(ogImage, homePageTitle!, { whole: true }) ??
        imageEntry(SITE_SHARE_IMAGE, homePageTitle!),
      type: "website",
      locale: "en_CA",
    },
    // No twitter:site. It takes an X handle, and this was the brand name, so
    // X ignored it; Curate has no X account to name there.
    twitter: {
      title: {
        template: `%s | ${templateTitlePrefix}`,
        default: homePageTitle!,
      },
      description: defaultDescription!,
      // X falls back to the Open Graph image when it has none of its own,
      // which is the same order buildPageMetadata uses.
      images:
        imageEntry(twitterImage, homePageTitle!, { whole: true }) ??
        imageEntry(ogImage, homePageTitle!, { whole: true }) ??
        imageEntry(SITE_SHARE_IMAGE, homePageTitle!),
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const phoneSettings = await sanityFetch<SITE_SETTINGS_PHONE_QUERY_RESULT>({
    query: SITE_SETTINGS_PHONE_QUERY,
  });
  const callPhone = phoneSettings?.phone?.trim() ?? "";

  return (
    <html lang="en-CA" className={`${poppins.variable} ${poppins.className}`}>
      <head>
        {/*
          Moved out of here and behind a pathname check, so it does not run on
          /studio. See components/shared/google-analytics.tsx for why.
        */}
        <GoogleAnalytics />
        <AnalyticsEvents />
      </head>
      <CSPostHogProvider>
        <body className="flex min-h-screen flex-col overflow-x-hidden bg-background antialiased">
          {children}
          {callPhone ? <FloatingCallButton phone={callPhone} /> : null}
          {(await draftMode()).isEnabled && (
            <>
              <SanityDisablePreviewButton />
              <VisualEditing />
            </>
          )}
          <Toaster />
        </body>
      </CSPostHogProvider>
    </html>
  );
}
