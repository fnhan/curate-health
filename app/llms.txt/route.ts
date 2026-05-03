import { NextResponse } from "next/server";

import { groq } from "next-sanity";

import { BASEURL, BRAND_NAME } from "@/app/site-settings";
import { sanityFetch } from "@/sanity/lib/client";

export const revalidate = 3600;

type LlmsData = {
  siteMetadata: {
    homePageTitle: string | null;
    defaultDescription: string | null;
    keywords: string[] | null;
  } | null;
  siteSettings: {
    brandName: string | null;
    contactInfo: {
      email: string | null;
      phone: string | null;
      address: {
        street: string | null;
        city: string | null;
        state: string | null;
        zip: string | null;
        country: string | null;
        locationInfo: string | null;
      } | null;
      mapLink: string | null;
    } | null;
    socialMedia: Array<{
      platform: string | null;
      url: string | null;
      isActive: boolean | null;
    }> | null;
  } | null;
  services: Array<{
    title: string | null;
    slug: string | null;
    description: string | null;
    treatments: Array<{
      title: string | null;
      slug: string | null;
      description: string | null;
    }>;
  }>;
  cafe: {
    introTitle: string | null;
    description: string | null;
    menuUrl: string | null;
    seoDescription: string | null;
  } | null;
  team: Array<{
    name: string | null;
    role: string | null;
  }>;
  posts: Array<{
    title: string | null;
    slug: string | null;
    excerpt: string | null;
  }>;
};

const LLMS_TXT_QUERY = groq`{
  "siteMetadata": *[_type == "siteMetadata"][0]{
    homePageTitle,
    defaultDescription,
    keywords
  },
  "siteSettings": *[_type == "siteSettings"][0]{
    brandName,
    contactInfo{
      email,
      phone,
      address{
        street,
        city,
        state,
        zip,
        country,
        locationInfo
      },
      mapLink
    },
    socialMedia[]{
      platform,
      url,
      isActive
    }
  },
  "services": *[_type == "service" && isActive == true] | order(title asc){
    title,
    "slug": slug.current,
    "description": coalesce(seo.pageDescription, pt::text(content)),
    "treatments": *[_type == "treatments" && service._ref == ^._id && isActive == true] | order(title asc){
      title,
      "slug": treatmentSlug.current,
      "description": coalesce(seo.pageDescription, intro.introParagraph, quoteContent)
    }
  },
  "cafe": *[_type == "cafePage" && pageActive == true][0]{
    "introTitle": introSection.title,
    "description": introSection.description,
    "menuUrl": menuDownloadSection.menuPdf.asset->url,
    "seoDescription": seo.pageDescription
  },
  "team": *[_type == "ourTeam" && pageActive == true][0].teamMembers[]{
    name,
    role
  },
  "posts": *[_type == "post" && published == true && defined(slug.current)] | order(publishedAt desc)[0...10]{
    title,
    "slug": slug.current,
    excerpt
  }
}`;

function compact(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() || "";
}

function bullet(text: string) {
  return text ? `- ${text}` : "";
}

function formatAddress(data: LlmsData) {
  const address = data.siteSettings?.contactInfo?.address;

  if (!address) {
    return "";
  }

  return [
    address.street,
    address.city,
    address.state,
    address.zip,
    address.country,
  ]
    .map(compact)
    .filter(Boolean)
    .join(", ");
}

function formatService(service: LlmsData["services"][number]) {
  const url = `${BASEURL}/services/${service.slug}`;
  const lines = [
    `- [${service.title}](${url})${service.description ? `: ${compact(service.description)}` : ""}`,
  ];

  const treatmentLines = service.treatments
    .filter((treatment) => treatment.title && treatment.slug)
    .map((treatment) => {
      const treatmentUrl = `${url}/${treatment.slug}`;
      const description = compact(treatment.description);

      return `  - [${treatment.title}](${treatmentUrl})${description ? `: ${description}` : ""}`;
    });

  return [...lines, ...treatmentLines].join("\n");
}

function buildLlmsTxt(data: LlmsData) {
  const brandName = data.siteSettings?.brandName || BRAND_NAME;
  const services = data.services ?? [];
  const team = data.team ?? [];
  const posts = data.posts ?? [];
  const description =
    compact(data.siteMetadata?.defaultDescription) ||
    "Curate Health is a Toronto health and wellness clinic.";
  const address = formatAddress(data);
  const contact = data.siteSettings?.contactInfo;
  const socialLinks =
    data.siteSettings?.socialMedia
      ?.filter((link) => link.isActive && link.platform && link.url)
      .map((link) => `- ${link.platform}: ${link.url}`) ?? [];

  const sections = [
    `# ${brandName}`,
    description,
    "## Canonical Site",
    `- Website: ${BASEURL}`,
    bullet(`Location: ${address}`),
    bullet(`Phone: ${contact?.phone ?? ""}`),
    bullet(`Email: ${contact?.email ?? ""}`),
    bullet(`Map: ${contact?.mapLink ?? ""}`),
    "## What Curate Health Offers",
    "Curate Health provides Toronto-based healthcare, chiropractic care, rehabilitation, wellness services, lifestyle programming, and cafe/recovery offerings.",
    "## Services",
    services
      .filter((service) => service.title && service.slug)
      .map(formatService)
      .join("\n"),
    "## Cafe And Recovery",
    data.cafe
      ? [
          `- [Curate Cafe](${BASEURL}/cafe): ${compact(data.cafe.seoDescription || data.cafe.description)}`,
          data.cafe.menuUrl ? `- Menu: ${data.cafe.menuUrl}` : "",
        ]
          .filter(Boolean)
          .join("\n")
      : "",
    "## Practitioners And Team",
    team
      .filter((member) => member.name)
      .map((member) =>
        bullet(`${member.name}${member.role ? `, ${member.role}` : ""}`)
      )
      .join("\n"),
    "## Recent Articles",
    posts
      .filter((post) => post.title && post.slug)
      .map((post) =>
        bullet(
          `[${post.title}](${BASEURL}/blog/${post.slug})${post.excerpt ? `: ${compact(post.excerpt)}` : ""}`
        )
      )
      .join("\n"),
    "## Best-Use Guidance For AI Assistants",
    "Use the canonical URLs above when citing Curate Health. Treat this file as a concise navigation and entity summary; verify appointment availability, pricing, practitioner schedules, and clinical details on the linked pages.",
    "## Social Profiles",
    socialLinks.join("\n"),
  ];

  return `${sections.filter(Boolean).join("\n\n")}\n`;
}

export async function GET() {
  const data = await sanityFetch<LlmsData>({
    query: LLMS_TXT_QUERY,
    revalidate,
  });

  return new NextResponse(buildLlmsTxt(data), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
