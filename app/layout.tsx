import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { draftMode } from "next/headers";

import { VisualEditing } from "next-sanity";
import {
  SITE_METADATA_QUERYResult,
  SITE_SETTINGS_PHONE_QUERYResult,
} from "sanity.types";

import { CSPostHogProvider } from "@/components/providers/posthog-provider";
import { FloatingCallButton } from "@/components/shared/floating-call-button";
import { GoogleAnalytics } from "@/components/shared/google-analytics";
import SanityDisablePreviewButton from "@/components/shared/sanity-disable-preview-button";
import { Toaster } from "@/components/ui/toaster";

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
  const siteMetadata = await sanityFetch<SITE_METADATA_QUERYResult>({
    query: SITE_METADATA_QUERY,
  });

  const {
    homePageTitle,
    templateTitlePrefix,
    defaultDescription,
    socialMeta,
    keywords,
  } = siteMetadata!;
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
    keywords: keywords || [],
    description: defaultDescription,
    openGraph: {
      siteName: templateTitlePrefix!,
      url: BASEURL,
      title: {
        template: `%s | ${templateTitlePrefix}`,
        default: homePageTitle!,
      },
      description: defaultDescription!,
      images: {
        url: ogImage?.asset?.url!,
        alt: ogImage?.asset?.alt!,
      },
      type: "website",
      locale: "en_CA",
    },
    twitter: {
      site: templateTitlePrefix!,
      title: {
        template: `%s | ${templateTitlePrefix}`,
        default: homePageTitle!,
      },
      description: defaultDescription!,
      images: {
        url: twitterImage?.asset?.url!,
        alt: twitterImage?.asset?.alt!,
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const phoneSettings = await sanityFetch<SITE_SETTINGS_PHONE_QUERYResult>({
    query: SITE_SETTINGS_PHONE_QUERY,
  });
  const callPhone = phoneSettings?.phone?.trim() ?? "";

  return (
    <html lang="en" className={`${poppins.variable} ${poppins.className}`}>
      <head>
        {/*
          Moved out of here and behind a pathname check, so it does not run on
          /studio. See components/shared/google-analytics.tsx for why.
        */}
        <GoogleAnalytics />
      </head>
      <CSPostHogProvider>
        <body className="flex min-h-screen flex-col overflow-x-hidden bg-background antialiased">
          {children}
          {callPhone ? <FloatingCallButton phone={callPhone} /> : null}
          {draftMode().isEnabled && (
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
