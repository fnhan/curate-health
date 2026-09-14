import { notFound } from "next/navigation";

import TeamMembersSection from "@/app/about/our-team/team-members-section";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { aboutCrumbs } from "@/lib/breadcrumbs";
import { buildPageMetadata } from "@/lib/page-metadata";
import { TEAM_PAGE_QUERYResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import { TEAM_PAGE_QUERY } from "@/sanity/lib/queries";

/**
 * The team page, now a hub. CH-104.
 *
 * The heading still comes from the ourTeam document, because that is page
 * copy. The people come from the practitioner records, because they are
 * people with their own addresses rather than rows in an array.
 */
export default async function OurTeamPage() {
  const data = await sanityFetch<TEAM_PAGE_QUERYResult>({
    query: TEAM_PAGE_QUERY,
  });

  // The page document going missing is a 404. The practitioner list being
  // empty is not: the heading is still a page, and an empty grid is better
  // than a 404 on an address that is in the sitemap and linked from the nav.
  if (!data?.page) {
    return notFound();
  }

  const { heroSection } = data.page;

  return (
    <>
      <Breadcrumbs crumbs={aboutCrumbs("our-team")} />
      <section className="bg-white">
        <div className="container space-y-4 py-12 font-light md:py-14 2xl:py-20">
          <h1 className="text-3xl text-primary md:text-4xl 2xl:text-6xl">
            {heroSection?.heroTitle}
          </h1>
          <p className="max-w-[80ch] text-pretty text-muted-foreground">
            {heroSection?.heroParagraph}
          </p>
        </div>
      </section>
      <TeamMembersSection practitioners={data.practitioners ?? []} />
    </>
  );
}

export async function generateMetadata() {
  const data = await sanityFetch<TEAM_PAGE_QUERYResult>({
    query: TEAM_PAGE_QUERY,
  });

  return buildPageMetadata(data?.page?.seo ?? null, {
    path: "/about/our-team",
    title: "Our Team",
    description:
      "The practitioners at Curate Health in Midtown Toronto, their credentials and what each of them treats.",
  });
}
