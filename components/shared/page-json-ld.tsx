"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

import { BASEURL } from "@/app/site-settings";

function absoluteUrl(pathname: string) {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${BASEURL}${normalized}`;
}

export default function PageJsonLd() {
  const pathname = usePathname() || "/";

  const jsonLd = useMemo(() => {
    const canonical = absoluteUrl(pathname);
    const pageTitle =
      typeof document !== "undefined" ? document.title : undefined;

    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${canonical}#webpage`,
      url: canonical,
      name: pageTitle,
      isPartOf: {
        "@type": "WebSite",
        "@id": `${BASEURL}/#website`,
      },
    };
  }, [pathname]);

  return (
    <script
      id="page-json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

