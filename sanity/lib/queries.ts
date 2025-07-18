import { groq } from "next-sanity";

export const SEO_QUERY = groq`
  seo{
    pageTitle,
    pageDescription,
    socialMeta{
      ogImage{
        asset-> {
          url,
          alt
        }
      },
      twitterImage{
        asset-> {
          url,
          alt
        }
      }
    }
  }
`;

export const POSTS_QUERY = groq`*[_type == "post" && defined(slug)]`;

export const POST_QUERY = groq`*[_type == "post" && slug.current == $slug][0]`;

export const SUSTAINABILITY_SECTION_QUERY = groq`*[_type == "sustainabilitySection"][0]{
  bgImage {
    asset->{
      _id,
      url
    },
    alt
  },
  sustainText
}`;

const ABOUT_SECTION_QUERY = groq`*[_type == "aboutSection"][0]{
  title1,
  title2,
  "aboutImage": {
    "asset": aboutImage.asset->{
      _id,
      url
    },
    "alt": aboutImage.alt
  },
  hoverLinkText,
  hoverLinkHref
}`;

const CLINIC_SECTION_QUERY = groq`*[_type == "clinic"][0]{
  "clinicImage": {
    "asset": clinicImage.asset->{
      _id,
      url
    },
    "alt": clinicImage.alt
  },
  content
}`;

const CAFE_QUERY = groq`*[_type == "cafeSection"][0] {
  cafeImage {
    asset-> {
      _id,
      url
    },
    alt
  },
  title,
  content,
  hoverLinkText,
  hoverLinkHref,
  meta {
    title,
    description
  }
}`;

const BLOG_SECTION_QUERY = groq`*[_type == "blogSection"][0]{
  sectionTitle,
  hoverLinkText,
  hoverLinkHref
}`;

export const OURSERVICES_QUERY = groq`*[_type == "ourServices"][0]{
  title,
  "image": image.asset->url,
  content
}`;

export const SERVICES_QUERY = groq`*[_type == "service" && isActive == true]{
  "slug": slug.current,
  "hero_image": hero_image.asset->url,
  "altText": hero_image.alt,
  }`;

export const ALL_SERVICES_QUERY = groq`*[_type == "service" && isActive == true]{
    title,
    "slug": slug.current,
    "hero_image": hero_image.asset->url,
    "hero_alt": hero_image.alt,
    }`;

export const SERVICES_PAGE_QUERY = groq`*[_type == "servicesHeroSection"][0]{
  "heroSection": {
    title,
    "image": image.asset->url,
    "alt": image.alt,
    subtitle
  },
  "seo": ${SEO_QUERY},
  "services": ${ALL_SERVICES_QUERY},
  }`;

export const SERVICES_SECTION_QUERY = groq`*[_type == "servicesSection"][0]{
  sectionTitle,
  hoverLinkText,
  hoverLinkHref,
  "services": *[_type == "service" && isActive == true]{
    title,
    "slug": slug.current,
    "hero_image": hero_image.asset->url,
    "hero_alt": hero_image.alt
  }
}`;

export const SERVICES_SLUG_QUERY = groq`*[_type == "service" && isActive == true && defined(slug.current)] {
  "params": {"slug": slug.current}
}`;

export const SERVICE_BY_SLUG_QUERY = groq`
  *[_type == "service" && slug.current == $slug][0]{
    title,
    "slug": slug.current,
    "hero_image": hero_image.asset->url,
    "hero_alt": hero_image.alt,
    "content_image": content_image.asset->url,
    "content_alt": content_image.alt,
    content,
    "treatments": *[_type == "treatments" && service._ref == ^._id && isActive == true]{
      _id,
      title,
      "slug": treatmentSlug.current,
      "rawSlug": treatmentSlug
    },
    ${SEO_QUERY}
  }
`;

export const TREATMENTS_QUERY = groq`*[_type == "treatments" && isActive == true]{
  title,
  "treatmentSlug": treatmentSlug.current,
  "service": service->{
    title,
    "slug": slug.current
  },
  "image": image.asset->url,
  "altText": image.alt,
  content,

}`;

export const TREATMENT_BY_SLUG_QUERY = groq`
*[_type == "treatments" && isActive == true && treatmentSlug.current == $slug][0] {
  title,
  treatmentSlug,
  "serviceName": service->title,
  heroImage {
    asset->{
      url,      
    },
    heroAlt
  },
  intro {
    subtitle,
    introParagraph
  },
  quoteContent,
  additionalSections[] {
    sectionTitle,
    sectionParagraph,
    sectionImage {
      "image": image.asset->url,
      alt
    }
  },  
  benefits {
    title,
    benefitsList[] {
      title,
      subtitle
    }
  },
  cta {
    ctaBg {
      asset->{
        url,
        metadata {
          dimensions
        }
      }
    },
    ctaBgAlt,
    ctaTitle,
    ctaText,
    ctaButtonText
  },
  ${SEO_QUERY}
}`;

export const FOOTER_QUERY = groq`
  *[_type == "footer"][0] {
    contactInfo {
      sectionTitle,
      details[] {
        label,
        value
      }
    },
    servicesSection[]-> {
      title,
      "slug": slug.current,
      image {
        asset-> {
          _id,
          url
        },
        alt
      }
    },
    sections[] {
      title,
      links[] {
        text,
        href
      }
    },
    socialLinksSection {
      title,
      links[] {
        platform,
        url
      }
    },
    privacy {
      links[] {
        title,
        href
      }
    }
  }
`;

export const PRODUCTS_SECTION_QUERY = groq`*[_type == "productsSection"][0]{
  sectionTitle,
  "products": *[_type == "product" && isActive == true]{
    title,
    description,
    "slug": slug.current,
    "image": image.asset->url,
    "altText": image.alt
  }
}`;

export const PRODUCTS_QUERY = groq`*[_type == "product" && isActive == true] {
  title,
  indepthblockinfo,
  description,
  "slug" : slug.current,
  "banner": banner.asset->url,
  "image": image.asset->url,
  "altText": image.alt,
  meta {
    title,
    description
  }
}`;

export const PRODUCTS_NAVIGATION_QUERY = groq`*[_type == "product" && isActive == true] {
  title,
  "slug": slug.current,
}`;

export const PRODUCT_BY_SLUG_QUERY = groq`*[_type == "product" && slug.current == $slug && isActive == true][0] {
  title,
  slug,
  description,
  image {
    asset->,
    alt
  },
  banner {
    asset->,
    alt
  },
  accordioninfo[] {
    title,
    description
  },
  callToAction,
  ${SEO_QUERY}
}`;

export const PRODUCT_QUERY = groq`*[_type == "product" && slug.current == $slug][0]`;

export const PRODUCT_SLUG_QUERY = groq`*[_type == "product" && isActive == true && defined(slug.current)] {
  "params": {"slug": slug.current}
}`;

export const NAVIGATION_QUERY = groq`*[_type == "navigation"][0]{
  serviceLinks[]->{
    title,
    "slug": slug.current
  },
  aboutLinks[]{
    title,
    href,
  },
  navItems[]{
    linkText,
    href,
    isServiceLinks,
    isAboutLinks
  }
}`;

export const TERMS_OF_USE_QUERY = groq`*[_type == "termOfUse"][0] {
  title,
  content,
  meta {
    title,
    description
  }
}`;

export const PRIVACY_QUERY = groq`*[_type == "privacy"][0] {
  title,
  content,
  meta {
    title,
    description
  }
}`;

export const ACCESSIBILITY_QUERY = groq`*[_type == "accessibility"][0] {
  title,
  content,
  meta {
    title,
    description
  }
}`;

export const SURVEY_LINK_QUERY = groq`*[_type == "surveySection"][0]{
  bgImage {
    asset-> {
      _id,
      url
    },
    alt
  },
  cta,
  youformId,
  content,
  bold,
  meta {
    title,
    description
  }
}`;

export const POPUP_CONTENT_QUERY = groq`*[_type == "popup" && isActive == true][0]{
  title,
  content,
  isActive,
}`;

export const FEEDBACK_LINK_QUERY = groq`*[_type == "feedbackLink"][0]{
  linkText,
  youformId
}`;

export const ABOUT_PAGES_QUERY = groq`*[_type == "aboutPage" && isActive == true] | order(_createdAt desc){
  title,
  "slug": slug.current,
}`;

export const OUR_STORY_PAGE_QUERY = groq`*[_type == "ourStory" && pageActive == true][0]{
  heroSection{
    heroImage{
      "image": image.asset->url,
      alt
    },
    heroTitle,
    heroSubtitle
  },
  quoteSection{
    quoteImage{
      "image": image.asset->url,
      alt
    },
    quoteText
  },
  additionalSections[]{
    sectionTitle,
    sectionParagraph,
    sectionImage{
      "image": image.asset->url,
      alt
    }
  },
  ctaSection{
    ctaSectionImage{
      "image": image.asset->url,
      alt
    },
    ctaSectionTitle,
    ctaSectionParagraph,
    ctaButton{
      buttonText,
      buttonLink
    }
  },
  ${SEO_QUERY}
}`;

export const OUR_TEAM_PAGE_QUERY = groq`*[_type == "ourTeam" && pageActive == true][0]{
  heroSection{
    heroTitle,
    heroParagraph
  },
  teamMembers[] {
    name,
    role,
    bio,
    image {
      asset-> {
        url
      }
    }
  },
  ${SEO_QUERY}
}`;

export const MISSION_AND_VALUES_QUERY = groq`*[_type == "missionAndValues" && pageActive == true][0]{
 heroSection{
   heroImage{
     image{
       asset->
     },
     alt
   }
 },
 additionalSections[]{
    sectionTitle,
    sectionParagraph,
    sectionImage{
      "image": image.asset->url,
      alt
    }
  },
  ${SEO_QUERY}
}`;

export const SUSTAINABILITY_QUERY = groq`*[_type == "sustainability" && pageActive == true][0] {
  heroSection {
    heroTitle,
    heroParagraph,
    heroImage {
      "image": image.asset->url,
      alt
    }
  },
  additionalSections[] {
    sectionTitle,
    sectionParagraph,
    sectionImage {
      "image": image.asset->url,
      alt
    }
  },
  ctaSection {
    ctaSectionImage {
      "image": image.asset->url,
      alt
    },
    ctaSectionTitle,
    ctaSectionParagraph,
    ctaButton {
      buttonText,
      buttonLink
    }
  },
  ${SEO_QUERY}
}`;

export const PILLARS_OF_HEALTH_QUERY = groq`*[_type == "pillarsOfHealth" && pageActive == true][0] {
  heroSection {
    heroTitle,
    heroParagraph,
    heroImage {
      "image": image.asset->url,
      alt
    }
  },
  pillars[] {
    pillarName,
    pillarDescription
  },
  ${SEO_QUERY}
}`;

// * Settings / Shared Queries

export const POPUP_BANNER_QUERY = groq`*[_type == "popupBanner" && isActive == true][0]{
  title,
  content,
}`;

export const FAVICON_QUERY = groq`*[_type == "siteMetadata"]{
  "url": favicon.asset->url
}[0]`;

export const SITE_METADATA_QUERY = groq`
  *[_type == "siteMetadata"][0]{
    homePageTitle,
    templateTitlePrefix,
    defaultDescription,
    favicon {
      asset -> {
        url
      }
    },
    keywords,
    socialMeta {
      title,
      description,
      ogImage {
        asset -> {
          url,
          alt
        }
      },
      twitterImage {
        asset -> {
          url,
          alt
        }
      }
    }
  }
`;

export const SITE_SETTINGS_QUERY = groq`*[_type == "siteSettings"]{
  brandName,
  siteLogo{
    asset->{
      _id,
      url
    },
  },
  contactInfo{
    email,
    phone,
    address{
      street,
      city,
      state,
      zip,
      country
    },
    mapLink,
  },
  "services": *[_type == "service" && isActive == true]{
    _key,
    title,
    "slug": slug.current,
    isActive
  },
  "aboutPages": [
    *[_type == "ourStory" && pageActive == true][0]{
      "title": "Our Story",
      "slug": "our-story"
    },
    *[_type == "ourTeam" && pageActive == true][0]{
      "title": "Our Team",
      "slug": "our-team"
    },
    *[_type == "missionAndValues" && pageActive == true][0]{
      "title": "Mission and Values",
      "slug": "mission-and-values"
    },
    *[_type == "sustainability" && pageActive == true][0]{
      "title": "Sustainability",
      "slug": "sustainability"
    },
    *[_type == "pillarsOfHealth" && pageActive == true][0]{
      "title": "Pillars of Health",
      "slug": "pillars-of-health"
    },
  ],
  navLinks[]{
    _key,
    title,
    href
  },
  footerNavLinks[]{
    _key,
    groupTitle,
    links[]{
      title,
      slug {
        current
      }
    }
  },
  legalLinks[]{
    _key,
    "title": @->title,
    "slug": @->slug.current
  },
  socialMedia[]{
    _key,
    platform,
    platformLogo{
      asset->{
        _id,
        url
      }
    },
    isActive,
    url
  }
}[0]`;

export const PRIMARY_CTA_BUTTON_QUERY = groq`
  *[_type == "primaryCTAButton"][0]{
    ctaButton{
      ctaText,
      ctaLink,
    }
  }
`;

export const SURVEY_SECTION_QUERY = groq`*[_type == "surveySection"][0]{
  bgImage {
    asset-> {
      _id,
      url
    },
    alt
  },
  cta,
  youformId,
  content,
  bold,
}`;

export const NEWSLETTER_SECTION_QUERY = groq`*[_type == "newsletterSection"][0]{
  bgImage {
    asset-> {
      _id,
      url
    },
    alt
  },
  cta,
  youformId,
  content,
  bold,
}`;

// * Home Page Sections Queries

export const HERO_SECTION_QUERY = groq`*[_type == "heroSection"][0]{
  videoID,
  videoFile {
    asset-> {
      playbackId
    }
  },
  heroText,
}`;

//* Layout Query

export const LAYOUT_QUERY = groq`{
  "siteSettings": ${SITE_SETTINGS_QUERY},
  "primaryCTAButton": ${PRIMARY_CTA_BUTTON_QUERY},
  "navLinks": ${NAVIGATION_QUERY},
  "newsletterSection": ${NEWSLETTER_SECTION_QUERY},
  "surveySection": ${SURVEY_SECTION_QUERY},
  "footer": ${FOOTER_QUERY},
  "popupBanner": ${POPUP_BANNER_QUERY}
}`;

//* Page Queries

export const HOME_PAGE_QUERY = groq`{
  "heroSection": ${HERO_SECTION_QUERY},
  "primaryCTAButton": ${PRIMARY_CTA_BUTTON_QUERY}, 
  "aboutSection": ${ABOUT_SECTION_QUERY},
  "clinicSection": ${CLINIC_SECTION_QUERY},
  "productsSection": ${PRODUCTS_SECTION_QUERY},
  "servicesSection": ${SERVICES_SECTION_QUERY},
  "cafeSection": ${CAFE_QUERY},
  "blogSection": ${BLOG_SECTION_QUERY},
  "sustainabilitySection": ${SUSTAINABILITY_SECTION_QUERY},
}`;

export const CONTACT_INFO_QUERY = groq`*[_type == "siteSettings"][0]{
  "brandName": brandName,
  contactInfo{
    email,
    phone,
    address{
      street,
      city,
      state,
      zip,
      country
    },
    mapLink,
  },
}`;

export const CONTACT_PAGE_QUERY = groq`{
  "contactInfo": ${CONTACT_INFO_QUERY},
  "page": *[_type == "contactPage"][0]{
    heroSection{
      title,
      heroImage {
        "image": image.asset->url,
        alt
      }
    },
    mapURL,
    businessHours{
      standardHours,
      customStandardHours,
      daysOpen,
      exceptions[]{
        day,
        hours
      }
    },
    ${SEO_QUERY}
  },
}`;

export const GET_ALL_POSTS_QUERY = groq`*[_type == "post" && published == true] {
  _id,
  title,
  publishedAt,
  "slug": slug.current,
  excerpt,
  "author": author->{
    name,
    image {
      asset-> {
        url
      }
    }
  },
  mainImage {
    asset->,
    alt
  },
} | order(publishedAt desc)`;

export const GET_POST_BY_SLUG_QUERY = groq`*[_type == "post" && published == true && slug.current == $slug][0] {
  title,
  publishedAt,
  slug,
  "author": author->{
    name,
    image {
      asset-> {
        url
      }
    }
  },
  "mainImage": {
    "image": mainImage.asset->url,
    "alt": mainImage.alt
  },
  sections[] {
    sectionTitle,
    sectionParagraph,
    sectionImage {
      "image": image.asset->url,
      "alt": image.alt
    }
  },
  ${SEO_QUERY}
}`;

export const CAFE_PAGE_QUERY = groq`*[_type == "cafePage" && pageActive == true][0]{
 heroSection{
   heroImage{
     image{
       asset->
     },
     alt
   }
 },
 additionalSections[]{
    sectionTitle,
    sectionParagraph,
    sectionImage{
      "image": image.asset->url,
      alt
    }
  },
  ${SEO_QUERY}
}`;

export const SITEMAP_QUERY = groq`{
  "services": *[_type == "service" && isActive == true].slug.current,
  "treatments": *[_type == "treatments" && isActive == true]{
    "serviceSlug": service->slug.current,
    "treatmentSlug": treatmentSlug.current
  },
  "products": *[_type == "product" && isActive == true].slug.current,
  "posts": *[_type == "post" && defined(slug)].slug.current,
  "team": *[_type == "ourTeam" && pageActive == true]{_id},
  "story": *[_type == "ourStory" && pageActive == true]{_id},
  "missionValues": *[_type == "missionAndValues" && pageActive == true]{_id},
  "sustainability": *[_type == "sustainability" && pageActive == true]{_id},
  "pillarsHealth": *[_type == "pillarsOfHealth" && pageActive == true]{_id},
  "cafe": *[_type == "cafePage" && pageActive == true]{_id}
}`;

export const LEGAL_PAGE_BY_SLUG_QUERY = groq`*[_type == "legalPage" && slug.current == $slug][0]{
  title,
  body,
  ${SEO_QUERY}
}`;

export const SERVICE_LIFESTYLE_BY_SLUG_QUERY = groq`
  *[_type == "serviceLifestyle" && slug.current == $slug][0]{
    title,
    "slug": slug.current,
    "hero_image": hero_image.asset->url,
    "hero_alt": hero_image.alt,
    "content_image": content_image.asset->url,
    "content_alt": content_image.alt,
    content,
    "treatments": *[_type == "treatments" && service._ref == ^._id && isActive == true]{
      _id,
      title,
      "slug": treatmentSlug.current,
      "rawSlug": treatmentSlug
    },
    hero_secondary_title,
    hero_large_text,
    block_2_title,
    block_2_content,
    block_2_image {
      asset-> {
        url,
      }
    },
    block_3_title,
    block_3_content,
    "block_4_image": block_4_image.asset->url,
    "block_5_image": block_5_image.asset->url,
    benefits[] {
      title,
      description,
      "image": image.asset->url
    },
    "block_7_image": block_7_image.asset->url,
    "block_9_image": block_9_image.asset->url,
    timeline[] {
      title,
      description
    },
    "block_11_image": block_11_image.asset->url,
    faq[] {
      title,
      description
    },
    ${SEO_QUERY},
    "ourTeam": *[_type == "ourTeam" && pageActive == true][0]{
      teamMembers[] {
        name,
        role,
        bio,
        image {
          asset-> {
            url
          }
        }
      }
    }
  }
`;
