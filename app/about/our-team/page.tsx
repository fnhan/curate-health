import Image from "next/image";
import { notFound } from "next/navigation";

import { PortableText } from "next-sanity";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <section className="bg-white text-primary">
        <div className="container grid grid-cols-1 gap-4 py-20 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers?.map((teamMember) => (
            <Card key={teamMember.name} className="flex flex-col rounded-none">
              <div className="h-[300px]">
                <Image
                  className="h-full w-full object-cover"
                  src={teamMember.image?.asset?.url ?? ""}
                  alt={teamMember.name ?? ""}
                  width={400}
                  height={400}
                />
              </div>
              <CardHeader className="flex-1">
                <CardTitle className="font-light not-italic">
                  {teamMember.name}
                </CardTitle>
                <CardDescription>
                  <div className="prose">
                    <PortableText value={teamMember.role!} />
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1" className="border-none">
                    <AccordionTrigger>Learn More</AccordionTrigger>
                    <AccordionContent>
                      <div className="prose">
                        <PortableText value={teamMember.bio!} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
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
