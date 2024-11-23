import { groq } from 'next-sanity';

export const POSTS_QUERY = groq`*[_type == "post" && defined(slug)]`;

export const POSTS_SLUG_QUERY = groq`*[_type == "post" && defined(slug.current)][]{
  "params": { "slug": slug.current },
}`;

export const POST_QUERY = groq`*[_type == "post" && slug.current == $slug][0]`;

export const SUSTAINABILITY_SECTION_QUERY = `*[_type == "sustainabilitySection"][0]{
  bgImage {
    asset->{
      _id,
      url
    },
    alt
  },
  sustainText
}`;

const HIGHLIGHT_QUERY = groq`*[_type == "highlight"][0]{
  title1,
  title2,
  "highlightImage": {
    "asset": highlightImage.asset->{
      _id,
      url
    },
    "alt": highlightImage.alt
  },
  hoverLinkText,
  hoverLinkHref
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

export const OURSERVICES_QUERY = groq`*[_type == "ourServices"][0]{
  title,
  "image": image.asset->url,
  content
}`;

export const SERVICES_QUERY = groq`*[_type == "service" && isActive == true]{
  title,
  "slug": slug.current,
  "image": image.asset->url,
  "altText": image.alt,
  content
}`;

export const SERVICES_SLUG_QUERY = groq`*[_type == "service" && isActive == true && defined(slug.current)] {
  "params": {"slug": slug.current}
}`;

export const SERVICE_BY_SLUG_QUERY = groq`
  *[_type == "service" && slug.current == $slug][0]{
    title,
    "slug": slug.current,
    "image": image.asset->url,
    "hero_image": hero_image.asset->url,
    "altText": image.alt,
    meta {
    title,
    description
  },
    content,
    "treatments": *[_type == "treatment" && references(^._id)]{
      _id,
      title,
      "slug": treatmentSlug.current
    }
  }
`;

export const TREATMENTS_QUERY = groq`*[_type == "treatment" && isActive == true]{
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

export const METADATAS_QUERY = groq`*[_type == "metadatas"]{
  datas
}`;

export const METADATASone_QUERY = groq`*[_type == "metadatas"][0]{
  datas
}`;

export const MetaData_Slug = groq`*[_type == "metadatas" && defined(slug.current) ][0]{
  "params": {"slug": slug.current}
}`;

export const METADATA_BY_SLUG_QUERY = groq`
  *[_type == "metadatas"]{
    "meta":datas[slug.current == $slug][0]{
      title,
      description
    } 
  }[0]
`;

export const ANOTHERMETADATA_BY_SLUG_QUERY = groq`
  *[_type == "metadatas" && datas[slug.current == $slug][0]]{
      title,
      description
    } 
  
`;

export const TREATMENTS_SLUG_QUERY = groq`*[_type == "treatment" && isActive == true && defined(treatmentSlug.current)]{
  "slug": service->slug.current,
  "treatmentSlug": treatmentSlug.current
}`;

export const TREATMENT_BY_SLUG_QUERY = groq`
  *[_type == "treatment" && treatmentSlug.current == $treatmentSlug][0]{
    title,
    "treatmentSlug": treatmentSlug.current,
    service->{
      title,
      slug
    },
    "aboveImage": aboveImage.asset->url,
    "altText": image.alt,
    heroSubtitle,
    heroContent,
    quoteContent,
    leftSubtitle,
    leftContent,
    "rightImage": rightImage.asset->url,
    rightSubtitle,
    rightContent,
    "leftImage": leftImage.asset->url,
    greenTitle,
    greenContent,
    writtenTitle,
    writtenContent,
    "writtenImage": writtenImage.asset->url,
    writtenBracketContent,
    framesTitle,
    frames[]{
      title,
      content,
    meta {
      title,
      description
    }
    }
  }
`;

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
  hoverLinkText,
  hoverLinkHref
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

export const SURVEY_LINK_QUERY = groq`*[_type == "surveyLink"][0]{
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

export const CONTACT_INFO_QUERY = groq`*[_type == "contactInfo"][0]{
  streetAddress,
  postalAddress,
  emailAddress,
  phoneNumber,
  "contactInfoImage": {
    "asset": contactInfoImage.asset->{
      _id,
      url
    },
    "alt": contactInfoImage.alt
  },
  meta {
    title,
    description
  },
  hrefDirections
}`;

export const CONTACT_DETAILS_QUERY = groq`*[_type == "contactDetails"][0]{
  title,
  monHours,
  tuesHours,
  wedHours,
  thursHours,
  friHours,
  satHours,
  sunHours,
  mapURL,
  cta,
  href
}`;

export const FEEDBACK_LINK_QUERY = groq`*[_type == "feedbackLink"][0]{
  linkText,
  youformId
}`;

export const CONTACT_PAGE_QUERY = groq`{
  "contactInfo": ${CONTACT_INFO_QUERY},
  "contactDetails": ${CONTACT_DETAILS_QUERY},
  "footer": ${FOOTER_QUERY},
  "navigation": ${NAVIGATION_QUERY},
  "surveyLink": ${SURVEY_LINK_QUERY},
  "feedbackLink": ${FEEDBACK_LINK_QUERY}
}`;

export const ABOUT_PAGES_QUERY = groq`*[_type == "aboutPage" && isActive == true] | order(_createdAt desc){
  title,
  "slug": slug.current,
}`;

export const OUR_STORY_QUERY = groq`*[_type == "ourStory"][0]{
  headerTitle,
  headerSubtitle,
  sectionOneTextContent,
  sectionOneTitle,
  sectionTwoTextContent,
  sectionThreeTextContent,
  sectionThreeTitle,
  sectionFiveTextContent,
  sectionFiveTitle,
  sectionSixTextContent,
  sectionSixTitle,
  sectionSevenCta,
  ctaUrl,
  sectionSevenTextContent,
  sectionSevenTitle,
    "quotationMark": {
    "asset": quotationMark.asset->{
      _id,
      url
    },
    "alt": quotationMark.alt
  },
  "headerBgImage": {
    "asset": headerBgImage.asset->{
      _id,
      url
    },
    "alt": headerBgImage.alt
  },
    "sectionSevenBgImage": {
    "asset": sectionSevenBgImage.asset->{
      _id,
      url
    },
    "alt": sectionSevenBgImage.alt
  },
    "sectionFiveImage": {
    "asset": sectionFiveImage.asset->{
      _id,
      url
    },
    "alt": sectionFiveImage.alt
  },
      "sectionSixImage": {
    "asset": sectionSixImage.asset->{
      _id,
      url
    },
    "alt": sectionSixImage.alt
  },
      "sectionFourImage": {
    "asset": sectionFourImage.asset->{
      _id,
      url
    },
    "alt": sectionFourImage.alt
  },
      "sectionThreeImage": {
    "asset": sectionThreeImage.asset->{
      _id,
      url
    },
    "alt": sectionThreeImage.alt
  },
      "sectionTwoImage": {
    "asset": sectionTwoImage.asset->{
      _id,
      url
    },
    "alt": sectionTwoImage.alt
  },
      "sectionOneImage": {
    "asset": sectionOneImage.asset->{
      _id,
      url
    },
    "alt": sectionOneImage.alt
  },
}`;

export const OUR_STORY_PAGE_QUERY = groq`{
  "aboutPages": ${ABOUT_PAGES_QUERY},
  "footer": ${FOOTER_QUERY},
  "navigation": ${NAVIGATION_QUERY},
  "surveyLink": ${SURVEY_LINK_QUERY},
  "ourStory": ${OUR_STORY_QUERY}
}`;

export const MISSION_AND_VALUES_QUERY = groq`*[_type == "missionAndValues"][0]{
  purposeTextContent,
  purposeTitle,
  missionTitle,
  missionTextContent,
  visionTitle,
  visionTextContent,
  "headerImage": {
    "asset": headerImage.asset->{
      _id,
      url
    },
    "alt": headerImage.alt
  },
    "purposeImage": {
    "asset": purposeImage.asset->{
      _id,
      url
    },
    "alt": purposeImage.alt
  },
    "missionImage": {
    "asset": missionImage.asset->{
      _id,
      url
    },
    "alt": missionImage.alt
  },
      "visionImage": {
    "asset": visionImage.asset->{
      _id,
      url
    },
    "alt": visionImage.alt
  },

}`;

export const MISSION_AND_VALUES_PAGE_QUERY = groq`{
  "aboutPages": ${ABOUT_PAGES_QUERY},
  "footer": ${FOOTER_QUERY},
  "navigation": ${NAVIGATION_QUERY},
  "surveyLink": ${SURVEY_LINK_QUERY},
  "missionAndValues": ${MISSION_AND_VALUES_QUERY}
}`;

export const SUSTAINABILITY_QUERY = groq`*[_type == "sustainability"][0]{
  headerTitle,
  headerTitleDesktop,
  headerTextContent,
  sectionOneTitle,
  sectionOneTextContent,
  sectionTwoTitle,
  sectionTwoTextContent,
  sectionThreeTitle,
  sectionThreeTextContent,
  sectionFourTitle,
  sectionFourTextContent,
  sectionFiveTitle,
  sectionFiveTextContent,
  sectionSixTitle,
  sectionSixTextContent,
  sectionSixSubtitleOne,
  sectionSixSubtitleOneText,
  sectionSixSubtitleTwo,
  sectionSixSubtitleTwoText,
  sectionSixSubtitleThree,
  sectionSixSubtitleThreeText,
  sectionSevenTitle,
  sectionSevenTextContent,
  sectionSevenCta,
  ctaUrl,
  sectionSevenEsg,
  "esgLink": esgLink.asset->url,
  "headerImage": {
    "asset": headerImage.asset->{
      _id,
      url
    },
    "alt": headerImage.alt
  },
      "sectionFourImage": {
    "asset": sectionFourImage.asset->{
      _id,
      url
    },
    "alt": sectionFourImage.alt
  },
        "sectionThreeImage": {
    "asset": sectionThreeImage.asset->{
      _id,
      url
    },
    "alt": sectionThreeImage.alt
  },
      "sectionTwoImage": {
    "asset": sectionTwoImage.asset->{
      _id,
      url
    },
    "alt": sectionTwoImage.alt
  },
      "sectionOneImage": {
    "asset": sectionOneImage.asset->{
      _id,
      url
    },
    "alt": sectionOneImage.alt
  },
        "sectionFiveImage": {
    "asset": sectionFiveImage.asset->{
      _id,
      url
    },
    "alt": sectionFiveImage.alt
  },
        "sectionSixImage": {
    "asset": sectionSixImage.asset->{
      _id,
      url
    },
    "alt": sectionSixImage.alt
  },
        "sectionSevenBgImage": {
    "asset": sectionSevenBgImage.asset->{
      _id,
      url
    },
    "alt": sectionSevenBgImage.alt
  },

}`;

export const SUSTAINABILITY_PAGE_QUERY = groq`{
  "aboutPages": ${ABOUT_PAGES_QUERY},
  "footer": ${FOOTER_QUERY},
  "navigation": ${NAVIGATION_QUERY},
  "surveyLink": ${SURVEY_LINK_QUERY},
  "sustainability": ${SUSTAINABILITY_QUERY}
}`;

export const PILLARS_OF_HEALTH_QUERY = groq`*[_type == "pillarsOfHealth"][0]{
  pageTitle,
  pageSubtitle,
  mentalHealthTitle,
  mentalHealthTextContent,
  emotionalHealthTitle,
  emotionalHealthTextContent,
  socialHealthTitle,
  socialHealthTextContent,
  spiritualHealthTitle,
  spiritualHealthTextContent,
  physicalHealthTitle,
  physicalHealthTextContent,
    "headerBgImage": {
    "asset": headerBgImage.asset->{
      _id,
      url
    },
    "alt": headerBgImage.alt
  },
  }`;

export const PILLARS_OF_HEALTH_PAGE_QUERY = groq`{
    "aboutPages": ${ABOUT_PAGES_QUERY},
    "footer": ${FOOTER_QUERY},
    "navigation": ${NAVIGATION_QUERY},
    "surveyLink": ${SURVEY_LINK_QUERY},
    "pillarsOfHealth": ${PILLARS_OF_HEALTH_QUERY}
  }`;

// * Settings, Layout & Page Queries

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
    mobile{
      asset->{
        _id,
        url
      }
    },
    desktop{
      asset->{
        _id,
        url
      }
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
    }
  },
  navLinks[]{
    _key,
    title,
    slug {
      current
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

export const HERO_SECTION_QUERY = groq`*[_type == "heroSection"][0]{
  videoID,
  heroText,
}`;

export const LAYOUT_QUERY = groq`{
  "siteSettings": ${SITE_SETTINGS_QUERY},
  "navLinks": ${NAVIGATION_QUERY},
  "footer": ${FOOTER_QUERY},
  "primaryCTAButton": ${PRIMARY_CTA_BUTTON_QUERY},
}`;

export const HOME_PAGE_QUERY = groq`{
  "layout": ${LAYOUT_QUERY},
  "heroSection": ${HERO_SECTION_QUERY},
  "primaryCTAButton": ${PRIMARY_CTA_BUTTON_QUERY},
  "posts": ${POSTS_QUERY}{
    mainImage,
    title,
    excerpt,
    slug,
    publishedAt
  },
  "highlightSection": ${HIGHLIGHT_QUERY},
  "aboutSection": ${ABOUT_SECTION_QUERY},
  "clinicSection": ${CLINIC_SECTION_QUERY},
  "cafeSection": ${CAFE_QUERY},
  "services": ${SERVICES_QUERY},
  "footer": ${FOOTER_QUERY},
  "productsSection": ${PRODUCTS_SECTION_QUERY},
  "products": ${PRODUCTS_QUERY},
  "sustainabilitySection": ${SUSTAINABILITY_SECTION_QUERY},
  "surveyLink": ${SURVEY_LINK_QUERY},
  "navigation": ${NAVIGATION_QUERY},
  "termsOfUse": ${TERMS_OF_USE_QUERY},
  "privacy": ${PRIVACY_QUERY},
  "accessibility": ${ACCESSIBILITY_QUERY},
  "popup": ${POPUP_CONTENT_QUERY},
}`;
