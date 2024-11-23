import React from "react";

import { LAYOUT_QUERYResult } from "../../sanity.types";
import SiteFooter from "./site-footer";
import SiteNavigation from "./site-navigation";

export default function Layout({
  children,
  layout,
}: {
  children: React.ReactNode;
  layout: LAYOUT_QUERYResult;
}) {
  const { navLinks, footer, primaryCTAButton } = layout;

  return (
    <div className="flex flex-1 flex-col">
      <SiteNavigation navLinks={navLinks} />
      {children}
      <SiteFooter footer={footer} />
    </div>
  );
}
