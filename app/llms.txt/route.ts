import { NextResponse } from "next/server";

import { groq } from "next-sanity";

import { BASEURL, BRAND_NAME } from "@/app/site-settings";
import { BLOG_DESCRIPTION, BLOG_FEED_PATH } from "@/lib/blog-feed";
import { treatmentPath } from "@/lib/service-urls";
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
    practitioner: {
      slug: string | null;
      credentials: string[] | null;
    } | null;
  }>;
  posts: Array<{
    title: string | null;
    slug: string | null;
    description: string | null;
  }>;
  pages: {
    services: string | null;
    contact: string | null;
    blog: string | null;
    ourPrograms: { description: string | null } | null;
    lifestyle: { description: string | null } | null;
    lifestyleProgram: { description: string | null } | null;
    about: string | null;
    products: string | null;
  };
  about: Array<{
    title: string;
    path: string;
    description: string | null;
  } | null>;
  products: Array<{
    title: string | null;
    slug: string | null;
    description: string | null;
  }>;
  legal: Array<{
    title: string | null;
    slug: string | null;
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
  // Role is rich text in the Studio, one line per role. Read as plain text
  // here, it printed as "[object Object]" for every member until 2026-09-18.
  // The practitioner record's credentials are preferred, since they are
  // plain strings and the same ones the practitioner page shows.
  "team": *[_type == "ourTeam" && pageActive == true][0].teamMembers[!(name in *[_type == "practitioner" && isActive == false].name)]{
    name,
    "role": pt::text(role),
    "practitioner": *[_type == "practitioner" && isActive == true && name == ^.name][0]{
      "slug": slug.current,
      credentials
    }
  },
  // The meta description first: the excerpts on the two 2024 posts predate
  // the content rules.
  "posts": *[_type == "post" && published == true && defined(slug.current)] | order(publishedAt desc)[0...10]{
    title,
    "slug": slug.current,
    "description": coalesce(seo.pageDescription, excerpt)
  },
  // Every page in the sitemap is listed here, the hubs included. 25 of 49
  // were missing until 2026-09-18, every page built that year among them.
  "pages": {
    "services": *[_type == "servicesHeroSection"][0].seo.pageDescription,
    "contact": *[_type == "contactPage"][0].seo.pageDescription,
    "blog": *[_type == "blogSection"][0].seo.pageDescription,
    "ourPrograms": *[_type == "ourPrograms" && isActive == true][0]{
      "description": seo.pageDescription
    },
    "lifestyle": *[_type == "serviceLifestyle" && slug.current == "curate-lifestyle"][0]{
      "description": seo.pageDescription
    },
    "lifestyleProgram": *[_type == "serviceLifestyleProgram" && slug.current == "curate-lifestyle-program"][0]{
      "description": seo.pageDescription
    },
    "about": *[_type == "aboutIndexPage"][0].seo.pageDescription,
    "products": *[_type == "productsPage"][0].seo.pageDescription
  },
  "about": [
    *[_type == "ourStory" && pageActive == true][0]{
      "title": "Our Story",
      "path": "/about/our-story",
      "description": seo.pageDescription
    },
    *[_type == "ourTeam" && pageActive == true][0]{
      "title": "Our Team",
      "path": "/about/our-team",
      "description": seo.pageDescription
    },
    *[_type == "missionAndValues" && pageActive == true][0]{
      "title": "Mission and Values",
      "path": "/about/mission-and-values",
      "description": seo.pageDescription
    },
    *[_type == "pillarsOfHealth" && pageActive == true][0]{
      "title": "Pillars of Health",
      "path": "/about/pillars-of-health",
      "description": seo.pageDescription
    },
    *[_type == "sustainability" && pageActive == true][0]{
      "title": "Sustainability",
      "path": "/about/sustainability",
      "description": seo.pageDescription
    }
  ],
  "products": *[_type == "product" && isActive == true && defined(slug.current)] | order(title asc){
    title,
    "slug": slug.current,
    "description": coalesce(seo.pageDescription, description)
  },
  "legal": *[_type == "legalPage" && defined(slug.current)] | order(title asc){
    title,
    "slug": slug.current
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

/** One linked line, with its description when there is one. */
function link(title: string, path: string, description?: string | null) {
  const url = path === "/" ? BASEURL : `${BASEURL}${path}`;
  const text = compact(description);
  return `- [${compact(title)}](${url})${text ? `: ${text}` : ""}`;
}

/** Rich text read as plain text comes back one role per line. */
function roleText(role: string | null) {
  return (role ?? "")
    .split(/\n+/)
    .map((line) => compact(line))
    .filter(Boolean)
    .join(", ");
}

function formatTeamMember(member: LlmsData["team"][number]) {
  const credentials =
    member.practitioner?.credentials?.map(compact).filter(Boolean).join(", ") ||
    roleText(member.role);

  if (member.practitioner?.slug) {
    return link(
      member.name!,
      `/about/our-team/${member.practitioner.slug}`,
      credentials
    );
  }

  return bullet(`${member.name}${credentials ? `, ${credentials}` : ""}`);
}

function formatService(service: LlmsData["services"][number]) {
  const url = `${BASEURL}/services/${service.slug}`;
  const lines = [
    `- [${service.title}](${url})${service.description ? `: ${compact(service.description)}` : ""}`,
  ];

  const treatmentLines = service.treatments
    .filter((treatment) => treatment.title && treatment.slug)
    .map((treatment) => {
      const treatmentUrl = `${BASEURL}${treatmentPath(service.slug, treatment.slug)}`;
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
  const pages = data.pages;
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
    link("Contact and directions", "/contact", pages?.contact),
    "## What Curate Health Offers",
    "Curate Health provides Toronto-based healthcare, chiropractic care, rehabilitation, wellness services, lifestyle programming, and cafe/recovery offerings.",
    "## Services",
    [
      link("All services", "/services", pages?.services),
      ...services
        .filter((service) => service.title && service.slug)
        .map(formatService),
    ].join("\n"),
    "## Programs",
    [
      pages?.ourPrograms
        ? link("Our Programs", "/our-programs", pages.ourPrograms.description)
        : "",
      pages?.lifestyle
        ? link(
            "Curate Lifestyle",
            "/services/curate-lifestyle",
            pages.lifestyle.description
          )
        : "",
      pages?.lifestyleProgram
        ? link(
            "Curate Lifestyle Program",
            "/services/curate-lifestyle-program",
            pages.lifestyleProgram.description
          )
        : "",
    ]
      .filter(Boolean)
      .join("\n"),
    "## Products",
    [
      link("Products", "/products", pages?.products),
      ...(data.products ?? [])
        .filter((product) => product.title && product.slug)
        .map((product) =>
          link(product.title!, `/products/${product.slug}`, product.description)
        ),
    ].join("\n"),
    "## Cafe And Recovery",
    data.cafe
      ? [
          `- [Curate Cafe](${BASEURL}/cafe): ${compact(data.cafe.seoDescription || data.cafe.description)}`,
          data.cafe.menuUrl ? `- Menu: ${data.cafe.menuUrl}` : "",
        ]
          .filter(Boolean)
          .join("\n")
      : "",
    "## About",
    [
      link("About Curate Health", "/about", pages?.about),
      ...(data.about ?? [])
        .filter((page) => page !== null)
        .map((page) => link(page!.title, page!.path, page!.description)),
    ].join("\n"),
    "## Practitioners And Team",
    team
      .filter((member) => member.name)
      .map(formatTeamMember)
      .join("\n"),
    "## Recent Articles",
    [
      link("Blog", "/blog", pages?.blog || BLOG_DESCRIPTION),
      `- Feed: ${BASEURL}${BLOG_FEED_PATH}`,
      ...posts
        .filter((post) => post.title && post.slug)
        .map((post) => link(post.title!, `/blog/${post.slug}`, post.description)),
    ].join("\n"),
    "## Best-Use Guidance For AI Assistants",
    "Use the canonical URLs above when citing Curate Health. Treat this file as a concise navigation and entity summary; verify appointment availability, pricing, practitioner schedules, and clinical details on the linked pages.",
    "## Social Profiles",
    socialLinks.join("\n"),
    // "Optional" is the llms.txt convention for links a reader short on room
    // can skip.
    "## Optional",
    (data.legal ?? [])
      .filter((page) => page.title && page.slug)
      .map((page) => link(page.title!, `/legal/${page.slug}`))
      .join("\n"),
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
