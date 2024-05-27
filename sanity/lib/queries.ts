import { groq } from 'next-sanity';

export const POSTS_QUERY = groq`*[_type == "post" && defined(slug)]`;

export const POSTS_SLUG_QUERY = groq`*[_type == "post" && defined(slug.current)][]{
  "params": { "slug": slug.current },
  meta {
    title,
    description
  },
}`;

export const POST_QUERY = groq`*[_type == "post" && slug.current == $slug][0]`;

export const HERO_SECTION_QUERY = `*[_type == "heroSection"][0]{
  videoID,
  heroText
}`;

export const SUSTAINABILITY_SECTION_QUERY = `*[_type == "sustainabilitySection"][0]{
  bgImage {
    asset->{
      _id,
      url
    },
    alt
  },
  sustainText,
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

const CLINIC_QUERY = groq`*[_type == "clinic"][0]{
  "clinicImage": clinicImage.asset->{
    _id,
    url
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
  },
}`;

export const SERVICES_QUERY = groq`*[_type == "service" && isActive == true]{
  title,
  "slug": slug.current,
  "image": image.asset->url,
  "altText": image.alt,
  content
}`;

export const SERVICES_SLUG_QUERY = `*[_type == "service" && isActive == true && defined(slug.current)] {
  "params": {"slug": slug.current}
}`;

export const SERVICE_BY_SLUG_QUERY = groq`
  *[_type == "service" && slug.current == $slug][0]{
    title,
    "slug": slug.current,
    "image": image.asset->url,
    "altText": image.alt,
    content,
    meta {
      title,
      description
    },
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
  description,
  "image": image.asset->url,
  "altText": image.alt
  }
  meta {
    title,
    description
  },
`;

export const NAVIGATION_QUERY = groq`*[_type == "navigation"][0]{
  serviceLinks[]->{
    title,
    "slug": slug.current
  },
  navItems[]{
    linkText,
    href,
    isServiceLinks
  }
}`;

export const TERMS_OF_USE_QUERY = groq`*[_type == "termOfUse"] {
  title,
  content,
  meta {
    title,
    description
  },
}`;

export const PRIVACY_QUERY = groq`*[_type == "privacy"] {
  title,
  content,
  meta {
    title,
    description
  },
}`;

export const ACCESSIBILITY_QUERY = groq`*[_type == "accessibility"] {
  title,
  content,
  meta {
    title,
    description
  },
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
  href,
  content,
  bold,
  meta {
    title,
    description
  },
}`;

export const HOME_PAGE_QUERY = groq`{
  "heroSection": ${HERO_SECTION_QUERY},
  "posts": ${POSTS_QUERY}{
    mainImage,
    title,
    excerpt,
    slug,
    publishedAt,
  },
  "highlightSection": ${HIGHLIGHT_QUERY},
  "clinicSection": ${CLINIC_QUERY},
  "cafeSection": ${CAFE_QUERY},
  "services": ${SERVICES_QUERY},
  "footer": ${FOOTER_QUERY},
  "productsSection": ${PRODUCTS_SECTION_QUERY},
  "products": ${PRODUCTS_QUERY},
  "sustainabilitySection": ${SUSTAINABILITY_SECTION_QUERY},
  "surveyLink": ${SURVEY_LINK_QUERY},
  "navigation": ${NAVIGATION_QUERY},
  "termsOfUse": ${TERMS_OF_USE_QUERY},
  "privacy": ${PRIVACY_QUERY}  ,
  "accessibility": ${ACCESSIBILITY_QUERY} 
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

export const CONTACT_PAGE_QUERY = groq`{
  "contactInfo": ${CONTACT_INFO_QUERY},
  "contactDetails": ${CONTACT_DETAILS_QUERY},
  "footer": ${FOOTER_QUERY},
  "navigation": ${NAVIGATION_QUERY},
  "surveyLink": ${SURVEY_LINK_QUERY}
}`;
