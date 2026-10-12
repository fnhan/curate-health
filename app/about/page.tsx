import Image from "next/image";
import Link from "next/link";

import SectionHero from "@/components/shared/section-hero";
import { SectionNavigation } from "@/components/shared/section-navigation";
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
      {/*
        Built from the two shared section components rather than from a copy,
        per the section rule set on 2026-09-20. /about was the last section
        opening on a bare white band while every other one opened on a
        photograph.
      */}
      <SectionHero
        image={page?.heroImage?.url ?? ""}
        alt={page?.heroImage?.alt ?? ""}
        title={page?.title?.trim() || FALLBACK.title}
        subtitle={paragraphs[0] ?? null}
        imageClassName="grayscale"
      />
      <SectionNavigation
        label="About"
        labelHref="/about"
        ariaLabel="About"
        items={children.map((child) => ({
          title: child!.title,
          href: `/about/${child!.slug}`,
        }))}
      />

      {/*
        The intro is the reason this page exists, so it keeps its own band
        rather than being reduced to the hero's standing line. Google weighs
        who is responsible for a site hardest on health, and a hub carrying
        only navigation earns none of that. The hero shows the first paragraph;
        the rest are here.
      */}
      {/* The hero already shows paragraphs[0] as its standing line. */}
      {paragraphs.length > 1 ? (
        <section className="bg-white py-16 md:py-24">
          <div className="container flex max-w-[70ch] flex-col gap-4">
            {paragraphs.slice(1).map((text) => (
              <p key={text} className="font-light leading-7 text-primary">
                {text}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      {/*
        The same grid /services uses: a photograph per child, grayscale until
        hovered. A child with no hero falls back to the hub's own image rather
        than leaving a hole in the grid.
      */}
      <section className="bg-white">
        <div className="grid gap-1 bg-white pb-28 lg:container sm:grid-cols-2 md:pb-36 lg:grid-cols-3 lg:pb-[200px]">
          {children.map((child) => (
            <Link
              key={child!.slug}
              href={`/about/${child!.slug}`}
              className="group relative grayscale transition-all duration-300 hover:grayscale-0 focus:grayscale-0"
            >
              <Image
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="h-72 w-full object-cover md:h-96 lg:h-[512px]"
                src={child!.image ?? page?.heroImage?.url ?? ""}
                alt={child!.imageAlt ?? ""}
                width={380}
                height={512}
              />
              <div className="absolute inset-0 flex flex-col justify-end gap-2 bg-gradient-to-t from-primary/80 to-transparent p-8">
                <h2 className="text-xl font-light text-white group-hover:underline">
                  {child!.title}
                </h2>
                {child!.description ? (
                  <p className="max-w-[40ch] text-pretty text-sm font-light leading-6 text-white/90">
                    {child!.description}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
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
