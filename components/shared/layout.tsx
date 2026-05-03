import React from "react";

import { JsonLdScript, buildSiteJsonLd } from "@/lib/structured-data";

import { LAYOUT_QUERYResult } from "../../sanity.types";
import NewsletterSection from "./newsletter-section";
import PopupBanner from "./popup-banner";
import SiteFooter from "./site-footer";
import SiteNavigation from "./site-navigation";
import SurveySection from "./survey-section";

export default function Layout({
  children,
  layout,
}: {
  children: React.ReactNode;
  layout: LAYOUT_QUERYResult;
}) {
  const { surveySection, siteSettings, primaryCTAButton, popupBanner } = layout;

  return (
    <div className="flex flex-1 flex-col">
      <JsonLdScript data={buildSiteJsonLd(siteSettings)} id="site-json-ld" />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-black"
      >
        Skip to content
      </a>
      <SiteNavigation
        siteSettings={siteSettings}
        primaryCTAButton={primaryCTAButton}
      />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SurveySection surveySection={surveySection} />
      <NewsletterSection isComingSoon={false} isLayout={true} />
      <SiteFooter siteSettings={siteSettings} />
      <PopupBanner popupBanner={popupBanner} />
    </div>
  );
}
