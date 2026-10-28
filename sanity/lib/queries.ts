/**
 * Whether /classes has anything on it. CH-107.
 *
 * ONE STRING, READ BY FIVE PLACES, BECAUSE THEY MUST AGREE.
 *
 * The route 404s on it, the sitemap omits the URL, llms.txt omits the line,
 * the band on /services/recovery-sanctuary is not rendered, and the Classes
 * entry is dropped from the menu. Five copies of this condition would
 * eventually disagree and leave something linking at a page that is not
 * there, which is exactly what this is here to prevent.
 *
 * `isActive != false` rather than `== true`: an entry written before the
 * switch existed has no such field, and should keep showing.
 */
const CLASSES_LIVE = groq`count(*[_type == "classSchedule" && count(classes[isActive != false]) > 0]) > 0`;

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
        alt,
        asset-> {
          _id,
          url,
          alt
        }
      },
      twitterImage{
        crop,
        hotspot,
        alt,
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
    // The image object beside its url, so the crop and hotspot set in
    // the Studio reach SanityImage. Dormant until one is set.
    "hero_imageSource": hero_image{asset, crop, hotspot},
    "hero_alt": hero_image.alt,
    }`;

export const SERVICES_PAGE_QUERY = groq`*[_type == "servicesHeroSection"][0]{
  "heroSection": {
    title,
    "image": image.asset->url,
    // The image object beside its url, so the crop and hotspot set in
    // the Studio reach SanityImage. Dormant until one is set.
    "imageSource": image{asset, crop, hotspot},
    "alt": image.alt,
    subtitle
  },
  intro,
  "seo": ${SEO_QUERY},
  "services": ${ALL_SERVICES_QUERY},
  }`;

export const SERVICES_SECTION_QUERY = groq`*[_type == "servicesSection"][0]{
  sectionTitle,
  hoverLinkText,
  hoverLinkHref,
  "services": *[_type == "service" && isActive == true]{
    title,
    barColor,
    "slug": slug.current,
    "hero_image": hero_image.asset->url,
    // The image object beside its url, so the crop and hotspot set in
    // the Studio reach SanityImage. Dormant until one is set.
    "hero_imageSource": hero_image{asset, crop, hotspot},
    "hero_alt": hero_image.alt
  }
}`;

export const SERVICE_BY_SLUG_QUERY = groq`
  *[_type == "service" && slug.current == $slug][0]{
    title,
    "slug": slug.current,
    "hero_image": hero_image.asset->url,
    // The image object beside its url, so the crop and hotspot set in
    // the Studio reach SanityImage. Dormant until one is set.
    "hero_imageSource": hero_image{asset, crop, hotspot},
    "hero_alt": hero_image.alt,
    "content_image": content_image.asset->url,
    // The image object beside its url, so the crop and hotspot set in
    // the Studio reach SanityImage. Dormant until one is set.
    "content_imageSource": content_image{asset, crop, hotspot},
    "content_alt": content_image.alt,
    content,
    "treatments": *[_type == "treatments" && service._ref == ^._id && isActive == true] | order(coalesce(displayOrder, 9999) asc, title asc){
      _id,
      title,
      "slug": treatmentSlug.current,
      "rawSlug": treatmentSlug
    },
    // Whether /classes has anything on it, CH-107. The band into the schedule
    // is only rendered when it does, which is the same gate the route 404s on
    // and the sitemap and llms.txt use, so none of the four can disagree and
    // this page can never link at a schedule that is not there.
    "classScheduleActive": ${CLASSES_LIVE},
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
    // The image object beside its url, so a crop or hotspot set in the
    // Studio reaches SanityImage. Until 2026-10-25 this slot was the one
    // place on a treatment page where framing an image in the Studio did
    // nothing at all, because the hero rendered through plain next/image.
    "source": @{asset, crop, hotspot},
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
      // The image object beside its url, so the crop and hotspot set in
      // the Studio reach SanityImage. Dormant until one is set.
      "imageSource": image{asset, crop, hotspot},
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
  // Ordered by Display Order, which Frank set on 2026-10-19. Anything left
  // unset falls to the end alphabetically, so a new product appears last
  // rather than in the middle of a deliberate order.
  "products": *[_type == "product" && isActive == true] | order(coalesce(displayOrder, 9999) asc, title asc){
    title,
    description,
    "slug": slug.current,
    "image": image.asset->url,
    // The image object beside its url, so the crop and hotspot set in
    // the Studio reach SanityImage. Dormant until one is set.
    "imageSource": image{asset, crop, hotspot},
    "altText": image.alt
  }
}`;

export const PRODUCTS_QUERY = groq`*[_type == "product" && isActive == true] | order(coalesce(displayOrder, 9999) asc, title asc) {
  title,
  indepthblockinfo,
  description,
  "slug" : slug.current,
  "banner": banner.asset->url,
  // The image object beside its url, so the crop and hotspot set in
  // the Studio reach SanityImage. Dormant until one is set.
  "bannerSource": banner{asset, crop, hotspot},
  "image": image.asset->url,
  // The image object beside its url, so the crop and hotspot set in
  // the Studio reach SanityImage. Dormant until one is set.
  "imageSource": image{asset, crop, hotspot},
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
    heroImage{
      "url": asset->url,
      // The image object itself, so a crop set in the Studio frames it.
      "source": @{asset, crop, hotspot},
      alt
    },
    ${SEO_QUERY}
  },
  "children": [
    *[_type == "ourStory" && pageActive == true][0]{
      "title": "Our Story",
      "slug": "our-story",
      "description": seo.pageDescription,
      "image": heroSection.heroImage.image.asset->url,
      // The image object beside its url, so the crop and hotspot set in
      // the Studio reach SanityImage. Dormant until one is set.
      "imageSource": heroSection.heroImage.image{asset, crop, hotspot},
      "imageAlt": heroSection.heroImage.alt
    },
    *[_type == "ourTeam" && pageActive == true][0]{
      "title": "Our Team",
      "slug": "our-team",
      "description": seo.pageDescription,
      "image": heroSection.heroImage.image.asset->url,
      // The image object beside its url, so the crop and hotspot set in
      // the Studio reach SanityImage. Dormant until one is set.
      "imageSource": heroSection.heroImage.image{asset, crop, hotspot},
      "imageAlt": heroSection.heroImage.alt
    },
    *[_type == "missionAndValues" && pageActive == true][0]{
      "title": "Mission and Values",
      "slug": "mission-and-values",
      "description": seo.pageDescription,
      "image": heroSection.heroImage.image.asset->url,
      // The image object beside its url, so the crop and hotspot set in
      // the Studio reach SanityImage. Dormant until one is set.
      "imageSource": heroSection.heroImage.image{asset, crop, hotspot},
      "imageAlt": heroSection.heroImage.alt
    },
    *[_type == "pillarsOfHealth" && pageActive == true][0]{
      "title": "Pillars of Health",
      "slug": "pillars-of-health",
      "description": seo.pageDescription,
      "image": heroSection.heroImage.image.asset->url,
      // The image object beside its url, so the crop and hotspot set in
      // the Studio reach SanityImage. Dormant until one is set.
      "imageSource": heroSection.heroImage.image{asset, crop, hotspot},
      "imageAlt": heroSection.heroImage.alt
    },
    *[_type == "sustainability" && pageActive == true][0]{
      "title": "Sustainability",
      "slug": "sustainability",
      "description": seo.pageDescription,
      "image": heroSection.heroImage.image.asset->url,
      // The image object beside its url, so the crop and hotspot set in
      // the Studio reach SanityImage. Dormant until one is set.
      "imageSource": heroSection.heroImage.image{asset, crop, hotspot},
      "imageAlt": heroSection.heroImage.alt
    },
    *[_type == "bcorpPage" && pageActive == true][0]{
      "title": "B Corp Certification",
      "slug": "b-corp",
      "description": seo.pageDescription,
      "image": heroSection.heroImage.image.asset->url,
      // The image object beside its url, so the crop and hotspot set in
      // the Studio reach SanityImage. Dormant until one is set.
      "imageSource": heroSection.heroImage.image{asset, crop, hotspot},
      "imageAlt": heroSection.heroImage.alt
    }
  ]
}`;

export const PRODUCTS_PAGE_QUERY = groq`*[_type == "productsPage"][0]{
  title,
  intro,
  heroImage{
    "url": asset->url,
    // The image object itself, so a crop set in the Studio frames it.
    "source": @{asset, crop, hotspot},
    alt
  },
  ${SEO_QUERY}
}`;

/** The three legal pages, for the second menu they share. */
export const LEGAL_PAGES_NAV_QUERY = groq`*[_type == "legalPage" && defined(slug.current)] | order(title asc){
  title,
  "slug": slug.current
}`;

export const PRODUCTS_NAVIGATION_QUERY = groq`*[_type == "product" && isActive == true] | order(coalesce(displayOrder, 9999) asc, title asc) {
  title,
  "slug": slug.current,
}`;

export const PRODUCT_BY_SLUG_QUERY = groq`*[_type == "product" && slug.current == $slug && isActive == true][0] {
  title,
  slug,
  description,
  image {
    asset->,
    crop,
    hotspot,
    alt
  },
  banner {
    asset->,
    crop,
    hotspot,
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
      // The image object beside its url, so the crop and hotspot set in
      // the Studio reach SanityImage. Dormant until one is set.
      "imageSource": image{asset, crop, hotspot},
      alt
    },
    heroTitle,
    heroSubtitle
  },
  quoteSection{
    quoteImage{
      "image": image.asset->url,
      // The image object beside its url, so the crop and hotspot set in
      // the Studio reach SanityImage. Dormant until one is set.
      "imageSource": image{asset, crop, hotspot},
      alt
    },
    quoteText
  },
  additionalSections[]{
    sectionTitle,
    sectionParagraph,
    sectionImage{
      "image": image.asset->url,
      // The image object beside its url, so the crop and hotspot set in
      // the Studio reach SanityImage. Dormant until one is set.
      "imageSource": image{asset, crop, hotspot},
      alt
    }
  },
  ctaSection{
    ctaSectionImage{
      "image": image.asset->url,
      // The image object beside its url, so the crop and hotspot set in
      // the Studio reach SanityImage. Dormant until one is set.
      "imageSource": image{asset, crop, hotspot},
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
       asset->,
       crop,
       hotspot,
     },
     alt
   }
 },
 additionalSections[]{
    sectionTitle,
    sectionParagraph,
    sectionImage{
      "image": image.asset->url,
      // The image object beside its url, so the crop and hotspot set in
      // the Studio reach SanityImage. Dormant until one is set.
      "imageSource": image{asset, crop, hotspot},
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

/**
 * About | Our B Corp Certification. CH-119.
 *
 * Gated on pageActive like every other page under /about, so the route, the
 * sitemap, llms.txt and the About menu all read the one switch and cannot
 * disagree with each other.
 */
export const BCORP_PAGE_QUERY = groq`*[_type == "bcorpPage" && pageActive == true][0] {
  heroSection {
    heroTitle,
    heroParagraph,
    heroImage {
      "image": image.asset->url,
      // The image object beside its url, so the crop and hotspot set in
      // the Studio reach SanityImage. Dormant until one is set.
      "imageSource": image{asset, crop, hotspot},
      alt
    }
  },
  score {
    heading,
    intro,
    overall,
    threshold,
    median,
    certifiedSince,
    directoryUrl,
    areas[] {
      _key,
      name,
      value,
      note
    }
  },
  additionalSections[] {
    _key,
    sectionTitle,
    sectionParagraph,
    sectionImage {
      "image": image.asset->url,
      // The image object beside its url, so the crop and hotspot set in
      // the Studio reach SanityImage. Dormant until one is set.
      "imageSource": image{asset, crop, hotspot},
      alt
    }
  },
  ctaSection {
    ctaSectionImage {
      "image": image.asset->url,
      // The image object beside its url, so the crop and hotspot set in
      // the Studio reach SanityImage. Dormant until one is set.
      "imageSource": image{asset, crop, hotspot},
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

export const SUSTAINABILITY_QUERY = groq`*[_type == "sustainability" && pageActive == true][0] {
  heroSection {
    heroTitle,
    heroParagraph,
    heroImage {
      "image": image.asset->url,
      // The image object beside its url, so the crop and hotspot set in
      // the Studio reach SanityImage. Dormant until one is set.
      "imageSource": image{asset, crop, hotspot},
      alt
    }
  },
  additionalSections[] {
    _key,
    sectionTitle,
    sectionParagraph,
    sectionImage {
      "image": image.asset->url,
      // The image object beside its url, so the crop and hotspot set in
      // the Studio reach SanityImage. Dormant until one is set.
      "imageSource": image{asset, crop, hotspot},
      alt
    }
  },
  ctaSection {
    ctaSectionImage {
      "image": image.asset->url,
      // The image object beside its url, so the crop and hotspot set in
      // the Studio reach SanityImage. Dormant until one is set.
      "imageSource": image{asset, crop, hotspot},
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
      // The image object beside its url, so the crop and hotspot set in
      // the Studio reach SanityImage. Dormant until one is set.
      "imageSource": image{asset, crop, hotspot},
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
    // The same shape SEO_QUERY uses, so the homepage's card is built from the
    // same fields as every other page's. It selected the asset alone until
    // 2026-10-28, which meant the homepage read the alt off the ASSET
    // DOCUMENT rather than the one written against this picture, so it
    // published no og:image:alt at all, and it dropped the crop and hotspot
    // with it. That is the CH-013 trap in the one query that was not fixed
    // when the rest were.
    socialMeta {
      title,
      description,
      ogImage {
        crop,
        hotspot,
        alt,
        asset -> {
          _id,
          url,
          alt
        }
      },
      twitterImage {
        crop,
        hotspot,
        alt,
        asset -> {
          _id,
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
    *[_type == "pillarsOfHealth" && pageActive == true][0]{
      "title": "Pillars of Health",
      "slug": "pillars-of-health"
    },
    *[_type == "sustainability" && pageActive == true][0]{
      "title": "Sustainability",
      "slug": "sustainability"
    },
    *[_type == "bcorpPage" && pageActive == true][0]{
      "title": "B Corp Certification",
      "slug": "b-corp"
    },

  ],
  navLinks[]{
    _key,
    title,
    href
  },
  // Whether /classes has anything on it, CH-107, so the menu can drop its
  // Classes entry rather than pointing at a page that 404s. Same condition
  // the route, the sitemap, llms.txt and the band on the Recovery Sanctuary
  // all use.
  //
  // Reported here and applied in components/shared/site-navigation.tsx,
  // rather than filtering navLinks in this projection. A filter holding a
  // subquery is legal GROQ that sanity typegen cannot type: it drops this
  // whole query and LAYOUT_QUERY with it, and every import of
  // SITE_SETTINGS_QUERY_RESULT then fails to compile.
  //
  // GROQ takes // comments only. A /* */ block here silently breaks the
  // whole query, which is how this was found.
  "classScheduleActive": ${CLASSES_LIVE},
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
    "alt": bgImage.alt,
    // The crop and the hotspot. This projection built its own bgImage object
    // and selected neither, so the Studio's framing never reached the page and
    // dragging the marker did nothing. Frank asked on 2026-10-19 to move this
    // photograph so the text sits over the wall rather than the plant on a
    // narrow screen.
    //
    // GROQ takes line comments and not block ones, and this whole query is a
    // backtick template, so a backtick in a comment ends the string early.
    // Both mistakes were made here and both break HOME_PAGE_QUERY rather than
    // only this one, which would have taken the homepage down.
    // sanity typegen generate is what catches them.
    "crop": bgImage.crop,
    "hotspot": bgImage.hotspot
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
        // The image object beside its url, so the crop and hotspot set in
        // the Studio reach SanityImage. Dormant until one is set.
        "imageSource": image{asset, crop, hotspot},
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
      // The image object beside its url, so the crop and hotspot set in
      // the Studio reach SanityImage. Dormant until one is set.
      "imageSource": image{asset, crop, hotspot},
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
    crop,
    hotspot,
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
    // The image object beside its url, so the crop and hotspot set in
    // the Studio reach SanityImage. Dormant until one is set.
    "imageSource": mainImage{asset, crop, hotspot},
    "alt": mainImage.alt
  },
  sections[] {
    sectionTitle,
    sectionParagraph,
    sectionImage {
      "image": image.asset->url,
      // The image object beside its url, so the crop and hotspot set in
      // the Studio reach SanityImage. Dormant until one is set.
      "imageSource": image{asset, crop, hotspot},
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
       asset->,
       crop,
       hotspot,
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
     // The image object beside its url, so the crop and hotspot set in
     // the Studio reach SanityImage. Dormant until one is set.
     "imageSource": image{asset, crop, hotspot},
     alt
   },
   quoteText
 },
 additionalSections[]{
    sectionTitle,
    sectionParagraph,
    sectionImage{
      "image": image.asset->url,
      // The image object beside its url, so the crop and hotspot set in
      // the Studio reach SanityImage. Dormant until one is set.
      "imageSource": image{asset, crop, hotspot},
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

/**
 * The cafe menu as text, CH-108.
 *
 * The hero falls back to the cafe page's own photograph, so the page always
 * opens on one and nobody has to remember to choose it, per the every-page
 * rule. Both shapes are projected the same way so the page can treat them
 * alike.
 */
export const CAFE_MENU_QUERY = groq`*[_type == "cafeMenu"][0]{
  title,
  intro,
  note,
  heroImage{
    "url": asset->url,
    // The image object itself, so a crop set in the Studio frames it.
    "source": @{asset, crop, hotspot},
    alt
  },
  sections[]{
    _key,
    title,
    note,
    footnote,
    items[]{
      _key,
      name,
      size,
      price,
      ingredients
    }
  },
  "cafeHeroImage": *[_type == "cafePage" && pageActive == true][0].heroSection.heroImage{
    "url": image.asset->url,
    "source": image{asset, crop, hotspot},
    alt
  },
  ${SEO_QUERY}
}`;

/**
 * The class schedule, CH-107.
 *
 * Each class takes its name from the treatment page it points at, so the
 * schedule cannot call a class something other than its own page does. Its
 * photograph and its summary fall through to that page as well, and either
 * can be overridden on the entry here.
 *
 * Three gates, all asking the dataset rather than being told:
 *
 * - `treatmentActive` is false when the class's page is switched off, or its
 *   category is. The class still shows, as a name rather than a link, which
 *   is the same reasoning as a practitioner with no Jane url getting the note
 *   instead of a button: better than a link into a 404.
 * - `instructor` is null when that practitioner is switched off, so the
 *   schedule can never name somebody the rest of the site has taken down.
 *   `select` returns null when the condition fails, which is what the page
 *   and the markup both read as "nobody named".
 * - `bookingUrl` falls back to the treatment's own Jane link, so the common
 *   case needs nothing typed here.
 */
export const CLASS_SCHEDULE_QUERY = groq`*[_type == "classSchedule"][0]{
  title,
  intro,
  note,
  heroImage{
    "url": asset->url,
    // The image object itself, so a crop set in the Studio frames it.
    "source": @{asset, crop, hotspot},
    alt
  },
  // A class switched off in the Studio is gone from here, so the page, the
  // markup, the sitemap, llms.txt, site search and the menu all stop naming
  // it at once. It tests != false rather than == true, so an entry written
  // before the switch existed still shows rather than vanishing.
  classes[isActive != false]{
    _key,
    dayOfWeek,
    startTime,
    durationMinutes,
    capacity,
    price,
    note,
    "name": coalesce(treatment->title, name),
    // The entry's own summary wins, so the line on this page can be edited
    // without touching the treatment page's meta description. Empty, it
    // falls through to that page's own words rather than to nothing.
    "summary": coalesce(
      summary,
      treatment->seo.pageDescription,
      treatment->intro.introParagraph
    ),
    "treatmentSlug": treatment->treatmentSlug.current,
    "serviceSlug": treatment->service->slug.current,
    "treatmentActive": treatment->isActive == true && treatment->service->isActive == true,
    // Two photographs rather than one chosen here. The entry's own wins and
    // the treatment page's is the fallback, which is also the only way a
    // class without a page can have a picture at all.
    //
    // The choice is made in the page, not in this projection. A GROQ
    // select() returning two different object shapes is legal and
    // sanity typegen cannot type it: it drops the whole query, and every
    // import of CLASS_SCHEDULE_QUERY_RESULT then fails to compile. A
    // coalesce() is no good either, because an image field an editor opened
    // and left empty is still a non-null object and would shadow the
    // fallback.
    "image": image{
      "url": asset->url,
      "source": @{asset, crop, hotspot},
      alt
    },
    "treatmentImage": treatment->heroImage{
      "url": asset->url,
      "source": @{asset, crop, hotspot},
      "alt": heroAlt
    },
    "bookingUrl": coalesce(bookingUrl, treatment->janeBookingUrl),
    "instructor": select(
      instructor->isActive == true => instructor->{
        name,
        credentials,
        "slug": slug.current
      }
    )
  },
  // The Recovery Sanctuary's own photograph, so this page always has a hero
  // even before anybody picks one for it. Every class runs in that space.
  "sanctuaryHeroImage": *[_type == "service" && slug.current == "recovery-sanctuary"][0].hero_image{
    "url": asset->url,
    "source": @{asset, crop, hotspot},
    alt
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
  "bcorp": *[_type == "bcorpPage" && pageActive == true]{_id},
  "pillarsHealth": *[_type == "pillarsOfHealth" && pageActive == true]{_id},
  "cafe": *[_type == "cafePage" && pageActive == true]{_id},
  // /cafe/menu, CH-108. Gated on the document having items, so an empty
  // menu is never listed: the route 404s in that state and a sitemap
  // entry would point at it.
  "cafeMenu": count(*[_type == "cafeMenu" && count(sections[defined(items) && count(items) > 0]) > 0]) > 0,
  // /classes, CH-107. The same gate the route 404s on, so the sitemap never
  // lists a schedule page with nothing on it.
  "classSchedule": ${CLASSES_LIVE},
  // The two Curate Lifestyle pages have routes of their own rather than a
  // slug under /services, so the services list above never included them.
  // Both were live and missing from the sitemap until 2026-09-18.
  "lifestyle": count(*[_type == "serviceLifestyle" && slug.current == "curate-lifestyle"]) > 0,
  "lifestyleProgram": count(*[_type == "serviceLifestyleProgram" && slug.current == "curate-lifestyle-program" && isActive == true]) > 0
}`;

export const LEGAL_PAGE_BY_SLUG_QUERY = groq`*[_type == "legalPage" && slug.current == $slug][0]{
  title,
  body,
  ${SEO_QUERY}
}`;

export const SERVICE_LIFESTYLE_BY_SLUG_QUERY = groq`
  *[_type == "serviceLifestyle" && slug.current == $slug][0]{
  // Whether the programme page is switched on, so the button to it is not
  // rendered pointing at a 404. This page is the only thing that links there.
  "programActive": count(*[_type == "serviceLifestyleProgram" && slug.current == "curate-lifestyle-program" && isActive == true]) > 0,
    title,
    "slug": slug.current,
    "hero_image": hero_image.asset->url,
    // The image object beside its url, so the crop and hotspot set in
    // the Studio reach SanityImage. Dormant until one is set.
    "hero_imageSource": hero_image{asset, crop, hotspot},
    "hero_alt": hero_image.alt,
    "content_image": content_image.asset->url,
    // The image object beside its url, so the crop and hotspot set in
    // the Studio reach SanityImage. Dormant until one is set.
    "content_imageSource": content_image{asset, crop, hotspot},
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
    // The image object beside its url, so the crop and hotspot set in
    // the Studio reach SanityImage. Dormant until one is set.
    "block_4_imageSource": block_4_image{asset, crop, hotspot},
    "block_5_image": block_5_image.asset->url,
    // The image object beside its url, so the crop and hotspot set in
    // the Studio reach SanityImage. Dormant until one is set.
    "block_5_imageSource": block_5_image{asset, crop, hotspot},
    benefits[] {
      title,
      description,
      "image": image.asset->url,
      // The image object beside its url, so the crop and hotspot set in
      // the Studio reach SanityImage. Dormant until one is set.
      "imageSource": image{asset, crop, hotspot},
      tint_percentage,
      tint_percentage_hover
    },
    "block_7_image": block_7_image.asset->url,
    // The image object beside its url, so the crop and hotspot set in
    // the Studio reach SanityImage. Dormant until one is set.
    "block_7_imageSource": block_7_image{asset, crop, hotspot},
    "block_9_image": block_9_image.asset->url,
    // The image object beside its url, so the crop and hotspot set in
    // the Studio reach SanityImage. Dormant until one is set.
    "block_9_imageSource": block_9_image{asset, crop, hotspot},
    timeline[] {
      title,
      description
    },
    "block_11_image": block_11_image.asset->url,
    // The image object beside its url, so the crop and hotspot set in
    // the Studio reach SanityImage. Dormant until one is set.
    "block_11_imageSource": block_11_image{asset, crop, hotspot},
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
  // isActive, so the Show on website switch decides whether this page exists,
  // as it does for a service, a treatment, a product and a practitioner. It
  // was switched off in January and the page stayed live because nothing read
  // the switch; Frank settled it on 2026-10-19 by asking for the page off.
  *[_type == "serviceLifestyleProgram" && slug.current == $slug && isActive == true][0]{
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
      // The image object beside its url, so the crop and hotspot set in
      // the Studio reach SanityImage. Dormant until one is set.
      "imageSource": image{asset, crop, hotspot},
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
    // The image object beside its url, so the crop and hotspot set in
    // the Studio reach SanityImage. Dormant until one is set.
    "imageSource": image{asset, crop, hotspot},
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
