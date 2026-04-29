import { groq } from "next-sanity";

import { BRAND_NAME, BASEURL } from "@/app/site-settings";
import { sanityFetch } from "@/sanity/lib/client";

export const BRAND_AI_CONTEXT_REVALIDATE = 3600;

type BrandAiContextData = {
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
  primaryCTAButton: {
    ctaButton: {
      ctaText: string | null;
      ctaLink: string | null;
    } | null;
  } | null;
  home: {
    heroTitle: string | null;
    heroSubtitle: string | null;
    aboutTitle: string | null;
    aboutText: string | null;
    clinicContent: string | null;
    productsTitle: string | null;
    servicesTitle: string | null;
    cafeTitle: string | null;
    cafeContent: string | null;
    blogTitle: string | null;
    sustainabilityText: string | null;
  } | null;
  aboutPages: {
    ourStory: {
      heroTitle: string | null;
      heroSubtitle: string | null;
      quoteText: string | null;
      sections: Array<{
        title: string | null;
        text: string | null;
      }> | null;
      ctaTitle: string | null;
      ctaText: string | null;
    } | null;
    missionAndValues: {
      sections: Array<{
        title: string | null;
        text: string | null;
      }> | null;
      reportsDescription: string | null;
      feedbackDescription: string | null;
    } | null;
    sustainability: {
      heroTitle: string | null;
      heroText: string | null;
      sections: Array<{
        title: string | null;
        text: string | null;
      }> | null;
      ctaTitle: string | null;
      ctaText: string | null;
    } | null;
    pillarsOfHealth: {
      heroTitle: string | null;
      heroText: string | null;
      pillars: Array<{
        name: string | null;
        description: string | null;
      }> | null;
    } | null;
  } | null;
  services: Array<{
    title: string | null;
    slug: string | null;
    description: string | null;
    treatments: Array<{
      title: string | null;
      slug: string | null;
      description: string | null;
      sections: Array<{
        title: string | null;
        text: string | null;
      }> | null;
      benefits: Array<{
        title: string | null;
        subtitle: string | null;
      }> | null;
    }>;
  }>;
  lifestyleServices: Array<{
    title: string | null;
    slug: string | null;
    description: string | null;
    sections: Array<{
      title: string | null;
      text: string | null;
    }> | null;
    faq: Array<{
      title: string | null;
      description: string | null;
    }> | null;
    pillars: Array<{
      title: string | null;
      description: string | null;
    }> | null;
  }>;
  products: Array<{
    title: string | null;
    slug: string | null;
    description: string | null;
    details: Array<{
      title: string | null;
      description: string | null;
    }> | null;
  }>;
  cafe: {
    introTitle: string | null;
    subheading: string | null;
    description: string | null;
    quoteText: string | null;
    sections: Array<{
      title: string | null;
      text: string | null;
    }> | null;
    menuDescription: string | null;
    ctaText: string | null;
    seoDescription: string | null;
  } | null;
  team: Array<{
    name: string | null;
    role: string | null;
    bio: string | null;
  }>;
  programs: {
    title: string | null;
    introSubtitle: string | null;
    introText: string | null;
    programs: Array<{
      name: string | null;
      description: string | null;
    }> | null;
    essentialSeries: string | null;
    curateLifestyle: string | null;
    masterHealthBlueprint: string | null;
    threePaths: {
      heading: string | null;
      subtitle: string | null;
      paragraph: string | null;
    } | null;
    faq: Array<{
      title: string | null;
      description: string | null;
    }> | null;
    ctaText: string | null;
  } | null;
  contactPage: {
    title: string | null;
    parking: string | null;
    howToGetHere: string | null;
    branchName: string | null;
    branchName2: string | null;
    businessHours: {
      standardHours: string | null;
      customStandardHours: string | null;
      daysOpen: string[] | null;
    } | null;
    businessHours2: {
      standardHours: string | null;
      customStandardHours: string | null;
      daysOpen: string[] | null;
    } | null;
  } | null;
  legalPages: Array<{
    title: string | null;
    slug: string | null;
    description: string | null;
  }>;
  posts: Array<{
    title: string | null;
    slug: string | null;
    excerpt: string | null;
    sections: Array<{
      title: string | null;
      text: string | null;
    }> | null;
  }>;
};

const BRAND_AI_CONTEXT_QUERY = groq`{
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
  "primaryCTAButton": *[_type == "primaryCTAButton"][0]{
    ctaButton{
      ctaText,
      ctaLink
    }
  },
  "home": {
    "heroTitle": *[_type == "heroSection"][0].heroText,
    "heroSubtitle": *[_type == "heroSection"][0].heroSubtitle,
    "aboutTitle": coalesce(*[_type == "aboutSection"][0].title1, "") + " " + coalesce(*[_type == "aboutSection"][0].title2, ""),
    "aboutText": *[_type == "aboutSection"][0].hoverLinkText,
    "clinicContent": pt::text(*[_type == "clinic"][0].content),
    "productsTitle": *[_type == "productsSection"][0].sectionTitle,
    "servicesTitle": *[_type == "servicesSection"][0].sectionTitle,
    "cafeTitle": *[_type == "cafeSection"][0].title,
    "cafeContent": pt::text(*[_type == "cafeSection"][0].content),
    "blogTitle": *[_type == "blogSection"][0].sectionTitle,
    "sustainabilityText": *[_type == "sustainabilitySection"][0].sustainText
  },
  "aboutPages": {
    "ourStory": *[_type == "ourStory" && pageActive == true][0]{
      "heroTitle": heroSection.heroTitle,
      "heroSubtitle": heroSection.heroSubtitle,
      "quoteText": quoteSection.quoteText,
      "sections": additionalSections[]{
        "title": sectionTitle,
        "text": pt::text(sectionParagraph)
      },
      "ctaTitle": ctaSection.ctaSectionTitle,
      "ctaText": pt::text(ctaSection.ctaSectionParagraph)
    },
    "missionAndValues": *[_type == "missionAndValues" && pageActive == true][0]{
      "sections": additionalSections[]{
        "title": sectionTitle,
        "text": pt::text(sectionParagraph)
      },
      "reportsDescription": annualReportsSection.description,
      "feedbackDescription": feedbackSurvey.description
    },
    "sustainability": *[_type == "sustainability" && pageActive == true][0]{
      "heroTitle": heroSection.heroTitle,
      "heroText": pt::text(heroSection.heroParagraph),
      "sections": additionalSections[]{
        "title": sectionTitle,
        "text": pt::text(sectionParagraph)
      },
      "ctaTitle": ctaSection.ctaSectionTitle,
      "ctaText": pt::text(ctaSection.ctaSectionParagraph)
    },
    "pillarsOfHealth": *[_type == "pillarsOfHealth" && pageActive == true][0]{
      "heroTitle": heroSection.heroTitle,
      "heroText": pt::text(heroSection.heroParagraph),
      "pillars": pillars[]{
        "name": pillarName,
        "description": pillarDescription
      }
    }
  },
  "services": *[_type == "service" && isActive == true] | order(title asc){
    title,
    "slug": slug.current,
    "description": coalesce(seo.pageDescription, pt::text(content)),
    "treatments": *[_type == "treatments" && service._ref == ^._id && isActive == true] | order(title asc){
      title,
      "slug": treatmentSlug.current,
      "description": coalesce(seo.pageDescription, intro.introParagraph, quoteContent),
      "sections": additionalSections[]{
        "title": sectionTitle,
        "text": pt::text(sectionParagraph)
      },
      "benefits": benefits.benefitsList[]{
        title,
        subtitle
      }
    }
  },
  "lifestyleServices": *[_type in ["serviceLifestyle", "serviceLifestyleProgram"] && defined(slug.current)] | order(title asc){
    title,
    "slug": slug.current,
    "description": coalesce(seo.pageDescription, pt::text(content), intro.introParagraph),
    "sections": select(
      _type == "serviceLifestyle" => [
        {
          "title": hero_secondary_title,
          "text": hero_large_text
        },
        {
          "title": block_2_title,
          "text": pt::text(block_2_content)
        },
        {
          "title": block_3_title,
          "text": pt::text(block_3_content)
        }
      ],
      additionalSections[]{
        "title": sectionTitle,
        "text": pt::text(sectionParagraph)
      }
    ),
    faq[]{
      title,
      description
    },
    pillars[]{
      title,
      description
    }
  },
  "products": *[_type == "product" && isActive == true && defined(slug.current)] | order(title asc){
    title,
    "slug": slug.current,
    description,
    "details": accordioninfo[]{
      title,
      description
    }
  },
  "cafe": *[_type == "cafePage" && pageActive == true][0]{
    "introTitle": introSection.title,
    "subheading": introSection.subheading,
    "description": introSection.description,
    "quoteText": quoteSection.quoteText,
    "sections": additionalSections[]{
      "title": sectionTitle,
      "text": pt::text(sectionParagraph)
    },
    "menuDescription": menuDownloadSection.description,
    "ctaText": ctaBandSection.body,
    "seoDescription": seo.pageDescription
  },
  "team": *[_type == "ourTeam" && pageActive == true][0].teamMembers[]{
    name,
    role,
    "bio": pt::text(bio)
  },
  "programs": *[_type == "ourPrograms" && isActive == true][0]{
    title,
    "introSubtitle": intro.subtitle,
    "introText": intro.introParagraph,
    "programs": programs[]{
      "name": programName,
      description
    },
    "essentialSeries": essentialSeries.description,
    "curateLifestyle": curateLifestyle.description,
    "masterHealthBlueprint": masterHealthBlueprint.description,
    "threePaths": {
      "heading": threePaths.heading,
      "subtitle": threePaths.subtitle,
      "paragraph": threePaths.paragraph
    },
    faq[]{
      title,
      description
    },
    "ctaText": ctaSection.paragraph
  },
  "contactPage": *[_type == "contactPage"][0]{
    "title": heroSection.title,
    parking,
    howToGetHere,
    branchName,
    branchName2,
    businessHours{
      standardHours,
      customStandardHours,
      daysOpen
    },
    businessHours2{
      standardHours,
      customStandardHours,
      daysOpen
    }
  },
  "legalPages": *[_type == "legalPage" && defined(slug.current)] | order(title asc){
    title,
    "slug": slug.current,
    "description": coalesce(seo.pageDescription, pt::text(body))
  },
  "posts": *[_type == "post" && published == true && defined(slug.current)] | order(publishedAt desc)[0...10]{
    title,
    "slug": slug.current,
    excerpt,
    "sections": sections[]{
      "title": sectionTitle,
      "text": pt::text(sectionParagraph)
    }
  }
}`;

function compact(value: unknown): string {
  if (value == null) {
    return "";
  }

  if (typeof value === "string") {
    return value.replace(/\s+/g, " ").trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(compact).filter(Boolean).join(" ");
  }

  if (typeof value === "object") {
    if ("text" in value && typeof value.text === "string") {
      return compact(value.text);
    }

    if ("children" in value && Array.isArray(value.children)) {
      return compact(value.children);
    }

    return Object.values(value).map(compact).filter(Boolean).join(" ");
  }

  return "";
}

function truncate(value: unknown, maxLength = 700) {
  const text = compact(value);

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}...`;
}

function bullet(text: string) {
  return text ? `- ${text}` : "";
}

function bulletFromParts(parts: Array<string | null | undefined>) {
  return bullet(parts.map((part) => truncate(part, 500)).filter(Boolean).join(": "));
}

function formatTextSections(
  sections: Array<{ title: string | null; text: string | null }> | null | undefined,
  maxItems = 5
) {
  return (
    sections
      ?.filter((section) => section.title || section.text)
      .slice(0, maxItems)
      .map((section) => bulletFromParts([section.title, section.text]))
      .filter(Boolean)
      .join("\n") ?? ""
  );
}

function formatAddress(data: BrandAiContextData) {
  const address = data.siteSettings?.contactInfo?.address;

  if (!address) {
    return "";
  }

  return [address.street, address.city, address.state, address.zip, address.country]
    .map(compact)
    .filter(Boolean)
    .join(", ");
}

function formatService(service: BrandAiContextData["services"][number]) {
  const url = `${BASEURL}/services/${service.slug}`;
  const lines = [
    `- [${service.title}](${url})${service.description ? `: ${truncate(service.description)}` : ""}`,
  ];

  const treatmentLines = service.treatments
    .filter((treatment) => treatment.title && treatment.slug)
    .map((treatment) => {
      const treatmentUrl = `${url}/${treatment.slug}`;
      const description = truncate(treatment.description, 500);
      const sections = formatTextSections(treatment.sections, 2);
      const benefits =
        treatment.benefits
          ?.filter((benefit) => benefit.title || benefit.subtitle)
          .slice(0, 4)
          .map((benefit) => [benefit.title, benefit.subtitle].map(compact).filter(Boolean).join(" - "))
          .join("; ") ?? "";

      return [
        `  - [${treatment.title}](${treatmentUrl})${description ? `: ${description}` : ""}`,
        sections
          ? sections
              .split("\n")
              .map((line) => `    ${line}`)
              .join("\n")
          : "",
        benefits ? `    - Benefits: ${benefits}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    });

  return [...lines, ...treatmentLines].join("\n");
}

function formatLifestyleService(
  service: BrandAiContextData["lifestyleServices"][number]
) {
  const url = `${BASEURL}/services/${service.slug}`;
  const lines = [
    `- [${service.title}](${url})${service.description ? `: ${truncate(service.description)}` : ""}`,
    formatTextSections(service.sections, 4),
    service.pillars?.length
      ? `- Pillars: ${service.pillars
          .filter((pillar) => pillar.title || pillar.description)
          .slice(0, 5)
          .map((pillar) => [pillar.title, pillar.description].map(compact).filter(Boolean).join(" - "))
          .join("; ")}`
      : "",
    service.faq?.length
      ? service.faq
          .filter((faq) => faq.title || faq.description)
          .slice(0, 5)
          .map((faq) => bulletFromParts([faq.title, faq.description]))
          .join("\n")
      : "",
  ];

  return lines.filter(Boolean).join("\n");
}

function formatProduct(product: BrandAiContextData["products"][number]) {
  const details = product.details
    ?.filter((detail) => detail.title || detail.description)
    .slice(0, 4)
    .map((detail) => bulletFromParts([detail.title, detail.description]))
    .join("\n");

  return [
    `- [${product.title}](${BASEURL}/products/${product.slug})${product.description ? `: ${truncate(product.description)}` : ""}`,
    details,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildBrandAiContext(data: BrandAiContextData) {
  const brandName = data.siteSettings?.brandName || BRAND_NAME;
  const services = data.services ?? [];
  const lifestyleServices = data.lifestyleServices ?? [];
  const products = data.products ?? [];
  const team = data.team ?? [];
  const posts = data.posts ?? [];
  const legalPages = data.legalPages ?? [];
  const description =
    compact(data.siteMetadata?.defaultDescription) ||
    "Curate Health is a Toronto health and wellness clinic.";
  const address = formatAddress(data);
  const contact = data.siteSettings?.contactInfo;
  const bookingText = data.primaryCTAButton?.ctaButton?.ctaText || "Book Now";
  const bookingUrl = data.primaryCTAButton?.ctaButton?.ctaLink;
  const socialLinks =
    data.siteSettings?.socialMedia
      ?.filter((link) => link.isActive && link.platform && link.url)
      .map((link) => `- ${link.platform}: ${link.url}`) ?? [];
  const about = data.aboutPages;
  const contactPage = data.contactPage;

  const sections = [
    `# ${brandName}`,
    description,
    "## Canonical Site",
    `- Website: ${BASEURL}`,
    bookingUrl ? bullet(`${bookingText}: ${bookingUrl}`) : "",
    bullet(`Location: ${address}`),
    bullet(`Phone: ${contact?.phone ?? ""}`),
    bullet(`Email: ${contact?.email ?? ""}`),
    bullet(`Map: ${contact?.mapLink ?? ""}`),
    "## What Curate Health Offers",
    "Curate Health provides Toronto-based healthcare, chiropractic care, rehabilitation, wellness services, lifestyle programming, and cafe/recovery offerings.",
    "## Booking",
    bookingUrl
      ? [
          `- Use this canonical booking link for appointments and booking questions: ${bookingUrl}`,
          "- If a user asks how to book, send them to the booking link first and include phone/email for help.",
          "- Do not recommend patient portal, product portal, or third-party portal links unless they are the canonical booking link above.",
        ].join("\n")
      : "",
    "## Home Page Highlights",
    data.home
      ? [
          bulletFromParts([data.home.heroTitle, data.home.heroSubtitle]),
          bulletFromParts([data.home.aboutTitle, data.home.aboutText]),
          bulletFromParts(["Clinic", data.home.clinicContent]),
          bulletFromParts(["Services section", data.home.servicesTitle]),
          bulletFromParts(["Products section", data.home.productsTitle]),
          bulletFromParts([data.home.cafeTitle, data.home.cafeContent]),
          bulletFromParts(["Sustainability", data.home.sustainabilityText]),
        ]
          .filter(Boolean)
          .join("\n")
      : "",
    "## About Curate Health",
    about
      ? [
          about.ourStory
            ? [
                bulletFromParts([
                  "Our Story",
                  about.ourStory.heroTitle,
                  about.ourStory.heroSubtitle,
                ]),
                bulletFromParts(["Quote", about.ourStory.quoteText]),
                formatTextSections(about.ourStory.sections),
                bulletFromParts([
                  about.ourStory.ctaTitle,
                  about.ourStory.ctaText,
                ]),
              ]
                .filter(Boolean)
                .join("\n")
            : "",
          about.missionAndValues
            ? [
                formatTextSections(about.missionAndValues.sections),
                bulletFromParts([
                  "Annual reports",
                  about.missionAndValues.reportsDescription,
                ]),
                bulletFromParts([
                  "Feedback survey",
                  about.missionAndValues.feedbackDescription,
                ]),
              ]
                .filter(Boolean)
                .join("\n")
            : "",
          about.sustainability
            ? [
                bulletFromParts([
                  "Sustainability",
                  about.sustainability.heroTitle,
                  about.sustainability.heroText,
                ]),
                formatTextSections(about.sustainability.sections),
                bulletFromParts([
                  about.sustainability.ctaTitle,
                  about.sustainability.ctaText,
                ]),
              ]
                .filter(Boolean)
                .join("\n")
            : "",
          about.pillarsOfHealth
            ? [
                bulletFromParts([
                  "Pillars of Health",
                  about.pillarsOfHealth.heroTitle,
                  about.pillarsOfHealth.heroText,
                ]),
                about.pillarsOfHealth.pillars
                  ?.filter((pillar) => pillar.name || pillar.description)
                  .map((pillar) =>
                    bulletFromParts([pillar.name, pillar.description])
                  )
                  .join("\n") ?? "",
              ]
                .filter(Boolean)
                .join("\n")
            : "",
        ]
          .filter(Boolean)
          .join("\n")
      : "",
    "## Services",
    services
      .filter((service) => service.title && service.slug)
      .map(formatService)
      .join("\n"),
    "## Lifestyle Services And Programs",
    lifestyleServices
      .filter((service) => service.title && service.slug)
      .map(formatLifestyleService)
      .join("\n"),
    "## Products",
    products
      .filter((product) => product.title && product.slug)
      .map(formatProduct)
      .join("\n"),
    "## Our Programs",
    data.programs
      ? [
          bulletFromParts([
            data.programs.title,
            data.programs.introSubtitle,
            data.programs.introText,
          ]),
          data.programs.programs
            ?.filter((program) => program.name || program.description)
            .map((program) => bulletFromParts([program.name, program.description]))
            .join("\n") ?? "",
          bulletFromParts(["Essential Series", data.programs.essentialSeries]),
          bulletFromParts(["Curate Lifestyle", data.programs.curateLifestyle]),
          bulletFromParts([
            "Master Health Blueprint",
            data.programs.masterHealthBlueprint,
          ]),
          data.programs.threePaths
            ? bulletFromParts([
                data.programs.threePaths.heading,
                data.programs.threePaths.subtitle,
                data.programs.threePaths.paragraph,
              ])
            : "",
          data.programs.faq
            ?.filter((faq) => faq.title || faq.description)
            .map((faq) => bulletFromParts([faq.title, faq.description]))
            .join("\n") ?? "",
          bulletFromParts(["Program CTA", data.programs.ctaText]),
        ]
          .filter(Boolean)
          .join("\n")
      : "",
    "## Cafe And Recovery",
    data.cafe
      ? [
          `- [Curate Cafe](${BASEURL}/cafe): ${truncate(data.cafe.seoDescription || data.cafe.description)}`,
          bulletFromParts([data.cafe.introTitle, data.cafe.subheading]),
          bulletFromParts(["Quote", data.cafe.quoteText]),
          formatTextSections(data.cafe.sections),
          bulletFromParts(["Menu", data.cafe.menuDescription]),
          bulletFromParts(["CTA", data.cafe.ctaText]),
          `- Menu page: ${BASEURL}/cafe`,
        ]
          .filter(Boolean)
          .join("\n")
      : "",
    "## Practitioners And Team",
    team
      .filter((member) => member.name)
      .map((member) =>
        bullet(
          `${member.name}${member.role ? `, ${truncate(member.role, 120)}` : ""}${
            member.bio ? `: ${truncate(member.bio, 450)}` : ""
          }`
        )
      )
      .join("\n"),
    "## Contact And Visiting",
    contactPage
      ? [
          bulletFromParts([contactPage.title]),
          bulletFromParts([contactPage.branchName]),
          bulletFromParts([contactPage.branchName2]),
          bulletFromParts(["Parking", contactPage.parking]),
          bulletFromParts(["How to get here", contactPage.howToGetHere]),
          contactPage.businessHours
            ? bulletFromParts([
                "Business hours",
                contactPage.businessHours.customStandardHours ||
                  contactPage.businessHours.standardHours,
                contactPage.businessHours.daysOpen?.join(", "),
              ])
            : "",
          contactPage.businessHours2
            ? bulletFromParts([
                "Second location business hours",
                contactPage.businessHours2.customStandardHours ||
                  contactPage.businessHours2.standardHours,
                contactPage.businessHours2.daysOpen?.join(", "),
              ])
            : "",
        ]
          .filter(Boolean)
          .join("\n")
      : "",
    "## Recent Articles",
    posts
      .filter((post) => post.title && post.slug)
      .map((post) =>
        [
          bullet(
            `[${post.title}](${BASEURL}/blog/${post.slug})${
              post.excerpt ? `: ${truncate(post.excerpt)}` : ""
            }`
          ),
          formatTextSections(post.sections, 2),
        ]
          .filter(Boolean)
          .join("\n")
      )
      .join("\n"),
    "## Legal And Policies",
    legalPages
      .filter((page) => page.title && page.slug)
      .map((page) =>
        bullet(
          `[${page.title}](${BASEURL}/legal/${page.slug})${
            page.description ? `: ${truncate(page.description, 500)}` : ""
          }`
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

export async function getBrandAiContext() {
  const data = await sanityFetch<BrandAiContextData>({
    query: BRAND_AI_CONTEXT_QUERY,
    revalidate: BRAND_AI_CONTEXT_REVALIDATE,
  });

  return buildBrandAiContext(data);
}
