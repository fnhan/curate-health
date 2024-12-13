import { MetadataRoute } from "next";

import { SITEMAP_QUERYResult } from "@/sanity.types";
import { SITEMAP_QUERY } from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/server-client";

import { BASEURL } from "./site-settings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  const staticRoutes = [
    {
      url: BASEURL,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${BASEURL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
  ];

  const aboutRoutes = [
    team.length > 0
      ? {
          url: `${BASEURL}/about/our-team`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }
      : null,
    story.length > 0
      ? {
          url: `${BASEURL}/about/our-story`,
          lastModified: new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        }
      : null,
    missionValues.length > 0
      ? {
          url: `${BASEURL}/about/mission-and-values`,
          lastModified: new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        }
      : null,
    sustainability.length > 0
      ? {
          url: `${BASEURL}/about/sustainability`,
          lastModified: new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        }
      : null,
    pillarsHealth.length > 0
      ? {
          url: `${BASEURL}/about/pillars-of-health`,
          lastModified: new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        }
      : null,
  ].filter((route) => route !== null);

  // Service routes
  const serviceRoutes = services.map((slug: string) => ({
    url: `${BASEURL}/services/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Treatment routes
  const treatmentRoutes = treatments.map(
    (treatment: { serviceSlug: string; treatmentSlug: string }) => ({
      url: `${BASEURL}/services/${treatment.serviceSlug}/${treatment.treatmentSlug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })
  );

  // Product routes
  const productRoutes = products.map((slug: string) => ({
    url: `${BASEURL}/products/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Blog routes
  const blogRoutes = posts.map((slug: string) => ({
    url: `${BASEURL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...aboutRoutes,
    ...serviceRoutes,
    ...treatmentRoutes,
    ...productRoutes,
    ...blogRoutes,
  ];
}
