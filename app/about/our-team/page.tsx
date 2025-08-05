import { notFound } from "next/navigation";


import TeamMembersSection from "@/app/about/our-team/team-members-section";
import { OUR_TEAM_PAGE_QUERYResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import { OUR_TEAM_PAGE_QUERY } from "@/sanity/lib/queries";

export default async function OurTeamPage() {
  const ourTeam = await sanityFetch<OUR_TEAM_PAGE_QUERYResult>({
    query: OUR_TEAM_PAGE_QUERY,
  });

  if (!ourTeam) {
    return notFound();
  }

  const { heroSection, teamMembers } = ourTeam;

  return (
    <>
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
      <TeamMembersSection teamMembers={teamMembers || []} />
    </>
  );
}

export async function generateMetadata() {
  const ourStory = await sanityFetch<OUR_TEAM_PAGE_QUERYResult>({
    query: OUR_TEAM_PAGE_QUERY,
  });

  const { seo } = ourStory!;

  return {
    title: seo?.pageTitle,
    description: seo?.pageDescription,
    openGraph: {
      title: seo?.pageTitle,
      description: seo?.pageDescription,
      images: {
        url: seo?.socialMeta?.ogImage?.asset?.url!,
        alt: seo?.socialMeta?.ogImage?.asset?.alt!,
      },
    },
    twitter: {
      title: seo?.pageTitle,
      description: seo?.pageDescription,
      images: {
        url: seo?.socialMeta?.twitterImage?.asset?.url!,
        alt: seo?.socialMeta?.twitterImage?.asset?.alt!,
      },
    },
  };
}
