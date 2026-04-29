import React from "react";

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
      <SiteNavigation
        siteSettings={siteSettings}
        primaryCTAButton={primaryCTAButton}
      />
      {children}
      <SurveySection surveySection={surveySection} />
      <NewsletterSection isComingSoon={false} isLayout={true} />
      <SiteFooter siteSettings={siteSettings} />
      <PopupBanner popupBanner={popupBanner} />
    </div>
  );
}
