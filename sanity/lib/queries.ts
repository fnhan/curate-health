import { groq } from "next-sanity";

export const SEO_QUERY = groq`
  seo{
    pageTitle,
    pageDescription,
    socialMeta{
      title,
      description,
      ogImage{
        crop,
        hotspot,
        asset-> {
          _id,
          url,
          alt
        }
      },
      twitterImage{
        crop,
        hotspot,
        asset-> {
          _id,
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
    "treatments": *[_type == "treatments" && service._ref == ^._id && isActive == true] | order(coalesce(displayOrder, 9999) asc, title asc){
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
  "serviceSlug": service->slug.current,
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

/**
 * The products index page copy. CH-010.
 *
 * Every field is optional in practice: app/products/page.tsx falls back for all
 * of them, so the page renders correctly before this document is created and
 * while it is half filled in.
 */
export const PRODUCTS_PAGE_QUERY = groq`*[_type == "productsPage"][0]{
  title,
  intro,
  ${SEO_QUERY}
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
  "annualReportsSection": coalesce(annualReportsSection, financialReportsSection){
    title,
    description,
    reports[]{
      year,
      label,
      "file": file.asset->{
        url,
        originalFilename,
        mimeType
      }
    }
  },
  feedbackSurvey{
    title,
    description,
    buttonText,
    url
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
    isActive,
    "treatments": *[_type == "treatments" && service._ref == ^._id && isActive == true] | order(coalesce(displayOrder, 9999) asc, title asc){
      _id,
      title,
      "slug": treatmentSlug.current,
      "rawSlug": treatmentSlug
    },
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
    entity,
    label,
    url
  },
  // Opening hours live on contactPage, where editors manage them, and are
  // pulled in here rather than copied onto siteSettings. CH-025 had just
  // finished deleting one duplicate of exactly this kind, so storing a second
  // copy of the hours would be the same mistake under a different field name.
  "businessHours": *[_type == "contactPage"][0].businessHours{
    standardHours,
    customStandardHours,
    daysOpen,
    exceptions[]{day, hours, message}
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

const OUR_PROGRAMS_SECTION_QUERY = groq`*[_type == "ourProgramsSection"][0]{
  sectionTitle,
  "bgImage": {
    "asset": bgImage.asset->{
      _id,
      url
    },
    "alt": bgImage.alt
  },
  programs[]{
    name,
    href,
    barColor,
    isLink
  },
  hoverLinkText,
  hoverLinkHref
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
  "ourProgramsSection": ${OUR_PROGRAMS_SECTION_QUERY},
  "cafeSection": ${CAFE_QUERY},
  "blogSection": ${BLOG_SECTION_QUERY},
  "sustainabilitySection": ${SUSTAINABILITY_SECTION_QUERY},
}`;

/**
 * The address, and the only copy of it. CH-025.
 *
 * contactPage carried a second copy of this object and the two had already
 * drifted: city was "York, " here and "York" there, country null here and
 * "Canada" there, so CH-021 had to patch both. The contactPage copy is gone.
 *
 * contactInfo2, the retired downtown location, is gone from the projection
 * too. It has been absent from the data since 2026-08-18.
 */
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
      country,
      locationInfo
    },
    mapLink,
    directionsLink,
  },
}`;

/** Primary site phone for global UI (floating call button). */
export const SITE_SETTINGS_PHONE_QUERY = groq`*[_type == "siteSettings"][0]{
  "phone": contactInfo.phone
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
    branchName,
    parking,
    howToGetHere,
    mapURL,
    businessHours{
      standardHours,
      customStandardHours,
      daysOpen,
      exceptions[]{
        day,
        hours,
        message
      }
    },
    contactForm{
      "image": image.asset->url,
      alt
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
    linkedTeamMemberName,
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
    linkedTeamMemberName,
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
 introSection{
   title,
   subheading,
   description
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
 menuDownloadSection{
    eyebrow,
    headline,
    description,
    buttonLabel,
    "menuFile": menuPdf.asset->{
      url,
      originalFilename,
      mimeType
    }
 },
 ctaBandSection{
    backgroundImage{
      "url": image.asset->url,
      alt
    },
    headline,
    body,
    closingLine
 },
  ${SEO_QUERY}
}`;

export const SITEMAP_QUERY = groq`{
  "services": *[_type == "service" && isActive == true].slug.current,
  // A treatment is only a live page if its category is live too. Exercise
  // Therapy was switched on under the switched-off Lifestyle Medicine
  // category, so the sitemap kept listing an address that forwards
  // elsewhere. Caught by audit-metadata.js on 2026-09-11.
  "treatments": *[_type == "treatments" && isActive == true && service->isActive == true]{
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
    "treatments": *[_type == "treatments" && service._ref == ^._id && isActive == true] | order(coalesce(displayOrder, 9999) asc, title asc){
      _id,
      title,
      "slug": treatmentSlug.current,
      "rawSlug": treatmentSlug
    },
    hero_secondary_title,
    hero_large_text,
    referral_form_pdf {
      asset-> {
        url,
        originalFilename,
      }
    },
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
      "image": image.asset->url,
      tint_percentage,
      tint_percentage_hover
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
    call_to_action,
    pillars[] {
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
    },
    testimonials[] {
      name,
      description,
      image {
        asset-> {
          url
        }
      }
    }
  }
`;

export const SERVICE_LIFESTYLE_PROGRAM_BY_SLUG_QUERY = groq`
  *[_type == "serviceLifestyleProgram" && slug.current == $slug][0]{
 title,
  "slug": slug.current,
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
  additionalSections[] {
    sectionTitle,
    sectionParagraph,
    sectionImage {
      "image": image.asset->url,
      alt
    }
  },
  additionalCheckinTitle,
  additionalCheckin[] {
    checkinDescription,
    checkinCount
  },
  groupSectionTitle,
  groupSectionDescription,
  groupSections[] {
    description,
    "image": image.asset->url,
    "alt": image.alt
  },
  assistanceSectionTitle,
  assistanceSectionDescription,
  assistanceSectionImage {
    asset-> {
      url,
    }
  },
  referral_form_pdf {
    asset-> {
      url,
        originalFilename,
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

export const OUR_PROGRAMS_QUERY = groq`
  *[_type == "ourPrograms" && isActive == true][0]{
 title,
 heroImage {
    asset->{
      url,
      alt
    },
    heroAlt
  },
  intro {
    subtitle,
    introParagraph
  },
  programs[] {
    image {
        asset->{
          url
        },
      alt
    },
    programName,
    description
  },
  essentialSeries {
    description,
    image {
        asset->{
          url
        },
      alt
    },
    tableContent {
      includesSessions[],
      bonusSessions[],
      bonusTransferable[]
    },
    listContent[]
  },
  curateLifestyle {
    description,
    image {
        asset->{
          url
        },
      alt
    },
    structure {
      length,
      format,
      focus,
      bonus[],
      entry
    },
    outcome,
    referral_form_pdf {
      asset-> {
        url,
        originalFilename,
      }
    },
    call_to_action
  },
  masterHealthBlueprint {
    description,
    image {
        asset->{
          url
        },
      alt
    },
    structure {
      kickOff,
      team,
      plan,
      programIncludes[],
      privileges[]
    },
    outcome
  },
  exploreYourOptions {
    image {
        asset->{
          url
        }
    },
    contactMessage
  },
  faq[] {
      title,
      description
  },
  threePaths {
    heading,
    subtitle,
    paragraph,
    tableContent {
      bestFor[],
      approach[],
      focus[],
      extras {
        essentialSeries[],
        curateLifestyle[],
        masterHealthBlueprint[]
      },
      pricing {
        essentialSeries,
        curateLifestyle[],
        masterHealthBlueprint
      }
    },
  },
  ctaSection {
    image {
        asset->{
          url
        }
    },
    heading,
    paragraph,
    buttonText
  },
  ${SEO_QUERY}
}`;
