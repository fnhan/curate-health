"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

import { ChevronRight } from "lucide-react";
import { PortableText } from "next-sanity";
import Masonry from "react-masonry-css";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPractitionerSlugFromName, getTeamMemberUrlId } from "@/lib/utils";

/**
 * The practitioner page a card links to. CH-104.
 *
 * This file is the version that was live before #238, restored from git. The
 * only change is that "Learn More" and the photo link to the person's own page
 * instead of opening their bio in an accordion.
 */
const practitionerHref = (name?: string | null) =>
  `/about/our-team/${getPractitionerSlugFromName(name || "")}`;

interface TeamMember {
  name?: string | null;
  role?: Array<
    | {
        children?: Array<{
          marks?: Array<string>;
          text?: string;
          _type: "span";
          _key: string;
        }>;
        style?: "normal" | "h1" | "h2" | "h3" | "h4" | "blockquote";
        listItem?: "bullet" | "number";
        markDefs?: Array<{
          href?: string;
          _type: "link";
          _key: string;
        }>;
        level?: number;
        _type: "block";
        _key: string;
      }
    | {
        asset?: {
          _ref: string;
          _type: "reference";
          _weak?: boolean;
        };
        hotspot?: any;
        crop?: any;
        alt?: string;
        _type: "image";
        _key: string;
      }
  > | null;
  bio?: Array<
    | {
        children?: Array<{
          marks?: Array<string>;
          text?: string;
          _type: "span";
          _key: string;
        }>;
        style?: "normal" | "h1" | "h2" | "h3" | "h4" | "blockquote";
        listItem?: "bullet" | "number";
        markDefs?: Array<{
          href?: string;
          _type: "link";
          _key: string;
        }>;
        level?: number;
        _type: "block";
        _key: string;
      }
    | {
        asset?: {
          _ref: string;
          _type: "reference";
          _weak?: boolean;
        };
        hotspot?: any;
        crop?: any;
        alt?: string;
        _type: "image";
        _key: string;
      }
  > | null;
  image?: {
    asset?: {
      url?: string | null;
    } | null;
  } | null;
}

const teamPhotoClassName =
  "h-full w-full object-cover grayscale transition-all duration-300 hover:cursor-pointer hover:grayscale-0";

interface TeamMembersSectionProps {
  teamMembers: TeamMember[];
}

function TeamMembersContent({ teamMembers }: TeamMembersSectionProps) {
  const searchParams = useSearchParams();
  const teamMemberRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const breakpointColumns = {
    default: 3,
    1023: 2,
    767: 1,
  };

  useEffect(() => {
    const memberParam = searchParams.get("member");
    if (memberParam && teamMembers) {
      const targetMember = teamMembers.find(
        (member) =>
          getTeamMemberUrlId(member.name || "") === memberParam.toLowerCase()
      );

      if (targetMember) {
        const memberId = `member-${getTeamMemberUrlId(targetMember.name || "")}`;
        setTimeout(() => {
          const element = teamMemberRefs.current[memberId];
          if (element) {
            element.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 100);
      }
    }
  }, [searchParams, teamMembers]);

  return (
    <section className="bg-white pb-24 pt-12 text-primary md:pb-28 md:pt-14 2xl:pb-40 2xl:pt-20">
      <Masonry
        breakpointCols={breakpointColumns}
        className="container flex"
        columnClassName="ml-4 flex flex-col gap-4"
      >
        {teamMembers?.map((teamMember) => {
          const memberId = `member-${getTeamMemberUrlId(teamMember.name || "")}`;
          return (
            <Card
              key={teamMember.name}
              className="flex min-h-[580px] w-full flex-col rounded-none"
              ref={(el) => {
                teamMemberRefs.current[memberId] = el;
              }}
            >
              <Link href={practitionerHref(teamMember.name)} className="block h-[300px]">
                <Image
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 90vw"
                  className={teamPhotoClassName}
                  src={teamMember.image?.asset?.url ?? ""}
                  alt={teamMember.name ?? ""}
                  width={400}
                  height={400}
                />
              </Link>
              <CardHeader className="flex-1">
                <CardTitle className="font-light not-italic">
                  {teamMember.name}
                </CardTitle>
                <CardDescription>
                  <div className="prose text-sm [&_li]:my-0 [&_li]:p-0 [&_ul]:m-0 [&_ul]:list-none [&_ul]:p-0">
                    <PortableText value={teamMember.role!} />
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href={practitionerHref(teamMember.name)}
                  className="flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline"
                >
                  Learn More
                  <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </Masonry>
    </section>
  );
}

export default function TeamMembersSection({
  teamMembers,
}: TeamMembersSectionProps) {
  return (
    <Suspense
      fallback={
        <section className="bg-white text-primary">
          <div className="container grid grid-cols-1 items-start gap-4 py-20 md:grid-cols-2 lg:grid-cols-3">
            {teamMembers?.map((teamMember) => (
              <Card
                key={teamMember.name}
                className="flex h-full flex-col rounded-none"
              >
                <Link href={practitionerHref(teamMember.name)} className="block h-[300px]">
                  <Image
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 90vw"
                    className={teamPhotoClassName}
                    src={teamMember.image?.asset?.url ?? ""}
                    alt={teamMember.name ?? ""}
                    width={400}
                    height={400}
                  />
                </Link>
                <CardHeader className="flex-1">
                  <CardTitle className="font-light not-italic">
                    {teamMember.name}
                  </CardTitle>
                  <CardDescription>
                    <div className="prose text-sm [&_li]:my-0 [&_li]:p-0 [&_ul]:m-0 [&_ul]:list-none [&_ul]:p-0">
                      <PortableText value={teamMember.role!} />
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <Link
                    href={practitionerHref(teamMember.name)}
                    className="flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline"
                  >
                    Learn More
                    <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      }
    >
      <TeamMembersContent teamMembers={teamMembers} />
    </Suspense>
  );
}
