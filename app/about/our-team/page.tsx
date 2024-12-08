import Image from "next/image";
import { notFound } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OUR_TEAM_PAGE_QUERYResult } from "@/sanity.types";
import { OUR_TEAM_PAGE_QUERY } from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/server-client";

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
              <CardHeader>
                <CardTitle className="font-light not-italic">
                  {teamMember.name}
                </CardTitle>
                <CardDescription>{teamMember.role}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {teamMember.bio}
                </p>
              </CardContent>
              {/* <CardFooter></CardFooter> */}
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
