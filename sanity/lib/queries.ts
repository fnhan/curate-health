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

export const TREATMENT_BY_SLUG_QUERY = groq`
*[_type == "treatments" && isActive == true && treatmentSlug.current == $slug][0] {
  _updatedAt,
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
  janeBookingUrl,
  // Who provides this, for the block at the foot of the page. Dereferenced
  // rather than stored on the page, so a practitioner switched off in the
  // Studio drops out of every service that lists them.
  practitioners[]->{
    name,
    "slug": slug.current,
    credentials,
    // The whole image object, not just a URL, so urlForPractitionerPhoto can
    // read the hotspot and crop an editor set in the Studio.
    photo{
      ...,
      "url": asset->url,
      alt
    },
    isActive
  },
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
/**
 * The about hub copy, plus the five pages it links to. CH-009 groundwork.
 *
 * The children come from the same documents SITE_SETTINGS_QUERY builds the
 * navigation from, and carry their own seo description, so the hub describes
 * each page in the pages own words rather than in a second set written here
 * that would drift from them.
 */
export const ABOUT_INDEX_QUERY = groq`{
  "page": *[_type == "aboutIndexPage"][0]{
    title,
    intro,
    ${SEO_QUERY}
  },
  "children": [
    *[_type == "ourStory" && pageActive == true][0]{
      "title": "Our Story",
      "slug": "our-story",
      "description": seo.pageDescription
    },
    *[_type == "ourTeam" && pageActive == true][0]{
      "title": "Our Team",
      "slug": "our-team",
      "description": seo.pageDescription
    },
    *[_type == "missionAndValues" && pageActive == true][0]{
      "title": "Mission and Values",
      "slug": "mission-and-values",
      "description": seo.pageDescription
    },
    *[_type == "pillarsOfHealth" && pageActive == true][0]{
      "title": "Pillars of Health",
      "slug": "pillars-of-health",
      "description": seo.pageDescription
    },
    *[_type == "sustainability" && pageActive == true][0]{
      "title": "Sustainability",
      "slug": "sustainability",
      "description": seo.pageDescription
    }
  ]
}`;

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

/**
 * One practitioner page.
 *
 * commonlyTreats and the services list are both allowed to come back empty,
 * and the page leaves those sections out rather than showing a heading with
 * nothing under it. Everything under commonlyTreats reads as a clinical claim
 * and needs the practitioner's sign-off, so an empty list is the correct
 * state until someone confirms it, not a gap to fill from the bio.
 *
 * Services are derived from the other end of the relationship: a treatment
 * lists who provides it, and this asks which treatments point back. There is
 * deliberately no field on the practitioner holding the same fact.
 */
export const PRACTITIONER_BY_SLUG_QUERY = groq`
*[_type == "practitioner" && isActive == true && slug.current == $slug][0]{
  name,
  "slug": slug.current,
  credentials,
  languages,
  commonlyTreats,
  commonlyTreatsLabel,
  fullBio,
  // The whole image object, not just a URL, so urlForPractitionerPhoto can
  // read the hotspot and crop an editor set in the Studio.
  photo{
    ...,
    "url": asset->url,
    alt
  },
  janeBookingUrl,
  bookingNote,
  bookingCtaLabel,
  bookingCtaTarget,
  "provides": *[_type == "treatments" && isActive == true && references(^._id)]
    | order(title asc){
      title,
      "slug": treatmentSlug.current,
      "serviceSlug": service->slug.current,
      "serviceName": service->title
    },
  ${SEO_QUERY}
}`;

/** Slugs for generateStaticParams and the sitemap. */
export const PRACTITIONER_SLUGS_QUERY = groq`
*[_type == "practitioner" && isActive == true && defined(slug.current)].slug.current`;

/**
 * Everywhere the team is listed, a member whose practitioner record has "Show
 * on website" switched off is left out. The two are matched by name, so the
 * name on the Our Team entry and on the practitioner record must agree, and
 * scripts/audit-practitioners.js fails if they drift apart. The same filter
 * sits in the Curate Lifestyle query below, in app/llms.txt/route.ts and in
 * app/api/search/route.ts.
 */
export const OUR_TEAM_PAGE_QUERY = groq`*[_type == "ourTeam" && pageActive == true][0]{
  heroSection{
    heroTitle,
    heroParagraph
  },
  teamMembers[!(name in *[_type == "practitioner" && isActive == false].name)] {
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

/**
 * Not exported, unlike everything else here, because only HOME_PAGE_QUERY
 * assembles it. Worth knowing: that is exactly what made it fragile. It used
 * to sit inside the NEWSLETTER_SECTION_QUERY block, and a pass that removed
 * the dead exports took this with it, because it does not begin with
 * `export`.
 */
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
  "surveySection": ${SURVEY_SECTION_QUERY},
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

/**
 * The blog page's search and share details. CH-105.
 *
 * They sit on blogSection, the homepage's blog section, because /blog has no
 * document of its own. Until a share image is set there, the newest post's
 * photo is used. Ties on the publish date go to the post created last, so
 * the choice does not change between requests.
 */
export const BLOG_PAGE_QUERY = groq`{
  "page": *[_type == "blogSection"][0]{
    ${SEO_QUERY}
  },
  "latestImage": *[_type == "post" && published == true && defined(mainImage.asset)]
    | order(publishedAt desc, _createdAt desc)[0].mainImage{
      crop,
      hotspot,
      alt,
      asset->{
        _id,
        url
      }
    }
}`;

export const GET_POST_BY_SLUG_QUERY = groq`*[_type == "post" && published == true && slug.current == $slug][0] {
  _updatedAt,
  title,
  publishedAt,
  excerpt,
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
      // alt sits on sectionImage, beside image, not inside it. This read
      // image.alt, a field the post schema does not define, so every blog
      // section rendered alt="" and typing alt text into the Studio would
      // have changed nothing. The same projection in CAFE_PAGE_QUERY has
      // always read it correctly. CH-028.
      //
      // Line comments only in here. A /* */ block inside the template
      // literal parses as GROQ rather than as JavaScript and takes the whole
      // query out, which shows up as a missing generated type.
      alt
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
  // One entry per practitioner page, CH-104. Gated on isActive, so
  // switching someone off in the Studio takes their URL out of the sitemap
  // rather than leaving it listed and 404ing.
  "practitioners": *[_type == "practitioner" && isActive == true && defined(slug.current)].slug.current,
  "story": *[_type == "ourStory" && pageActive == true]{_id},
  "missionValues": *[_type == "missionAndValues" && pageActive == true]{_id},
  "sustainability": *[_type == "sustainability" && pageActive == true]{_id},
  "pillarsHealth": *[_type == "pillarsOfHealth" && pageActive == true]{_id},
  "cafe": *[_type == "cafePage" && pageActive == true]{_id},
  // The two Curate Lifestyle pages have routes of their own rather than a
  // slug under /services, so the services list above never included them.
  // Both were live and missing from the sitemap until 2026-09-18.
  "lifestyle": count(*[_type == "serviceLifestyle" && slug.current == "curate-lifestyle"]) > 0,
  "lifestyleProgram": count(*[_type == "serviceLifestyleProgram" && slug.current == "curate-lifestyle-program"]) > 0
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
      teamMembers[!(name in *[_type == "practitioner" && isActive == false].name)] {
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
        },
        alt
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
