import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { draftMode } from "next/headers";

import { VisualEditing } from "next-sanity";
import { LAYOUT_QUERYResult, SITE_METADATA_QUERYResult } from "sanity.types";

import { CSPostHogProvider } from "@/components/providers/posthog-provider";
import Layout from "@/components/shared/layout";
import SanityDisablePreviewButton from "@/components/shared/sanity-disable-preview-button";
import { Toaster } from "@/components/ui/toaster";

import { LAYOUT_QUERY, SITE_METADATA_QUERY } from "../sanity/lib/queries";
import { sanityFetch } from "../sanity/lib/server-client";
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
  const layout = await sanityFetch<LAYOUT_QUERYResult>({
    query: LAYOUT_QUERY,
  });

  return (
    <html lang="en" className={poppins.className}>
      <CSPostHogProvider>
        <body className="flex min-h-screen flex-col bg-background antialiased">
          <Layout layout={layout}>
            <main className="flex flex-1 flex-col">{children}</main>
          </Layout>
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
