import { BASEURL, BRAND_NAME } from "@/app/site-settings";
import type { Crumb } from "@/lib/breadcrumbs";
import { treatmentPath } from "@/lib/service-urls";
import {
  CAFE_PAGE_QUERYResult,
  PRACTITIONER_BY_SLUG_QUERYResult,
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

/**
 * The profiles belonging to one business, for its sameAs. CH-008.
 *
 * sameAs is how a search engine confirms that a profile and a business are the
 * same entity, so the array has to describe one entity and not the group. The
 * footer renders every link regardless; only this split cares which is which.
 *
 * Entries with no entity set count as the clinic, which is what every profile
 * stored before this field existed is.
 */
function getActiveSocialUrls(
  siteSettings: SITE_SETTINGS_QUERYResult,
  entity: "clinic" | "cafe" = "clinic"
) {
  return (
    siteSettings?.socialMedia
      ?.filter(
        (link) =>
          link.isActive && link.url && (link.entity ?? "clinic") === entity
      )
      .map((link) => link.url!) ?? []
  );
}

/**
 * The Google Business Profile, for the clinic's sameAs. CH-008.
 *
 * In code rather than in Sanity because it is an identity claim rather than
 * editorial copy, and because it would otherwise appear in the footer's Connect
 * list next to the address, which already links to the same listing.
 *
 * The number is the CID of the business entity, taken from the place id
 * recorded in the CH-025 notes, 0x882b33a0bc00ca61:0x432786dbaf32d810, whose
 * second half converts to this decimal. That matters because there are two
 * place ids for this address and the other one is a bare address pin. Opened in
 * a browser on 2026-09-12 and confirmed to load "Curate Health" at 989
 * Eglinton, rather than trusted from the arithmetic.
 */
const GOOGLE_BUSINESS_PROFILE =
  "https://maps.google.com/?cid=4838984602728192016";

/**
 * The cafe's own Google listing, confirmed to exist by Frank on 2026-09-12.
 *
 * This is the strongest signal that the cafe is a business in its own right and
 * not a page on the clinic's site, and it is worth more than the Instagram
 * split on its own: a correct sameAs on a thin entity is still thin. Its place
 * id, 0x882b3331c51bdd03:0xbc4f43925e7428c, is genuinely distinct from the
 * clinic's, so Google already holds them apart.
 *
 * Derived from the share link Frank sent, then opened in a browser and
 * confirmed to load "Curate Cafe" at 989 Eglinton.
 */
const CAFE_GOOGLE_BUSINESS_PROFILE =
  "https://maps.google.com/?cid=848071156138721932";

/** Keys are what Sanity stores, values are what schema.org expects. */
const DAY_NAMES: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

/**
 * "9:00 AM - 6:00 PM" into the 24 hour opens and closes schema.org wants.
 *
 * Returns undefined rather than guessing when the string is not in that shape.
 * Publishing the wrong opening hours sends somebody to a closed door, so a
 * missing specification is the better failure.
 */
function parseHourRange(range: string | null | undefined) {
  const match = range
    ?.trim()
    .match(/^(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!match) return undefined;

  const to24 = (hour: string, minute: string, meridiem: string) => {
    let h = Number(hour) % 12;
    if (meridiem.toUpperCase() === "PM") h += 12;
    return `${String(h).padStart(2, "0")}:${minute}`;
  };

  return {
    opens: to24(match[1], match[2], match[3]),
    closes: to24(match[4], match[5], match[6]),
  };
}

/**
 * openingHoursSpecification, built from what the contact page actually shows.
 *
 * Same source as the visible hours table, deliberately. Hours that disagree
 * with the page they sit on are worse than no hours at all, and Google shows
 * these in the knowledge panel and in Maps where nobody cross-checks them.
 *
 * A day carrying an exception with hours uses those. A day in daysOpen with no
 * exception uses the standard range.
 *
 * EVERY DAY IS STATED, INCLUDING THE CLOSED ONES
 *
 * A day left out of the specification says nothing about itself, and nothing
 * cannot be told apart from "we forgot to mention it". schema.org has a way to
 * say closed, opens and closes both at 00:00, so the closed days say it.
 *
 * Which days those are comes from daysOpen, whose meaning is exactly that: a
 * day absent from Days Open is a day the clinic is not open. Deriving it rather
 * than storing a second list means the two can never disagree.
 *
 * Worth knowing what this does and does not buy. Google fills the hours in the
 * knowledge panel and in Maps from the Google Business Profile, not from a
 * page, so this changes little there. It matters to everything that reads the
 * page directly, which is the surface CH-032 cares about.
 */
function buildOpeningHours(siteSettings: SITE_SETTINGS_QUERYResult) {
  const hours = siteSettings?.businessHours;
  if (!hours) return undefined;

  const standard =
    hours.standardHours === "custom"
      ? hours.customStandardHours
      : hours.standardHours;

  const exceptions = new Map(
    (hours.exceptions ?? [])
      .filter((e) => e.day)
      .map((e) => [e.day!.toLowerCase(), e.hours])
  );

  // Every day named anywhere counts as open, so a day that exists only as an
  // exception is still published. Sunday was exactly that case.
  const open = new Set([
    ...(hours.daysOpen ?? []).map((d) => d.toLowerCase()),
    ...exceptions.keys(),
  ]);

  // Nothing to say at all is better than asserting seven closed days, which is
  // what an empty daysOpen would otherwise produce.
  if (!open.size) return undefined;

  const specs = Object.entries(DAY_NAMES)
    .map(([day, name]) => {
      if (!open.has(day)) {
        return {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: `https://schema.org/${name}`,
          opens: "00:00",
          closes: "00:00",
        };
      }

      const range = exceptions.has(day)
        ? (exceptions.get(day) ?? standard)
        : standard;
      const parsed = parseHourRange(range);

      // An open day whose hours will not parse is left out rather than
      // published wrong, and is deliberately not reported as closed: sending
      // somebody to a closed door is the failure this guards against.
      if (!parsed) return undefined;

      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${name}`,
        opens: parsed.opens,
        closes: parsed.closes,
      };
    })
    .filter(Boolean);

  return specs.length ? (specs as JsonLdObject[]) : undefined;
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
                        treatmentPath(service.slug, treatment.slug)
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
        sameAs: [
          ...getActiveSocialUrls(siteSettings, "clinic"),
          GOOGLE_BUSINESS_PROFILE,
        ],
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
        /**
         * The clinic's own coordinates, CH-008.
         *
         * Taken from the Google place entity the map link resolves to, not
         * from a geocode of the address string. There are two place ids for
         * this address, a business entity and a bare address pin about 30 m
         * apart, and the CH-025 notes record which is which. These are the
         * business one.
         */
        geo: {
          "@type": "GeoCoordinates",
          latitude: 43.6997,
          longitude: -79.4306,
        },
        openingHoursSpecification: buildOpeningHours(siteSettings),
        sameAs: [
          ...getActiveSocialUrls(siteSettings, "clinic"),
          GOOGLE_BUSINESS_PROFILE,
        ],
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
                url: absoluteUrl(treatmentPath(service.slug, treatment.slug)),
              },
            })),
        }
      : undefined,
  }) as JsonLdObject;
}

/**
 * The canonical URL comes from the treatment itself, via treatmentPath, rather
 * than from a service slug the caller happens to have. The caller no longer
 * knows the category: treatments are served from /services/{treatment} and
 * only Recovery Sanctuary children stay nested.
 */
export function buildTreatmentJsonLd(treatment: TREATMENT_BY_SLUG_QUERYResult) {
  const treatmentSlug = treatment?.treatmentSlug?.current;

  if (!treatment?.title || !treatmentSlug) {
    return null;
  }

  const path = treatmentPath(treatment.serviceSlug, treatmentSlug);

  return stripEmpty({
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${absoluteUrl(path)}#service`,
    name: treatment.title,
    description:
      treatment.seo?.pageDescription ||
      treatment.intro?.introParagraph ||
      treatment.quoteContent,
    image: treatment.heroImage?.asset?.url,
    url: absoluteUrl(path),
    provider: { "@id": `${BASEURL}/#medicalclinic` },
    serviceType: treatment.serviceName,
    areaServed: {
      "@type": "City",
      name: "Toronto",
    },
  }) as JsonLdObject;
}

export function buildCafeJsonLd(
  cafePage: CAFE_PAGE_QUERYResult,
  siteSettings?: SITE_SETTINGS_QUERYResult
) {
  if (!cafePage) {
    return null;
  }

  const cafe = cafePage as {
    seo?: { pageDescription?: string | null } | null;
    heroSection?: {
      heroImage?: {
        image?: { asset?: { url?: string | null } | null } | null;
      } | null;
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
    // The cafe shares the clinic's address, so it gets the same one rather
    // than a second copy of it. Without an address a LocalBusiness cannot be
    // placed, which is most of what the type is for.
    address: siteSettings ? buildPostalAddress(siteSettings) : undefined,
    /**
     * Same building as the clinic, so the same coordinates, but read off the
     * cafe's own Google place rather than copied across: 43.6997418,
     * -79.4306373, rounded to the precision the clinic entity uses.
     */
    geo: {
      "@type": "GeoCoordinates",
      latitude: 43.6997,
      longitude: -79.4306,
    },
    /**
     * The clinic's hours, on purpose, and not a copy of them.
     *
     * These were taken out for one round, on the reasoning that handing the
     * cafe the clinic's hours asserts something nobody had confirmed. Frank
     * confirmed it on 2026-09-12: the cafe keeps the clinic's hours, and when
     * the clinic's change the cafe's should change with them.
     *
     * So it reads the same function rather than a second field. A field of its
     * own would let the two drift the moment somebody edited one, which is the
     * failure CH-025 spent a whole ticket undoing for the address. If the cafe
     * ever keeps its own hours, that is the point to give it its own field, and
     * to update its Google listing in the same change.
     */
    openingHoursSpecification: siteSettings
      ? buildOpeningHours(siteSettings)
      : undefined,
    /**
     * The clinic's number, for the same reason and on the same terms. The cafe
     * has no line of its own, and a LocalBusiness with no telephone is weaker
     * than one with. Read from the same place the footer and the clinic entity
     * read it, so there is one phone number in the dataset.
     */
    telephone: siteSettings?.contactInfo?.phone,
    // The cafe's own profiles, not the clinic's. Attaching the clinic's here
    // would tell Google the two businesses are one account.
    sameAs: siteSettings
      ? [
          ...getActiveSocialUrls(siteSettings, "cafe"),
          CAFE_GOOGLE_BUSINESS_PROFILE,
        ]
      : [CAFE_GOOGLE_BUSINESS_PROFILE],
    servesCuisine: "Functional nutrition",
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

/**
 * Product schema, CH-010.
 *
 * NO OFFER, NO PRICE, DELIBERATELY
 *
 * schema.org lets a Product carry an Offer with a price and availability, and
 * Google's product rich results want one. These do not get one, for two
 * reasons that both matter here.
 *
 * Pricing is out of scope on this project by decision: it lives in Jane behind
 * the Book Now button and there is no pricing page. Publishing a price in
 * markup would put a number on the site that nothing on the site can show, and
 * a stale price in structured data is worse than no price.
 *
 * These are also not things somebody adds to a basket. An orthotic is cast to a
 * foot and a brace is fitted, so the honest markup is a product that exists and
 * is described, not one that is for sale at a number.
 *
 * They still earn their place: this is what feeds Google Business Profile's
 * products field, which the agency manages, and it gives each page an entity
 * rather than leaving it as unlabelled prose.
 */
type ProductLike = {
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  image?: string | null;
  altText?: string | null;
};

function buildProductNode(product: ProductLike) {
  if (!product.slug || !product.title) return undefined;

  const url = absoluteUrl(`/products/${product.slug}`);

  return stripEmpty({
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.title,
    description: product.description,
    image: product.image,
    url,
    // The clinic is the brand here rather than a manufacturer. These are
    // supplied and fitted by Curate, which is what a visitor is choosing.
    brand: { "@id": `${BASEURL}/#organization` },
    category: "Medical device",
  }) as JsonLdObject | undefined;
}

/** One Product, for a single product page. */
export function buildProductJsonLd(product: ProductLike | null | undefined) {
  if (!product) return null;

  const node = buildProductNode(product);
  if (!node) return null;

  return stripEmpty({
    "@context": "https://schema.org",
    ...node,
  }) as JsonLdObject;
}

/**
 * The index, as an ItemList rather than a bag of Products.
 *
 * ItemList is what says "this page lists those pages", which is the job the
 * index does. Declaring five full Product entities here instead would put the
 * same entity on two URLs and leave a crawler to decide which one is canonical,
 * so the items reference the product pages rather than restating them.
 */
export function buildProductsIndexJsonLd(products: ProductLike[] | null) {
  const items = (products ?? [])
    .filter((p) => p.slug && p.title)
    .map((p, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: p.title,
      url: absoluteUrl(`/products/${p.slug}`),
    }));

  if (!items.length) return null;

  return stripEmpty({
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${BASEURL}/products#list`,
    name: "Products",
    numberOfItems: items.length,
    itemListElement: items,
  }) as JsonLdObject;
}

/**
 * BreadcrumbList, from the same crumbs the page renders. CH-009.
 *
 * Takes the Crumb[] that <Breadcrumbs> displays rather than rebuilding a trail
 * from the path, so the markup cannot describe a hierarchy the page does not
 * show. Google checks for exactly that.
 *
 * The last item carries a name and no item URL, which is the shape Google
 * documents for the page being viewed. Every earlier item must have one: an
 * intermediate ListItem without a URL is the case that risks the trail being
 * dropped from the result entirely, which is why lib/breadcrumbs.ts leaves a
 * level out rather than emitting one it cannot link.
 *
 * Fewer than two items produces nothing. A BreadcrumbList holding only Home
 * states no position.
 */
export function buildBreadcrumbJsonLd(crumbs: Crumb[] | null | undefined) {
  if (!crumbs || crumbs.length < 2) return null;

  const itemListElement = crumbs.map((crumb, index) => {
    const isLast = index === crumbs.length - 1;

    return stripEmpty({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: isLast || !crumb.path ? undefined : absoluteUrl(crumb.path),
    });
  });

  // A gap in the middle would publish a trail Google may refuse to show, so
  // say nothing rather than say it badly.
  const missingUrl = itemListElement
    .slice(0, -1)
    .some((item) => !(item as JsonLdObject).item);

  if (missingUrl) return null;

  return stripEmpty({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  }) as JsonLdObject;
}

/**
 * A practitioner, as Person or Physician. CH-104.
 *
 * WHICH TYPE, AND WHY IT IS NOT A GUESS FROM THE JOB TITLE
 *
 * schema.org Physician is a MedicalOrganization subtype meaning a medical
 * practice, not "someone with a doctorate". Using it for a chiropractor or a
 * naturopath would describe them as a clinic. Person with hasCredential and
 * an explicit knowsAbout is both accurate and what Google reads for author
 * and expertise signals, so everyone gets Person, and the credentials carry
 * the distinction rather than the type name.
 *
 * worksFor points at the clinic node the site graph already publishes, which
 * is what ties the person to the business rather than leaving them floating.
 */
export function buildPractitionerJsonLd(
  person: PRACTITIONER_BY_SLUG_QUERYResult
) {
  if (!person?.name || !person.slug) return null;

  const url = absoluteUrl(`/about/our-team/${person.slug}`);

  const credentials = (person.credentials ?? []).map((credential) => ({
    "@type": "EducationalOccupationalCredential",
    name: credential,
  }));

  return stripEmpty({
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${url}#person`,
    name: person.name,
    url,
    image: person.photo?.url,
    // The first credential is the one a person searching would recognise.
    jobTitle: person.credentials?.[0],
    hasCredential: credentials.length ? credentials : undefined,
    knowsLanguage: person.languages?.length ? person.languages : undefined,
    // Empty until a practitioner signs off on what they treat, and left out
    // rather than filled from their bio.
    knowsAbout: person.commonlyTreats?.length
      ? person.commonlyTreats
      : undefined,
    worksFor: { "@id": `${BASEURL}/#medicalclinic` },
  }) as JsonLdObject;
}
