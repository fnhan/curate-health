import { NextResponse } from "next/server";

import { SITEMAP_QUERYResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import { SITEMAP_QUERY } from "@/sanity/lib/queries";

import { BASEURL } from "../site-settings";

const sitemapXSL = `<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>`;

type Url = {
  url: string;
  lastModified: string;
  changeFrequency: string;
  priority: string | number;
};

function generateSitemap(urls: Url[]) {
  return urls
    .map(
      ({ url, lastModified, changeFrequency, priority }) => `
    <url>
      <loc>${url}</loc>
      <lastmod>${lastModified}</lastmod>
      <changefreq>${changeFrequency}</changefreq>
      <priority>${priority}</priority>
    </url>
  `
    )
    .join("");
}

export async function GET() {
  const sitemap = await sanityFetch<SITEMAP_QUERYResult>({
    query: SITEMAP_QUERY,
  });

  const {
    services,
    treatments,
    products,
    posts,
    team,
    story,
    missionValues,
    sustainability,
    pillarsHealth,
  } = sitemap!;

  const staticRoutes: Url[] = [
    {
      url: BASEURL,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASEURL}/contact`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASEURL}/cafe`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const aboutRoutes: Url[] = [
    team.length > 0 && {
      url: `${BASEURL}/about/our-team`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    story.length > 0 && {
      url: `${BASEURL}/about/our-story`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    missionValues.length > 0 && {
      url: `${BASEURL}/about/mission-and-values`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    sustainability.length > 0 && {
      url: `${BASEURL}/about/sustainability`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    pillarsHealth.length > 0 && {
      url: `${BASEURL}/about/pillars-of-health`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ].filter(Boolean) as Url[];

  const serviceRoutes: Url[] = services.map((slug: string) => ({
    url: `${BASEURL}/services/${slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const treatmentRoutes: Url[] = treatments.map(
    (treatment: { serviceSlug: string; treatmentSlug: string }) => ({
      url: `${BASEURL}/services/${treatment.serviceSlug}/${treatment.treatmentSlug}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.7,
    })
  );

  const productRoutes: Url[] = products.map((slug: string) => ({
    url: `${BASEURL}/products/${slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const blogRoutes: Url[] = posts.map((slug: string) => ({
    url: `${BASEURL}/blog/${slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const legalRoutes: Url[] = [
    {
      url: `${BASEURL}/legal/accessibility`,
      lastModified: new Date().toISOString(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASEURL}/legal/terms-of-use`,
      lastModified: new Date().toISOString(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASEURL}/legal/privacy-and-cookies`,
      lastModified: new Date().toISOString(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const allUrls = [
    ...staticRoutes,
    ...aboutRoutes,
    ...serviceRoutes,
    ...treatmentRoutes,
    ...productRoutes,
    ...blogRoutes,
    ...legalRoutes,
  ];

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
  ${sitemapXSL}
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${generateSitemap(allUrls)}
  </urlset>`;

  return new NextResponse(sitemapContent, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
