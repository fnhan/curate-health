import { NextResponse } from "next/server";

import { sanityFetch } from "@/sanity/lib/client";
import { groq } from "next-sanity";

type SearchResultItem = {
  type: string;
  group?: "featured_products" | "featured_services";
  title: string;
  excerpt?: string | null;
  href: string;
  score: number;
};

type GenericDoc = Record<string, unknown> & {
  _id?: string;
  _type?: string;
  title?: string;
  name?: string;
  slugCurrent?: string;
  treatmentSlugCurrent?: string;
  serviceSlugCurrent?: string;
  isActive?: boolean;
  pageActive?: boolean;
  published?: boolean;
};

const FEATURED_QUERY = groq`
{
  "featuredProducts": *[
    _type == "product" &&
    isActive == true &&
    defined(slug.current)
  ] | order(coalesce(_updatedAt, _createdAt) desc)[0...$limit]{
    "type": "product",
    "group": "featured_products",
    "title": coalesce(title, "Untitled product"),
    "excerpt": coalesce(description, null),
    "href": "/products/" + slug.current,
    "score": 1
  },
  "featuredServices": *[
    _type == "service" &&
    isActive == true &&
    defined(slug.current)
  ] | order(coalesce(_updatedAt, _createdAt) desc)[0...$limit]{
    "type": "service",
    "group": "featured_services",
    "title": coalesce(title, "Untitled service"),
    "excerpt": null,
    "href": "/services/" + slug.current,
    "score": 1
  }
}
`;

const PAGE_INDEX_QUERY = groq`
*[
  _type in [
    "heroSection",
    "aboutSection",
    "clinic",
    "productsSection",
    "servicesSection",
    "cafeSection",
    "blogSection",
    "sustainabilitySection",
    "post",
    "product",
    "service",
    "treatments",
    "serviceLifestyle",
    "serviceLifestyleProgram",
    "ourStory",
    "ourTeam",
    "missionAndValues",
    "sustainability",
    "pillarsOfHealth",
    "cafePage",
    "contactPage",
    "ourPrograms",
    "servicesHeroSection",
    "legalPage"
  ]
]{
  ...,
  "slugCurrent": slug.current,
  "treatmentSlugCurrent": treatmentSlug.current,
  "serviceSlugCurrent": service->slug.current
}
`;

const SEARCH_QUERY = groq`
{
  "posts": *[
    _type == "post" &&
    published == true &&
    defined(slug.current) &&
    (
      title match $q ||
      excerpt match $q ||
      pt::text(sections[].sectionParagraph) match $q ||
      pt::text(sections[].sectionTitle) match $q
    )
  ][0...$limit]{
    "type": "blog",
    "title": coalesce(title, "Untitled post"),
    "excerpt": excerpt,
    "href": "/blog/" + slug.current,
    "score": (
      select(title match $q => 6, 0) +
      select(excerpt match $q => 3, 0) +
      select(pt::text(sections[].sectionTitle) match $q => 2, 0) +
      select(pt::text(sections[].sectionParagraph) match $q => 1, 0)
    )
  },

  "products": *[
    _type == "product" &&
    isActive == true &&
    defined(slug.current) &&
    (
      title match $q ||
      description match $q ||
      slug.current match $q ||
      image.alt match $q ||
      banner.alt match $q ||
      accordioninfo[].title match $q ||
      pt::text(accordioninfo[].description) match $q ||
      callToAction.ctaText match $q ||
      callToAction.ctaSectionTitle match $q ||
      callToAction.ctaSectionDescription match $q ||
      callToAction.ctaLink match $q ||
      seo.pageTitle match $q ||
      seo.pageDescription match $q ||
      seo.socialMeta.title match $q ||
      seo.socialMeta.description match $q ||
      pt::text(indepthblockinfo) match $q
    )
  ][0...$limit]{
    "type": "product",
    "title": coalesce(title, "Untitled product"),
    "excerpt": coalesce(
      description,
      callToAction.ctaSectionDescription,
      seo.pageDescription,
      null
    ),
    "href": "/products/" + slug.current,
    "score": (
      select(title match $q => 8, 0) +
      select(description match $q => 4, 0) +
      select(slug.current match $q => 3, 0) +
      select(accordioninfo[].title match $q => 2, 0) +
      select(pt::text(accordioninfo[].description) match $q => 2, 0) +
      select(callToAction.ctaSectionTitle match $q => 2, 0) +
      select(callToAction.ctaSectionDescription match $q => 2, 0) +
      select(callToAction.ctaText match $q => 1, 0) +
      select(seo.pageTitle match $q => 2, 0) +
      select(seo.pageDescription match $q => 1, 0) +
      select(seo.socialMeta.title match $q => 1, 0) +
      select(seo.socialMeta.description match $q => 1, 0) +
      select(image.alt match $q => 1, 0) +
      select(banner.alt match $q => 1, 0) +
      select(pt::text(indepthblockinfo) match $q => 1, 0)
    )
  },

  "services": *[
    _type == "service" &&
    isActive == true &&
    defined(slug.current) &&
    (
      title match $q ||
      pt::text(content) match $q
    )
  ][0...$limit]{
    "type": "service",
    "title": coalesce(title, "Untitled service"),
    "excerpt": null,
    "href": "/services/" + slug.current,
    "score": (
      select(title match $q => 6, 0) +
      select(pt::text(content) match $q => 1, 0)
    )
  },

  "treatments": *[
    _type == "treatments" &&
    isActive == true &&
    defined(treatmentSlug.current) &&
    defined(service->slug.current) &&
    (
      title match $q ||
      pt::text(content) match $q
    )
  ][0...$limit]{
    "type": "treatment",
    "title": coalesce(title, "Untitled treatment"),
    "excerpt": null,
    "href": "/services/" + service->slug.current + "/" + treatmentSlug.current,
    "score": (
      select(title match $q => 6, 0) +
      select(pt::text(content) match $q => 1, 0)
    )
  },

  "lifestyleServices": *[
    _type == "serviceLifestyle" &&
    isActive == true &&
    defined(slug.current) &&
    (
      title match $q ||
      hero_secondary_title match $q ||
      hero_large_text match $q ||
      pt::text(content) match $q ||
      block_2_title match $q ||
      pt::text(block_2_content) match $q ||
      block_3_title match $q ||
      pt::text(block_3_content[].description) match $q ||
      pt::text(pillars[].description) match $q ||
      pt::text(benefits[].description) match $q ||
      pt::text(timeline[].description) match $q ||
      pt::text(faq[].description) match $q ||
      call_to_action match $q
    )
  ][0...$limit]{
    "type": "page",
    "title": coalesce(title, "Curate Lifestyle"),
    "excerpt": null,
    "href": "/services/" + slug.current,
    "score": (
      select(title match $q => 8, 0) +
      select(hero_secondary_title match $q => 3, 0) +
      select(hero_large_text match $q => 2, 0) +
      select(pt::text(content) match $q => 2, 0) +
      select(pt::text(block_2_content) match $q => 2, 0) +
      select(pt::text(block_3_content[].description) match $q => 1, 0) +
      select(pt::text(pillars[].description) match $q => 1, 0) +
      select(pt::text(benefits[].description) match $q => 1, 0) +
      select(pt::text(timeline[].description) match $q => 1, 0) +
      select(pt::text(faq[].description) match $q => 1, 0) +
      select(call_to_action match $q => 1, 0)
    )
  },

  "lifestylePrograms": *[
    _type == "serviceLifestyleProgram" &&
    defined(slug.current) &&
    (
      title match $q ||
      pt::text(intro.introParagraph) match $q ||
      pt::text(additionalSections[].sectionParagraph) match $q ||
      pt::text(groupSections[].description) match $q ||
      pt::text(assistanceSectionDescription) match $q
    )
  ][0...$limit]{
    "type": "page",
    "title": coalesce(title, "Curate Lifestyle Program"),
    "excerpt": null,
    "href": "/services/" + slug.current,
    "score": (
      select(title match $q => 8, 0) +
      select(pt::text(intro.introParagraph) match $q => 2, 0) +
      select(pt::text(additionalSections[].sectionParagraph) match $q => 1, 0) +
      select(pt::text(groupSections[].description) match $q => 1, 0) +
      select(pt::text(assistanceSectionDescription) match $q => 1, 0)
    )
  },

  "contact": *[
    _type == "contactPage" &&
    (
      heroSection.title match $q ||
      branchName match $q ||
      contactInfo.email match $q ||
      contactInfo.phone match $q ||
      contactInfo.address.street match $q ||
      contactInfo.address.city match $q ||
      contactInfo.address.state match $q ||
      contactInfo.address.zip match $q ||
      contactInfo.address.country match $q ||
      contactInfo.address.locationInfo match $q ||
      parking match $q ||
      howToGetHere match $q
    )
  ][0]{
    "type": "page",
    "title": coalesce(heroSection.title, "Contact"),
    "excerpt": null,
    "href": "/contact",
    "score": (
      select(heroSection.title match $q => 6, 0) +
      select(branchName match $q => 2, 0) +
      select(parking match $q => 1, 0) +
      select(howToGetHere match $q => 1, 0) +
      select(contactInfo.address.locationInfo match $q => 1, 0)
    )
  },

  "cafe": *[
    _type == "cafePage" &&
    pageActive == true &&
    (
      introSection.title match $q ||
      introSection.subheading match $q ||
      introSection.description match $q ||
      quoteSection.quoteText match $q ||
      pt::text(additionalSections[].sectionParagraph) match $q ||
      additionalSections[].sectionTitle match $q ||
      menuDownloadSection.headline match $q ||
      menuDownloadSection.description match $q ||
      ctaBandSection.headline match $q ||
      ctaBandSection.body match $q ||
      ctaBandSection.closingLine match $q
    )
  ][0]{
    "type": "page",
    "title": "Cafe",
    "excerpt": null,
    "href": "/cafe",
    "score": (
      select(introSection.title match $q => 4, 0) +
      select(introSection.description match $q => 2, 0) +
      select(quoteSection.quoteText match $q => 1, 0) +
      select(pt::text(additionalSections[].sectionParagraph) match $q => 1, 0) +
      select(menuDownloadSection.headline match $q => 1, 0) +
      select(ctaBandSection.headline match $q => 1, 0) +
      select(ctaBandSection.body match $q => 1, 0)
    )
  },

  "ourPrograms": *[
    _type == "ourPrograms" &&
    isActive == true &&
    (
      title match $q ||
      intro.subtitle match $q ||
      intro.introParagraph match $q ||
      programs[].programName match $q ||
      programs[].description match $q ||
      essentialSeries.description match $q ||
      curateLifestyle.description match $q ||
      curateLifestyle.outcome match $q ||
      masterHealthBlueprint.description match $q ||
      masterHealthBlueprint.outcome match $q ||
      threePaths.heading match $q ||
      threePaths.subtitle match $q ||
      threePaths.paragraph match $q ||
      pt::text(faq[].description) match $q ||
      ctaSection.heading match $q ||
      ctaSection.paragraph match $q
    )
  ][0]{
    "type": "page",
    "title": coalesce(title, "Our Programs"),
    "excerpt": null,
    "href": "/our-programs",
    "score": (
      select(title match $q => 6, 0) +
      select(intro.introParagraph match $q => 2, 0) +
      select(programs[].programName match $q => 2, 0) +
      select(programs[].description match $q => 1, 0) +
      select(threePaths.heading match $q => 1, 0) +
      select(pt::text(faq[].description) match $q => 1, 0) +
      select(ctaSection.heading match $q => 1, 0)
    )
  },

  "servicesLanding": *[
    _type == "servicesHeroSection" &&
    (
      heroSection.title match $q ||
      heroSection.subtitle match $q
    )
  ][0]{
    "type": "page",
    "title": "Services",
    "excerpt": null,
    "href": "/services",
    "score": (
      select(heroSection.title match $q => 6, 0) +
      select(heroSection.subtitle match $q => 2, 0)
    )
  },

  "legalPages": *[
    _type == "legalPage" &&
    defined(slug.current) &&
    (
      title match $q ||
      pt::text(body) match $q
    )
  ][0...$limit]{
    "type": "page",
    "title": coalesce(title, "Legal"),
    "excerpt": null,
    "href": "/legal/" + slug.current,
    "score": (
      select(title match $q => 6, 0) +
      select(pt::text(body) match $q => 1, 0)
    )
  },

  "aboutPages": [
    *[_type == "ourStory" && pageActive == true][0]{
      "type": "page",
      "title": "Our Story",
      "excerpt": null,
      "href": "/about/our-story",
      "score": (
        select("our story" match $q => 6, 0) +
        select(pt::text(additionalSections[].sectionParagraph) match $q => 1, 0) +
        select(pt::text(heroSection.heroSubtitle) match $q => 1, 0)
      )
    },
    *[_type == "ourTeam" && pageActive == true][0]{
      "type": "page",
      "title": "Our Team",
      "excerpt": null,
      "href": "/about/our-team",
      "score": (
        select("our team" match $q => 6, 0) +
        select(pt::text(teamMembers[].bio) match $q => 1, 0) +
        select(pt::text(heroSection.heroParagraph) match $q => 1, 0)
      )
    },
    *[_type == "missionAndValues" && pageActive == true][0]{
      "type": "page",
      "title": "Mission and Values",
      "excerpt": null,
      "href": "/about/mission-and-values",
      "score": (
        select("mission and values" match $q => 6, 0) +
        select(pt::text(additionalSections[].sectionTitle) match $q => 2, 0) +
        select(pt::text(additionalSections[].sectionParagraph) match $q => 1, 0)
      )
    },
    *[_type == "sustainability" && pageActive == true][0]{
      "type": "page",
      "title": "Sustainability",
      "excerpt": null,
      "href": "/about/sustainability",
      "score": (
        select("sustainability" match $q => 6, 0) +
        select(pt::text(additionalSections[].sectionTitle) match $q => 2, 0) +
        select(pt::text(additionalSections[].sectionParagraph) match $q => 1, 0)
      )
    },
    *[_type == "pillarsOfHealth" && pageActive == true][0]{
      "type": "page",
      "title": "Pillars of Health",
      "excerpt": null,
      "href": "/about/pillars-of-health",
      "score": (
        select("pillars of health" match $q => 6, 0) +
        select(pt::text(pillars[].pillarName) match $q => 2, 0) +
        select(pt::text(pillars[].pillarDescription) match $q => 1, 0)
      )
    }
  ]
}
`;

function normalizeQuery(raw: string) {
  const q = raw.trim().replace(/\s+/g, " ");
  // Avoid pathological/very slow match patterns.
  return q.slice(0, 80);
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function collectStringsDeep(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") {
    const cleaned = value.trim();
    if (cleaned) out.push(cleaned);
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStringsDeep(item, out);
    return out;
  }
  if (value && typeof value === "object") {
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      if (key.startsWith("_")) continue;
      collectStringsDeep(v, out);
    }
  }
  return out;
}

function buildHrefForDoc(doc: GenericDoc): string | null {
  switch (doc._type) {
    case "heroSection":
    case "aboutSection":
    case "clinic":
    case "productsSection":
    case "servicesSection":
    case "cafeSection":
    case "blogSection":
    case "sustainabilitySection":
      return "/";
    case "post":
      return doc.slugCurrent ? `/blog/${doc.slugCurrent}` : null;
    case "product":
      return doc.slugCurrent ? `/products/${doc.slugCurrent}` : null;
    case "service":
      return doc.slugCurrent ? `/services/${doc.slugCurrent}` : null;
    case "treatments":
      return doc.serviceSlugCurrent && doc.treatmentSlugCurrent
        ? `/services/${doc.serviceSlugCurrent}/${doc.treatmentSlugCurrent}`
        : null;
    case "serviceLifestyle":
    case "serviceLifestyleProgram":
      return doc.slugCurrent ? `/services/${doc.slugCurrent}` : null;
    case "ourStory":
      return "/about/our-story";
    case "ourTeam":
      return "/about/our-team";
    case "missionAndValues":
      return "/about/mission-and-values";
    case "sustainability":
      return "/about/sustainability";
    case "pillarsOfHealth":
      return "/about/pillars-of-health";
    case "cafePage":
      return "/cafe";
    case "contactPage":
      return "/contact";
    case "ourPrograms":
      return "/our-programs";
    case "servicesHeroSection":
      return "/services";
    case "legalPage":
      return doc.slugCurrent ? `/legal/${doc.slugCurrent}` : null;
    default:
      return null;
  }
}

function buildTitleForDoc(doc: GenericDoc): string {
  if (typeof doc.title === "string" && doc.title.trim()) return doc.title;
  if (typeof doc.name === "string" && doc.name.trim()) return doc.name;
  switch (doc._type) {
    case "heroSection":
    case "aboutSection":
    case "clinic":
    case "productsSection":
    case "servicesSection":
    case "cafeSection":
    case "blogSection":
    case "sustainabilitySection":
      return "Home";
    case "ourStory":
      return "Our Story";
    case "ourTeam":
      return "Our Team";
    case "missionAndValues":
      return "Mission and Values";
    case "sustainability":
      return "Sustainability";
    case "pillarsOfHealth":
      return "Pillars of Health";
    case "cafePage":
      return "Cafe";
    case "contactPage":
      return "Contact";
    case "ourPrograms":
      return "Our Programs";
    case "servicesHeroSection":
      return "Services";
    default:
      return "Untitled";
  }
}

function buildExcerpt(strings: string[]): string | null {
  const candidate = strings.find((s) => s.length >= 40);
  return candidate ? candidate.slice(0, 220) : null;
}

function scoreTextMatch(haystack: string, normalizedQuery: string) {
  if (!haystack) return 0;
  return haystack.includes(normalizedQuery) ? 8 : 0;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("q") ?? "";
  const qRaw = normalizeQuery(raw).replace(/^"(.+)"$/, "$1");
  const featured = searchParams.get("featured") === "1";

  const limitParam = Number(searchParams.get("limit") ?? 8);
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 3), 12)
    : 8;

  if (featured) {
    const data = await sanityFetch<{
      featuredProducts?: SearchResultItem[];
      featuredServices?: SearchResultItem[];
    }>({
      query: FEATURED_QUERY,
      params: { limit: Math.min(limit, 6) },
      revalidate: 60,
      tags: ["search"],
    });

    const results = [
      ...(data?.featuredProducts ?? []),
      ...(data?.featuredServices ?? []),
    ].slice(0, Math.min(limit, 12));

    return NextResponse.json({ query: qRaw, results });
  }

  if (qRaw.length < 2) {
    return NextResponse.json({
      query: qRaw,
      results: [] satisfies SearchResultItem[],
    });
  }

  // Sanity `match` supports wildcard `*`. Make it prefix-friendly for multi-word queries.
  // Enforce contiguous-substring contains matching for the full query string.
  const q = `*${qRaw}*`;
  const normalizedQuery = normalizeText(qRaw);

  const data = await sanityFetch<{
    posts?: SearchResultItem[];
    products?: SearchResultItem[];
    services?: SearchResultItem[];
    treatments?: SearchResultItem[];
    lifestyleServices?: SearchResultItem[];
    lifestylePrograms?: SearchResultItem[];
    contact?: SearchResultItem;
    cafe?: SearchResultItem;
    ourPrograms?: SearchResultItem;
    servicesLanding?: SearchResultItem;
    legalPages?: SearchResultItem[];
    aboutPages?: SearchResultItem[];
  }>({
    query: SEARCH_QUERY,
    params: { q, limit },
    revalidate: 60,
    tags: ["search"],
  });

  const indexDocs = await sanityFetch<GenericDoc[]>({
    query: PAGE_INDEX_QUERY,
    revalidate: 60,
    tags: ["search"],
  });

  const deepMatches: SearchResultItem[] = (indexDocs ?? [])
    .filter((doc) => doc && doc._type)
    .filter((doc) => doc.isActive !== false)
    .filter((doc) => doc.pageActive !== false)
    .filter((doc) => doc.published !== false)
    .map((doc) => {
      const href = buildHrefForDoc(doc);
      if (!href) return null;

      const textParts = collectStringsDeep(doc);
      const haystack = normalizeText(textParts.join(" "));
      const score = scoreTextMatch(haystack, normalizedQuery);
      if (score <= 0) return null;

      return {
        type:
          doc._type === "post"
            ? "blog"
            : doc._type === "product"
              ? "product"
              : doc._type === "service" || doc._type === "treatments"
                ? "service"
                : "page",
        title: buildTitleForDoc(doc),
        excerpt: buildExcerpt(textParts),
        href,
        score,
      } satisfies SearchResultItem;
    })
    .filter(Boolean) as SearchResultItem[];

  const merged = [
    ...(data?.posts ?? []),
    ...(data?.products ?? []),
    ...(data?.services ?? []),
    ...(data?.treatments ?? []),
    ...(data?.lifestyleServices ?? []),
    ...(data?.lifestylePrograms ?? []),
    ...(data?.contact ? [data.contact] : []),
    ...(data?.cafe ? [data.cafe] : []),
    ...(data?.ourPrograms ? [data.ourPrograms] : []),
    ...(data?.servicesLanding ? [data.servicesLanding] : []),
    ...(data?.legalPages ?? []),
    ...((data?.aboutPages ?? []).filter(Boolean) as SearchResultItem[]),
    ...deepMatches,
  ]
    .filter((r) => r?.href && r?.title && (r.score ?? 0) > 0)
    .reduce<SearchResultItem[]>((acc, item) => {
      const existingIndex = acc.findIndex((v) => v.href === item.href);
      if (existingIndex === -1) {
        acc.push(item);
      } else {
        const existing = acc[existingIndex]!;
        if ((item.score ?? 0) > (existing.score ?? 0)) {
          acc[existingIndex] = { ...existing, ...item };
        } else if (!existing.excerpt && item.excerpt) {
          acc[existingIndex] = { ...existing, excerpt: item.excerpt };
        }
      }
      return acc;
    }, [])
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, limit);

  return NextResponse.json({
    query: qRaw,
    results: merged,
  });
}

