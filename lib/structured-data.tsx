import { BRAND_NAME, BASEURL } from "@/app/site-settings";
import {
  CAFE_PAGE_QUERYResult,
  SERVICE_BY_SLUG_QUERYResult,
  SITE_SETTINGS_QUERYResult,
  TREATMENT_BY_SLUG_QUERYResult,
} from "@/sanity.types";

type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | JsonLdValue[]
  | { [key: string]: JsonLdValue };

type JsonLdObject = { [key: string]: JsonLdValue };

function stripEmpty(value: JsonLdValue): JsonLdValue {
  if (Array.isArray(value)) {
    const next = value
      .map(stripEmpty)
      .filter((item) => item !== undefined && item !== null && item !== "");

    return next.length ? next : undefined;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value)
      .map(([key, item]) => [key, stripEmpty(item)] as const)
      .filter(([, item]) => item !== undefined && item !== null && item !== "");

    return entries.length ? Object.fromEntries(entries) : undefined;
  }

  return value;
}

function absoluteUrl(path: string) {
  if (path.startsWith("http")) {
    return path;
  }

  return `${BASEURL}${path.startsWith("/") ? path : `/${path}`}`;
}

function buildPostalAddress(siteSettings: SITE_SETTINGS_QUERYResult) {
  const address = siteSettings?.contactInfo?.address;

  return stripEmpty({
    "@type": "PostalAddress",
    streetAddress: address?.street,
    addressLocality: address?.city,
    addressRegion: address?.state,
    postalCode: address?.zip,
    addressCountry: address?.country || "CA",
  }) as JsonLdObject | undefined;
}

function getActiveSocialUrls(siteSettings: SITE_SETTINGS_QUERYResult) {
  return (
    siteSettings?.socialMedia
      ?.filter((link) => link.isActive && link.url)
      .map((link) => link.url!) ?? []
  );
}

function getActiveServiceNodes(siteSettings: SITE_SETTINGS_QUERYResult) {
  return (
    siteSettings?.services
      ?.filter((service) => service.isActive && service.title && service.slug)
      .map((service) =>
        stripEmpty({
          "@type": "Service",
          "@id": `${absoluteUrl(`/services/${service.slug}`)}#service`,
          name: service.title,
          url: absoluteUrl(`/services/${service.slug}`),
          provider: { "@id": `${BASEURL}/#medicalclinic` },
          areaServed: {
            "@type": "City",
            name: "Toronto",
          },
          hasOfferCatalog: service.treatments?.length
            ? {
                "@type": "OfferCatalog",
                name: `${service.title} treatments`,
                itemListElement: service.treatments
                  .filter((treatment) => treatment.title && treatment.slug)
                  .map((treatment) => ({
                    "@type": "Offer",
                    itemOffered: {
                      "@type": "Service",
                      name: treatment.title,
                      url: absoluteUrl(
                        `/services/${service.slug}/${treatment.slug}`
                      ),
                    },
                  })),
              }
            : undefined,
        })
      ) ?? []
  );
}

export function buildSiteJsonLd(siteSettings: SITE_SETTINGS_QUERYResult) {
  const brandName = siteSettings?.brandName || BRAND_NAME;
  const contact = siteSettings?.contactInfo;
  const services = getActiveServiceNodes(siteSettings);

  return stripEmpty({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${BASEURL}/#website`,
        name: brandName,
        url: BASEURL,
        publisher: { "@id": `${BASEURL}/#organization` },
        inLanguage: "en-CA",
      },
      {
        "@type": "Organization",
        "@id": `${BASEURL}/#organization`,
        name: brandName,
        url: BASEURL,
        logo: siteSettings?.siteLogo?.asset?.url,
        sameAs: getActiveSocialUrls(siteSettings),
        contactPoint: {
          "@type": "ContactPoint",
          telephone: contact?.phone,
          email: contact?.email,
          contactType: "customer service",
          areaServed: "CA",
          availableLanguage: "English",
        },
      },
      {
        "@type": ["MedicalClinic", "LocalBusiness"],
        "@id": `${BASEURL}/#medicalclinic`,
        name: brandName,
        url: BASEURL,
        image: siteSettings?.siteLogo?.asset?.url,
        telephone: contact?.phone,
        email: contact?.email,
        address: buildPostalAddress(siteSettings),
        hasMap: contact?.mapLink,
        parentOrganization: { "@id": `${BASEURL}/#organization` },
        areaServed: {
          "@type": "City",
          name: "Toronto",
        },
        medicalSpecialty: [
          "Chiropractic",
          "Rehabilitation",
          "Wellness",
          "Preventive Medicine",
        ],
        hasOfferCatalog: services.length
          ? {
              "@type": "OfferCatalog",
              name: `${brandName} services`,
              itemListElement: services.map((service) => ({
                "@type": "Offer",
                itemOffered: service,
              })),
            }
          : undefined,
      },
    ],
  }) as JsonLdObject;
}

export function buildServiceJsonLd(service: SERVICE_BY_SLUG_QUERYResult) {
  if (!service?.title || !service.slug) {
    return null;
  }

  return stripEmpty({
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${absoluteUrl(`/services/${service.slug}`)}#service`,
    name: service.title,
    description: service.seo?.pageDescription,
    image: service.hero_image,
    url: absoluteUrl(`/services/${service.slug}`),
    provider: { "@id": `${BASEURL}/#medicalclinic` },
    areaServed: {
      "@type": "City",
      name: "Toronto",
    },
    hasOfferCatalog: service.treatments?.length
      ? {
          "@type": "OfferCatalog",
          name: `${service.title} treatments`,
          itemListElement: service.treatments
            .filter((treatment) => treatment.title && treatment.slug)
            .map((treatment) => ({
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: treatment.title,
                url: absoluteUrl(`/services/${service.slug}/${treatment.slug}`),
              },
            })),
        }
      : undefined,
  }) as JsonLdObject;
}

export function buildTreatmentJsonLd(
  serviceSlug: string,
  treatment: TREATMENT_BY_SLUG_QUERYResult
) {
  const treatmentSlug = treatment?.treatmentSlug?.current;

  if (!treatment?.title || !treatmentSlug) {
    return null;
  }

  return stripEmpty({
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${absoluteUrl(`/services/${serviceSlug}/${treatmentSlug}`)}#service`,
    name: treatment.title,
    description:
      treatment.seo?.pageDescription ||
      treatment.intro?.introParagraph ||
      treatment.quoteContent,
    image: treatment.heroImage?.asset?.url,
    url: absoluteUrl(`/services/${serviceSlug}/${treatmentSlug}`),
    provider: { "@id": `${BASEURL}/#medicalclinic` },
    serviceType: treatment.serviceName,
    areaServed: {
      "@type": "City",
      name: "Toronto",
    },
  }) as JsonLdObject;
}

export function buildCafeJsonLd(cafePage: CAFE_PAGE_QUERYResult) {
  if (!cafePage) {
    return null;
  }

  const cafe = cafePage as {
    seo?: { pageDescription?: string | null } | null;
    heroSection?: {
      heroImage?: { image?: { asset?: { url?: string | null } | null } | null } | null;
    } | null;
    ctaBandSection?: {
      body?: string | null;
      backgroundImage?: { url?: string | null } | null;
    } | null;
    menuDownloadSection?: { menuFile?: { url?: string | null } | null } | null;
  };

  return stripEmpty({
    "@context": "https://schema.org",
    "@type": ["CafeOrCoffeeShop", "LocalBusiness"],
    "@id": `${BASEURL}/cafe#cafe`,
    name: "Curate Cafe",
    description: cafe.seo?.pageDescription || cafe.ctaBandSection?.body,
    image:
      cafe.heroSection?.heroImage?.image?.asset?.url ||
      cafe.ctaBandSection?.backgroundImage?.url,
    url: `${BASEURL}/cafe`,
    parentOrganization: { "@id": `${BASEURL}/#organization` },
    menu: cafe.menuDownloadSection?.menuFile?.url,
    areaServed: {
      "@type": "City",
      name: "Toronto",
    },
  }) as JsonLdObject;
}

export function JsonLdScript({
  data,
  id,
}: {
  data: JsonLdObject | null;
  id: string;
}) {
  if (!data) {
    return null;
  }

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
