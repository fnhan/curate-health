import { AppProps } from "next/app";
import { Poppins } from "next/font/google";
import { Suspense, lazy } from "react";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "components/ui/toaster";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export interface SharedPageProps {
  draftMode: boolean;
  token: string;
}

const PreviewProvider = lazy(
  () => import("../components/sanity/PreviewProvider")
);
const VisualEditing = lazy(() => import("../components/sanity/VisualEditing"));

if (typeof window !== "undefined") {
  // checks that we are client-side
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    person_profiles: "always",
    loaded: (posthog) => {
      if (process.env.NODE_ENV === "development") posthog.debug(); // debug mode in development
    },
  });
}

export default function App({
  Component,
  pageProps,
}: AppProps<SharedPageProps>) {
  const { draftMode, token } = pageProps;

  return (
    <PostHogProvider client={posthog}>
      <Toaster />
      <SpeedInsights />
      <Analytics />
      {draftMode ? (
        <PreviewProvider token={token}>
          <div className={`${poppins.className} antialiased`}>
            <Component {...pageProps} />
          </div>
          <Suspense fallback={<div>Loading visual editing...</div>}>
            <VisualEditing />
          </Suspense>
        </PreviewProvider>
      ) : (
        <div className={`${poppins.className} antialiased`}>
          <Component {...pageProps} />
        </div>
      )}
    </PostHogProvider>
  );
}
