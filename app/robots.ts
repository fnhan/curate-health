import { MetadataRoute } from "next";

import { BASEURL } from "./site-settings";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/private/",
    },
    sitemap: `${BASEURL}/sitemap.xml`,
  };
}
