import Link from "next/link";
import { groq } from "next-sanity";

import { sanityFetch } from "@/sanity/lib/client";

type IndexDoc = Record<string, unknown> & {
  _type?: string;
  title?: string;
  name?: string;
  slugCurrent?: string;
  treatmentSlugCurrent?: string;
  serviceSlugCurrent?: string;
  isActive?: boolean;
  pageActive?: boolean;
  published?: boolean;
};

const INDEX_DOCS_QUERY = groq`
*[
  _type in [
    "heroSection",
    "aboutSection",
    "clinic",
    "productsSection",
    "servicesSection",
    "cafeSection",
    "blogSection",
    "sustainabilitySection",
    "post",
    "product",
    "service",
    "treatments",
    "serviceLifestyle",
    "serviceLifestyleProgram",
    "ourStory",
    "ourTeam",
    "missionAndValues",
    "sustainability",
    "pillarsOfHealth",
    "cafePage",
    "contactPage",
    "ourPrograms",
    "servicesHeroSection",
    "legalPage"
  ]
]{
  ...,
  "slugCurrent": slug.current,
  "treatmentSlugCurrent": treatmentSlug.current,
  "serviceSlugCurrent": service->slug.current
}
`;

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function collectStringsDeep(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") {
    const cleaned = value.trim();
    if (cleaned) out.push(cleaned);
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStringsDeep(item, out);
    return out;
  }
  if (value && typeof value === "object") {
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      if (key.startsWith("_")) continue;
      collectStringsDeep(v, out);
    }
  }
  return out;
}

function buildHrefForDoc(doc: IndexDoc): string | null {
  switch (doc._type) {
    case "heroSection":
    case "aboutSection":
    case "clinic":
    case "productsSection":
    case "servicesSection":
    case "cafeSection":
    case "blogSection":
    case "sustainabilitySection":
      return "/";
    case "post":
      return doc.slugCurrent ? `/blog/${doc.slugCurrent}` : null;
    case "product":
      return doc.slugCurrent ? `/products/${doc.slugCurrent}` : null;
    case "service":
      return doc.slugCurrent ? `/services/${doc.slugCurrent}` : null;
    case "treatments":
      return doc.serviceSlugCurrent && doc.treatmentSlugCurrent
        ? `/services/${doc.serviceSlugCurrent}/${doc.treatmentSlugCurrent}`
        : null;
    case "serviceLifestyle":
    case "serviceLifestyleProgram":
      return doc.slugCurrent ? `/services/${doc.slugCurrent}` : null;
    case "ourStory":
      return "/about/our-story";
    case "ourTeam":
      return "/about/our-team";
    case "missionAndValues":
      return "/about/mission-and-values";
    case "sustainability":
      return "/about/sustainability";
    case "pillarsOfHealth":
      return "/about/pillars-of-health";
    case "cafePage":
      return "/cafe";
    case "contactPage":
      return "/contact";
    case "ourPrograms":
      return "/our-programs";
    case "servicesHeroSection":
      return "/services";
    case "legalPage":
      return doc.slugCurrent ? `/legal/${doc.slugCurrent}` : null;
    default:
      return null;
  }
}

function buildTitleForDoc(doc: IndexDoc): string {
  if (typeof doc.title === "string" && doc.title.trim()) return doc.title;
  if (typeof doc.name === "string" && doc.name.trim()) return doc.name;
  switch (doc._type) {
    case "heroSection":
    case "aboutSection":
    case "clinic":
    case "productsSection":
    case "servicesSection":
    case "cafeSection":
    case "blogSection":
    case "sustainabilitySection":
      return "Home";
    case "ourStory":
      return "Our Story";
    case "ourTeam":
      return "Our Team";
    case "missionAndValues":
      return "Mission and Values";
    case "sustainability":
      return "Sustainability";
    case "pillarsOfHealth":
      return "Pillars of Health";
    case "cafePage":
      return "Cafe";
    case "contactPage":
      return "Contact";
    case "ourPrograms":
      return "Our Programs";
    case "servicesHeroSection":
      return "Services";
    default:
      return "Untitled";
  }
}

type SearchHit = {
  href: string;
  title: string;
  snippet: string | null;
  type: "product" | "service" | "treatment" | "blog" | "page";
};

function buildSnippet(haystack: string, needle: string): string | null {
  const idx = haystack.toLowerCase().indexOf(needle.toLowerCase());
  if (idx === -1) return null;
  const start = Math.max(0, idx - 80);
  const end = Math.min(haystack.length, idx + needle.length + 140);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < haystack.length ? "…" : "";
  return `${prefix}${haystack.slice(start, end)}${suffix}`;
}

function highlightExact(text: string, needle: string) {
  if (!needle.trim()) return text;
  const idx = text.toLowerCase().indexOf(needle.toLowerCase());
  if (idx === -1) return text;

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + needle.length);
  const after = text.slice(idx + needle.length);

  return (
    <>
      {before}
      <mark className="bg-yellow-200 px-0.5 text-black">{match}</mark>
      {after}
    </>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = collapseWhitespace(searchParams.q ?? "");
  const needle = q;

  if (!needle) {
    return (
      <main className="bg-white py-14 text-black">
        <div className="container">
          <h1 className="text-3xl">Search</h1>
          <p className="mt-4 text-black/70">Enter a search query.</p>
        </div>
      </main>
    );
  }

  const docs = await sanityFetch<IndexDoc[]>({
    query: INDEX_DOCS_QUERY,
    revalidate: 300,
    tags: ["search-index"],
  });

  const hits: SearchHit[] = (docs ?? [])
    .filter((doc) => doc && doc._type)
    .filter((doc) => doc.isActive !== false)
    .filter((doc) => doc.pageActive !== false)
    .filter((doc) => doc.published !== false)
    .map((doc) => {
      const href = buildHrefForDoc(doc);
      if (!href) return null;
      const textParts = collectStringsDeep(doc);
      const haystack = collapseWhitespace(textParts.join(" "));
      if (!haystack.toLowerCase().includes(needle.toLowerCase())) return null;

      const type: SearchHit["type"] =
        doc._type === "product"
          ? "product"
          : doc._type === "service"
            ? "service"
            : doc._type === "treatments"
              ? "treatment"
              : doc._type === "post"
                ? "blog"
                : "page";

      return {
        href,
        title: buildTitleForDoc(doc),
        snippet: buildSnippet(haystack, needle),
        type,
      } satisfies SearchHit;
    })
    .filter(Boolean) as SearchHit[];

  // Dedup by href (keep first)
  const unique = Array.from(new Map(hits.map((h) => [h.href, h])).values());

  const order: SearchHit["type"][] = [
    "product",
    "service",
    "treatment",
    "blog",
    "page",
  ];

  const labels: Record<SearchHit["type"], string> = {
    product: "Products",
    service: "Services",
    treatment: "Treatments",
    blog: "Blog",
    page: "Pages",
  };

  const grouped = order
    .map((t) => ({
      type: t,
      label: labels[t],
      hits: unique
        .filter((h) => h.type === t)
        .sort((a, b) => a.title.localeCompare(b.title)),
    }))
    .filter((g) => g.hits.length > 0);

  return (
    <main className="bg-white py-14 text-black">
      <div className="container">
        <h1 className="text-3xl">Search</h1>
        <p className="mt-2 text-black/70">
          Results for <span className="font-medium text-black">{q}</span> (
          {unique.length})
        </p>

        {unique.length === 0 ? (
          <div className="mt-10 text-black/70">No results.</div>
        ) : (
          <div className="mt-10 space-y-10">
            {grouped.map((group) => (
              <section key={group.type}>
                <div className="mb-4 flex items-baseline justify-between border-b border-black/10 pb-3">
                  <h2 className="text-lg font-medium">{group.label}</h2>
                  <span className="text-sm text-black/60">
                    {group.hits.length}
                  </span>
                </div>
                <div className="flex flex-col gap-6">
                  {group.hits.map((hit) => (
                    <div key={hit.href} className="border-b border-black/10 pb-6">
                      <Link href={hit.href} className="text-xl hover:underline">
                        {highlightExact(hit.title, needle)}
                      </Link>
                      <div className="mt-2 text-sm text-black/60">
                        {hit.href}
                      </div>
                      {hit.snippet ? (
                        <div className="mt-3 text-sm text-black/80">
                          {highlightExact(hit.snippet, needle)}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

