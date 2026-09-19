import { BASEURL } from "@/app/site-settings";
import { servicePath, treatmentPath } from "@/lib/service-urls";

/**
 * IndexNow, CH-114.
 *
 * Tells Bing that a page has changed, so it fetches the page again within
 * minutes instead of on its own schedule, which for a small site can be
 * weeks. Bing's index is the one ChatGPT search and Copilot answer from. The
 * same submission reaches the other engines that share IndexNow, Yandex and
 * Seznam among them. Google does not take part and is unaffected.
 *
 * Called from app/api/revalidate, the Sanity webhook, so a publish in the
 * Studio is what triggers it. scripts/indexnow-submit.js sends every page in
 * the sitemap at once, for after a change that touches the whole site.
 *
 * THE KEY
 *
 * IndexNow accepts a submission only if the site serves the same key at the
 * address given as keyLocation. It is public/{key}.txt, so it ships with every
 * deployment. It is public by design: all it proves is that whoever submits
 * controls the site's files, and a submission can only name this site's own
 * pages. To change it, add the new file and change this constant in the same
 * commit, then remove the old file.
 */
export const INDEXNOW_KEY = "4a160620565829dc8bb7833ab29d32cb";
export const INDEXNOW_KEY_LOCATION = `${BASEURL}/${INDEXNOW_KEY}.txt`;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

/**
 * What the webhook fetches about a published document to find its pages. The
 * webhook itself only carries the id and type, and the slug lives on the
 * document.
 */
export const DOCUMENT_PATHS_QUERY = `*[_id == $id][0]{
  _type,
  "slug": coalesce(slug.current, treatmentSlug.current),
  "serviceSlug": service->slug.current
}`;

export type DocumentForPaths = {
  _type: string;
  slug?: string | null;
  serviceSlug?: string | null;
} | null;

/** The homepage sections, each its own document in the Studio. */
const HOMEPAGE_SECTIONS = new Set([
  "heroSection",
  "primaryCTAButton",
  "aboutSection",
  "clinic",
  "productsSection",
  "servicesSection",
  "ourProgramsSection",
  "cafeSection",
  "sustainabilitySection",
]);

/**
 * The pages a published document appears on, as site paths.
 *
 * Its own page first, then the hub that lists it, since a hub changes when the
 * title or photo on one of its cards does.
 *
 * A type with no page of its own returns nothing. The site settings are the
 * main case: they change every page at once, and telling Bing that the whole
 * site changed each time the phone number is edited is the kind of submission
 * IndexNow asks sites not to make. Those pages refresh on the usual 60 second
 * cycle, and Bing finds them on its own crawl.
 *
 * A new page type needs a line here, or its publishes go unannounced. Nothing
 * breaks if one is missed, which is why the webhook logs the type it skipped.
 */
export function pathsForDocument(doc: DocumentForPaths): string[] {
  if (!doc) return [];

  const slug = doc.slug?.trim();

  if (HOMEPAGE_SECTIONS.has(doc._type)) return ["/"];

  switch (doc._type) {
    case "blogSection":
      // The homepage's blog section, and the blog page's search details.
      return ["/", "/blog"];
    case "post":
      return slug ? [`/blog/${slug}`, "/blog"] : ["/blog"];
    case "aboutIndexPage":
      return ["/about"];
    case "ourStory":
      return ["/about/our-story"];
    case "ourTeam":
      return ["/about/our-team"];
    case "missionAndValues":
      return ["/about/mission-and-values"];
    case "pillarsOfHealth":
      return ["/about/pillars-of-health"];
    case "sustainability":
      return ["/about/sustainability"];
    case "practitioner":
      return slug
        ? [`/about/our-team/${slug}`, "/about/our-team"]
        : ["/about/our-team"];
    case "servicesHeroSection":
      return ["/services"];
    case "service":
      return slug ? [servicePath(slug), "/services"] : ["/services"];
    case "treatments":
      return slug
        ? [treatmentPath(doc.serviceSlug, slug), servicePath(doc.serviceSlug)]
        : [];
    case "serviceLifestyle":
      return ["/services/curate-lifestyle"];
    case "serviceLifestyleProgram":
      return ["/services/curate-lifestyle-program"];
    case "ourPrograms":
      return ["/our-programs"];
    case "productsPage":
      return ["/products"];
    case "product":
      return slug ? [`/products/${slug}`, "/products"] : ["/products"];
    case "cafePage":
      return ["/cafe"];
    case "contactPage":
      return ["/contact"];
    case "legalPage":
      return slug ? [`/legal/${slug}`] : [];
    default:
      return [];
  }
}

/** A site path as the full address the sitemap and canonical tags use. */
export function absoluteUrl(path: string) {
  return path === "/" ? BASEURL : `${BASEURL}${path}`;
}

/**
 * Sends the addresses to IndexNow and returns the HTTP status.
 *
 * 200 means accepted. 202 means accepted while the key is still being
 * checked, which is normal for the first submissions after the key file goes
 * live. 403 means the key file could not be read or did not match, 422 that
 * an address is not on this site, and 429 that we sent too many too quickly.
 *
 * Five seconds at most, because the Sanity webhook waits on this.
 */
export async function submitToIndexNow(paths: string[]) {
  const urlList = Array.from(new Set(paths)).map(absoluteUrl);

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(BASEURL).host,
      key: INDEXNOW_KEY,
      keyLocation: INDEXNOW_KEY_LOCATION,
      urlList,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });

  return { status: response.status, urlList };
}
