import Link from "next/link";

import { ArrowRightIcon, SearchIcon } from "lucide-react";

import { buildPageMetadata } from "@/lib/page-metadata";

/**
 * The 404 page. CH-112.
 *
 * It used to be a heading, an apology and one link home, on a full-bleed
 * coloured panel with py-96. Someone arriving from a stale link or a
 * mistyped URL had exactly one move, back to the start, and most of them
 * left instead.
 *
 * A 404 is a real entry point on a site whose URLs have moved twice. What it
 * needs is somewhere to go: search, and the hubs that cover everything. The
 * copy says what happened without apologising for it, because "Oops" helps
 * nobody find a physiotherapist.
 *
 * Deliberately not a redirect to the homepage. A soft 404 teaches a crawler
 * that a dead URL is a live page, and Google penalises exactly that.
 */

const HUBS = [
  {
    href: "/services",
    name: "Services",
    detail: "Clinical care, movement and training, and the Recovery Sanctuary",
  },
  {
    href: "/about/our-team",
    name: "Our Team",
    detail: "The practitioners and what each of them treats",
  },
  {
    href: "/products",
    name: "Products",
    detail: "Orthotics, bracing, compression and supplements",
  },
  {
    href: "/our-programs",
    name: "Programs",
    detail:
      "The Essential Series, Curate Lifestyle and Master Health Blueprint",
  },
  { href: "/cafe", name: "Cafe", detail: "The kitchen, and what we cook with" },
  {
    href: "/contact",
    name: "Contact",
    detail: "Hours, directions and how to reach us",
  },
];

export default function NotFound() {
  return (
    <div className="bg-white py-24 text-primary md:py-32">
      <div className="container flex max-w-[70ch] flex-col gap-10">
        <div className="flex flex-col gap-4">
          <p className="font-mono text-sm tracking-widest text-primary/60">
            404
          </p>
          <h1 className="text-3xl font-light md:text-5xl">
            That page is not here
          </h1>
          <p className="text-pretty font-light leading-7">
            The address may have changed, or it may never have existed. Nothing
            is wrong with your connection. Search below, or start from one of
            the sections.
          </p>
        </div>

        {/*
          A real form, not a link to the search page. It submits with the
          Enter key and works with JavaScript disabled, which matters here
          because a 404 is where a crawler and a confused visitor both land.
        */}
        <form
          action="/search"
          method="get"
          role="search"
          className="flex gap-2"
        >
          <label htmlFor="notfound-search" className="sr-only">
            Search the site
          </label>
          <div className="relative flex-1">
            <SearchIcon
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary/50"
            />
            <input
              id="notfound-search"
              name="q"
              type="search"
              placeholder="Search for a service, treatment or practitioner"
              className="w-full border border-primary/25 bg-white py-3 pl-10 pr-3 text-base font-light placeholder:text-primary/45 focus:border-primary focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="border border-primary bg-primary px-6 text-base font-light text-white transition-colors hover:bg-transparent hover:text-primary"
          >
            Search
          </button>
        </form>

        <ul className="grid gap-px border border-secondary bg-secondary sm:grid-cols-2">
          {HUBS.map((hub) => (
            <li key={hub.href} className="bg-white">
              <Link
                href={hub.href}
                className="group flex h-full flex-col gap-2 p-6 transition-colors duration-300 hover:bg-platinum focus-visible:bg-platinum"
              >
                <span className="flex items-center gap-2 text-lg font-medium group-hover:underline">
                  {hub.name}
                  <ArrowRightIcon
                    size={16}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
                <span className="text-pretty text-sm font-light leading-6 text-primary/75">
                  {hub.detail}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * noindex, because a 404 that is indexable competes with the pages that
 * should rank. It carries no canonical: this page has no single address,
 * it answers for every dead one.
 */
export const metadata = buildPageMetadata(null, {
  path: "/404",
  title: "Page not found",
  description:
    "That page is not here. Search Curate Health, or start from services, the team, products, programs or contact.",
  noindex: true,
});
