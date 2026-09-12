import Link from "next/link";

import { buildPageMetadata } from "@/lib/page-metadata";
import { ABOUT_INDEX_QUERYResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import { ABOUT_INDEX_QUERY } from "@/sanity/lib/queries";

/**
 * The about hub. Groundwork for CH-009.
 *
 * /about returned 404 while five pages lived beneath it, so every one of them
 * had a parent that did not exist. Breadcrumbs need somewhere real to point,
 * which is what brought this forward.
 *
 * It is written as a page rather than a grid of links on purpose. Google's
 * quality guidelines look for who is responsible for a site when judging
 * whether to trust it, and weigh that hardest on health, so a hub carrying
 * nothing but navigation earns none of what an about page is worth. The intro
 * is the page; the list underneath is the index.
 */

/**
 * Used until the aboutPage document is filled in, and for any field left empty.
 * Deliberately says something true rather than something generic: a fallback
 * that reads like placeholder text is worse than one that reads like the page.
 */
const FALLBACK = {
  title: "About Curate Health",
  description:
    "Who we are, how we work together, and what we are trying to build at Curate Health in Midtown Toronto.",
};

export default async function AboutPage() {
  const data = await sanityFetch<ABOUT_INDEX_QUERYResult>({
    query: ABOUT_INDEX_QUERY,
  });

  const page = data?.page;

  // A page switched off in Sanity comes back null in the projection, so the
  // hub lists what is live rather than linking somewhere that 404s.
  const children = (data?.children ?? []).filter(Boolean);

  const paragraphs = (page?.intro ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      <section className="bg-white pt-32 md:pt-40">
        <div className="container flex flex-col gap-6">
          <h1 className="text-3xl font-light text-primary md:text-5xl">
            {page?.title?.trim() || FALLBACK.title}
          </h1>
          {paragraphs.length ? (
            <div className="flex max-w-[65ch] flex-col gap-4">
              {paragraphs.map((text) => (
                <p key={text} className="font-light leading-7 text-primary">
                  {text}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="container">
          <ul className="grid gap-px border border-secondary bg-secondary sm:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => (
              <li key={child!.slug} className="bg-white">
                <Link
                  href={`/about/${child!.slug}`}
                  className="group flex h-full flex-col gap-3 p-8 transition-colors duration-300 hover:bg-platinum focus-visible:bg-platinum"
                >
                  <h2 className="text-xl font-medium text-primary group-hover:underline">
                    {child!.title}
                  </h2>
                  {child!.description ? (
                    <p className="text-pretty text-sm font-light leading-6 text-primary">
                      {child!.description}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

export async function generateMetadata() {
  const data = await sanityFetch<ABOUT_INDEX_QUERYResult>({
    query: ABOUT_INDEX_QUERY,
  });

  return buildPageMetadata(data?.page?.seo ?? null, {
    path: "/about",
    title: FALLBACK.title,
    description: FALLBACK.description,
  });
}
