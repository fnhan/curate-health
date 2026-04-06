"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

import { PortableText } from "@portabletext/react";
import {
  ArrowRightIcon,
  ChevronRight,
  ClipboardCheckIcon,
  ClipboardIcon,
  HandshakeIcon,
  PersonStandingIcon,
  PhoneIcon,
  ScrollIcon,
} from "lucide-react";

import HoverLinkVariation from "@/components/shared/hover-link-variation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cleanSlug, cn, getTeamMemberUrlId } from "@/lib/utils";
import { SERVICE_LIFESTYLE_BY_SLUG_QUERYResult } from "@/sanity.types";

import PillarsModified from "./pillars-modified";

interface Treatment {
  _id: string;
  title: string;
  slug: string;
}

const Heading = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <h1 className={cn("text-xl md:text-5xl 2xl:text-6xl", className)}>
      {children}
    </h1>
  );
};

const SubHeading = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <h2
      className={cn(
        "text-2xl md:text-3xl md:font-light 2xl:text-4xl",
        className
      )}
    >
      {children}
    </h2>
  );
};

const LargeText = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <p
      className={cn(
        "text-lg font-light md:text-2xl 2xl:text-4xl 2xl:leading-[1.5em]",
        className
      )}
    >
      {children}
    </p>
  );
};

// Add Condition type for block_3_content
interface Condition {
  title?: string;
  description?: any;
}

export default function ServiceLifestyleContent({
  service,
}: {
  service: SERVICE_LIFESTYLE_BY_SLUG_QUERYResult;
}) {
  if (!service) {
    return null;
  }

  const {
    title,
    content,
    content_image,
    content_alt,
    slug,
    hero_secondary_title,
    hero_large_text,
    block_2_title,
    block_2_content,
    block_2_image,
    block_3_title,
    block_3_content,
    block_4_image,
    pillars,
    block_5_image,
    benefits,
    block_7_image,
    block_9_image,
    timeline,
    block_11_image,
    faq,
    call_to_action,
    ourTeam,
    referral_form_pdf,
    testimonials,
  } = service;

  const teamMembers = (ourTeam?.teamMembers ?? [])
    .filter(
      (member) =>
        member.name?.includes("Rebecca") ||
        member.name?.includes("David") ||
        member.name?.includes("Frank")
    )
    .sort((a, b) => {
      // Put Frank last
      if (a.name?.includes("Frank")) return 1;
      if (b.name?.includes("Frank")) return -1;
      return 0;
    });

  const mainMember = (ourTeam?.teamMembers ?? []).filter((member) =>
    member.name?.includes("Eric")
  );

  const treatments = service.treatments as Treatment[];
  // Explicitly type block_3_content as Condition[]
  const block3Conditions: Condition[] = (block_3_content || []) as Condition[];

  const programIcons = [
    {
      icon: <PhoneIcon className="size-10 text-white" />,
    },
    {
      icon: <ClipboardIcon className="size-10 text-white" />,
    },
    {
      icon: <PersonStandingIcon className="size-10 text-white" />,
    },
    {
      icon: <ScrollIcon className="size-10 text-white" />,
    },
    {
      icon: <ClipboardCheckIcon className="size-10 text-white" />,
    },
    {
      icon: <HandshakeIcon className="size-10 text-white" />,
    },
  ];

  return (
    <>
      <section className="bg-white py-16 text-primary md:py-24">
        <div className="container flex flex-col gap-12 md:grid md:grid-cols-2 md:items-center">
          <div className="flex flex-col gap-8">
            <div className="space-y-4 md:space-y-6 2xl:space-y-8">
              <Heading>{title}</Heading>
              <div className="max-w-[80ch] text-pretty font-light">
                <PortableText value={content!} />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {treatments.map((treatment) => {
                return (
                  <Link
                    className="flex w-fit items-center gap-2 italic hover:underline"
                    key={treatment._id}
                    // * Clean slug is used when sanity preview mode is enabled
                    href={`/services/${cleanSlug(slug!)}/${cleanSlug(treatment.slug!)}`}
                  >
                    {treatment.title}
                    <ArrowRightIcon size={16} />
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <Image
              className="size-[256px] rounded-full object-cover md:size-[320px] 2xl:size-[545px]"
              width={545}
              height={545}
              src={content_image!}
              alt={content_alt!}
            />
          </div>
          <div className="col-span-2 h-32 border-l border-l-2 border-primary"></div>
          <div className="col-span-2 pt-12">
            <h1 className="text-xl md:text-4xl 2xl:text-6xl">
              {hero_secondary_title}
            </h1>
            <LargeText className="mt-12 max-w-2xl">{hero_large_text}</LargeText>
          </div>
        </div>
      </section>

      <section
        className="relative bg-cover bg-center bg-no-repeat py-16 text-primary md:py-24"
        style={{
          backgroundImage: `url(${block_2_image?.asset?.url})`,
        }}
      >
        <div className="container">
          <div className="relative z-10 flex max-w-xl flex-col gap-y-10">
            <SubHeading>{block_2_title}</SubHeading>
            <div className="max-w-xl text-pretty font-light">
              <PortableText value={block_2_content!} />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 text-primary md:py-44">
        <SubHeading className="container md:text-center">
          {block_3_title}
        </SubHeading>
        <div className="container flex flex-col items-center gap-12">
          {/* Group conditions into columns */}
          {(() => {
            // Responsive column count
            let columnCount = 1;
            if (typeof window !== "undefined") {
              if (window.innerWidth >= 1024) columnCount = 3;
              else if (window.innerWidth >= 768) columnCount = 2;
            }
            // Fallback for SSR: always 3 columns
            if (typeof window === "undefined") columnCount = 3;
            // Split block_3_content into columns
            const items: Condition[] = block3Conditions;
            const columns: Condition[][] = Array.from(
              { length: columnCount },
              () => []
            );
            items.forEach((item, idx) => {
              columns[idx % columnCount].push(item);
            });
            // State for hovered index per column
            const [hovered, setHovered] = useState<(number | null)[]>(
              Array(columnCount).fill(null)
            );
            return (
              <div className="my-12 grid w-full grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
                {columns.map((col, colIdx) => (
                  <div key={colIdx} className="flex flex-col gap-y-6">
                    {col.map((condition, rowIdx) => {
                      const isOpen = hovered[colIdx] === rowIdx;
                      if (!condition.title) return null;
                      return (
                        <div
                          key={condition.title}
                          className="flex cursor-pointer flex-col items-center border border-primary bg-white py-3 transition-all duration-300"
                          onMouseEnter={() =>
                            setHovered((prev) =>
                              prev.map((v, i) => (i === colIdx ? rowIdx : v))
                            )
                          }
                          onMouseLeave={() =>
                            setHovered((prev) =>
                              prev.map((v, i) => (i === colIdx ? null : v))
                            )
                          }
                          tabIndex={0}
                          onFocus={() =>
                            setHovered((prev) =>
                              prev.map((v, i) => (i === colIdx ? rowIdx : v))
                            )
                          }
                          onBlur={() =>
                            setHovered((prev) =>
                              prev.map((v, i) => (i === colIdx ? null : v))
                            )
                          }
                        >
                          <h3 className="text-center text-lg xl:text-xl">
                            {condition.title || ""}
                          </h3>
                          <div
                            className={`w-full transition-all duration-300 ${isOpen ? "mt-2 h-fit opacity-100" : "h-0 overflow-hidden opacity-0"}`}
                          >
                            <div className="prose w-full text-pretty px-2 font-light">
                              <PortableText value={condition.description!} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      <section className="bg-platinum py-16 text-primary transition-all duration-1000 ease-out md:py-24 lg:py-32">
        <div className="container flex flex-col items-center gap-y-20">
          <Heading className="font-light">Program Timeline</Heading>
          <div className="grid w-full grid-cols-1 gap-x-4 gap-y-20 text-center md:grid-cols-2 lg:grid-cols-3 lg:px-12">
            {timeline?.map((timeline_item, index) => {
              return (
                <div
                  className="mx-auto flex max-w-sm flex-col items-center gap-y-1"
                  key={timeline_item.title}
                >
                  <div className="mb-4 flex size-40 items-center justify-center rounded-full border border-[#878E76] bg-white">
                    <div className="flex size-24 items-center justify-center rounded-full bg-[#878E76]">
                      {programIcons[index].icon}
                    </div>
                  </div>
                  <h3 className="text-pretty text-lg font-light italic">
                    {timeline_item.title}
                  </h3>
                  <div className="text-pretty text-base font-light">
                    <PortableText value={timeline_item.description!} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <HoverLinkVariation
        href="/services/curate-lifestyle-program"
        text="View Full Program Breakdown"
      />

      <section className="relative flex items-center justify-center overflow-hidden bg-white bg-cover bg-center bg-no-repeat py-24 text-primary md:py-40">
        <div
          className="pointer-events-none absolute inset-0 z-0 hidden md:block"
          style={{
            transform: "scaleX(-1) translate(0, -15%)",
            backgroundImage: `url(${block_5_image!})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: 1,
          }}
        ></div>
        <div className="container relative z-20 flex w-full flex-col items-center justify-center md:flex-row">
          <div className="flex flex-1 justify-end">
            <div className="max-w-xl">
              <SubHeading>What Makes Our Program Unique?</SubHeading>
              <ul className="ml-4 mt-10 list-disc text-pretty pr-8 font-light leading-7">
                <li>
                  Overseen by a team of healthcare professionals, including
                  doctors, therapists, and nutrition experts—so it’s both safe
                  and effective.
                </li>
                <li>
                  Receive expert care from Canada&apos;s only clinic with a
                  doctor triple-certified in Internal Medicine,
                  Gastroenterology/Hepatology, and Lifestyle Medicine.
                </li>
                <li>Covered by OHIP and most health benefit programs</li>
                <li>
                  Flexible to participate in-person or online, although we do
                  encourage in-person
                </li>
                <li>
                  Participate in small intimate group sessions (6-15 people) to
                  learn, ask our doctors questions, and interact with program
                  peers.
                </li>
                <li>
                  Canada's only interdisciplinary approach to Lifestyle
                  Medicine, with a core MD/ND team.
                </li>
              </ul>
            </div>
          </div>
          <div className="flex-1"></div>
        </div>
      </section>

      <section className="bg-white py-16 text-primary md:py-24">
        <div className="container flex flex-col gap-y-14">
          <SubHeading className="text-center">Additional Benefits</SubHeading>
          <div className="mx-auto grid w-full grid-cols-1 gap-1 md:grid-cols-2 md:px-12 lg:grid-cols-3">
            {benefits?.map((benefit) => (
              <div
                key={benefit.title}
                className="group relative flex min-h-80 w-full cursor-pointer flex-col justify-end gap-y-4 overflow-hidden p-6 transition-all duration-300"
                style={{
                  backgroundImage: benefit.image
                    ? `url(${benefit.image})`
                    : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
                onMouseEnter={(e) => {
                  const bgDiv = e.currentTarget.querySelector(
                    ".benefit-bg"
                  ) as HTMLElement;
                  if (bgDiv) {
                    bgDiv.style.backgroundColor = `rgba(0, 0, 0, ${Number(benefit?.tint_percentage_hover || 0) / 100})`;
                  }
                }}
                onMouseLeave={(e) => {
                  const bgDiv = e.currentTarget.querySelector(
                    ".benefit-bg"
                  ) as HTMLElement;
                  if (bgDiv) {
                    bgDiv.style.backgroundColor = `rgba(0, 0, 0, ${Number(benefit?.tint_percentage || 0) / 100})`;
                  }
                }}
              >
                <div
                  className="benefit-bg absolute inset-0 bg-black transition-all duration-300"
                  style={{
                    backgroundColor: `rgba(0, 0, 0, ${Number(benefit?.tint_percentage || 0) / 100})`,
                  }}
                ></div>
                <div className="relative z-10">
                  <h3 className="text-lg text-white md:text-2xl xl:text-3xl">
                    {benefit.title}
                  </h3>
                  <div className="max-h-0 overflow-hidden text-pretty font-light text-white transition-all duration-300 group-hover:max-h-96">
                    <PortableText value={benefit.description!} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-platinum py-16 text-primary md:py-24">
        <div className="container flex flex-col items-center gap-4 md:gap-8 md:py-8">
          <div className="size-20 md:size-32">
            <Image
              src={block_7_image!}
              alt={"Curate Lifestyle Quote"}
              width={0}
              height={0}
              sizes="100vw"
              className="h-auto w-full object-cover"
            />
          </div>
          <LargeText className="max-w-2xl text-center italic">
            Canada&apos;s only Lifestyle Medicine clinic with a triple-certified
            Gastroenterologist, Internal Medicine and Lifestyle Medicine Doctor
            — reversing disease from the inside out.
          </LargeText>
        </div>
      </section>

      <section className="bg-white text-primary">
        <div className="container flex flex-col items-end gap-x-12 md:flex-row">
          <div className="hidden flex-1 md:block">
            <Image
              src={block_9_image!}
              alt={"How to Join"}
              width={0}
              height={0}
              sizes="100vw"
              className="h-auto w-full object-cover"
            />
          </div>
          <div className="mt-8 flex flex-1 flex-col gap-y-6 pb-24">
            <SubHeading>How to Join</SubHeading>
            <div className="flex max-w-lg flex-col gap-y-12 md:mt-6">
              <div className="flex flex-col gap-y-6">
                <h3 className="text-xl md:text-2xl 2xl:text-3xl">
                  1. Speak with Your Physician
                </h3>
                <p>
                  Ask your family doctor or any medical doctor on your care team
                  for a referral to our Curate Lifestyle Program. Your doctor
                  can use our{" "}
                  <a
                    href={referral_form_pdf?.asset?.url ?? ""}
                    className="underline"
                  >
                    Referral Form
                  </a>{" "}
                  for convenience.
                </p>
              </div>
              <div className="flex flex-col gap-y-6">
                <h3 className="text-xl md:text-2xl 2xl:text-3xl">
                  2. Send the Referral
                </h3>
                <p>
                  Have the referral faxed directly to us at{" "}
                  <a href="tel:+1-416-900-3311" className="underline">
                    416-900-3311
                  </a>
                  .
                </p>
              </div>
              <div className="flex flex-col gap-y-6">
                <h3 className="text-xl md:text-2xl 2xl:text-3xl">
                  3. We&apos;ll Take it From There
                </h3>
                <p>
                  Once received, our team will review your referral and contact
                  you to ask screening questions and to schedule your initial
                  consultation if this program is the right fit for you!{" "}
                </p>
              </div>
              <div className="flex flex-col gap-y-6">
                <p>
                  No referral yet? Let us know—our team can help guide you
                  through options on joining the program without a doctor's
                  referral.
                </p>

                <p>
                  Questions? We&apos;re here to support you. Feel free to reach
                  out to our front desk for assistance at{" "}
                  <a href="tel:+1-416-900-3311" className="underline">
                    416-900-3311
                  </a>{" "}
                  or{" "}
                  <a href="mailto:hello@curatehealth.ca" className="underline">
                    hello@curatehealth.ca
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 text-primary md:py-24">
        <SubHeading className="container px-4 pb-6 md:col-span-2 md:mb-8 lg:col-span-3">
          Meet Your Team
        </SubHeading>
        <div className="container flex flex-col items-center gap-y-4">
          {mainMember && mainMember.length > 0 && (
            <Card className="flex h-full w-full flex-col rounded-none md:max-w-screen-md md:flex-row xl:max-w-screen-lg">
              <div className="h-[500px]">
                <Image
                  className="h-full w-full object-cover"
                  src={mainMember[0]?.image?.asset?.url ?? ""}
                  alt={mainMember[0]?.name ?? ""}
                  width={0}
                  height={0}
                  sizes="100vw"
                />
              </div>
              <div className="flex flex-col justify-between md:px-8 md:py-10">
                <CardHeader className="flex-1">
                  <CardTitle className="font-light not-italic">
                    {mainMember[0]?.name}
                  </CardTitle>
                  <CardDescription>
                    <div className="prose text-sm [&_li]:my-0 [&_li]:p-0 [&_ul]:m-0 [&_ul]:list-none [&_ul]:p-0">
                      <PortableText value={mainMember[0]?.role!} />
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <Link
                    href={`/about/our-team?member=${getTeamMemberUrlId(mainMember[0]?.name || "")}`}
                    className="mt-8 flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline"
                  >
                    Learn More
                    <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200" />
                  </Link>
                </CardContent>
              </div>
            </Card>
          )}
          <div
            className={`grid w-full grid-cols-1 gap-4 md:grid-cols-2 ${teamMembers.length <= 2 ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}
          >
            {teamMembers?.map((teamMember) => (
              <Card
                key={teamMember.name}
                className="flex h-full flex-col rounded-none"
              >
                <div className="h-[300px]">
                  <Image
                    className="h-full w-full object-cover"
                    src={teamMember.image?.asset?.url ?? ""}
                    alt={teamMember.name ?? ""}
                    width={0}
                    height={0}
                    sizes="100vw"
                  />
                </div>
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
                    href={`/about/our-team?member=${getTeamMemberUrlId(teamMember.name || "")}`}
                    className="flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline"
                  >
                    Learn More
                    <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars Section */}

      <section className="space-y-12 bg-platinum py-16 text-primary md:py-32">
        <div className="container flex flex-col items-center justify-center gap-y-10">
          <Heading className="max-w-xl text-center">
            The Pillars of Lifestyle Medicine
          </Heading>
          <div className="h-24 border-l border-primary">&nbsp;</div>
          <LargeText className="max-w-3xl text-center italic">
            Evidence-based strategies for preventing, treating, and even
            reversing chronic diseases through sustainable lifestyle changes.
          </LargeText>
        </div>
        <div className="mx-auto flex max-w-screen-xl flex-col gap-6 px-6 py-12 md:px-0 lg:flex-row">
          <PillarsModified
            pillars={pillars ?? []}
            block_4_image={block_4_image!}
          />
        </div>
      </section>

      <section className="bg-white py-16 text-primary md:py-44">
        <div className="container mx-auto space-y-12 md:pb-12 2xl:px-12">
          <SubHeading>Frequently Asked Questions</SubHeading>
          <Accordion type="multiple">
            {faq?.map((faq, index) => {
              return (
                <AccordionItem
                  value={`item-${index}`}
                  className="border-b-2 border-b-gray-500"
                  key={faq.title}
                >
                  <AccordionTrigger className="py-6">
                    <h4 className="pr-10 text-left text-lg font-light italic xl:text-xl">
                      {faq.title}
                    </h4>
                  </AccordionTrigger>
                  <AccordionContent className="prose max-w-none pr-10">
                    <PortableText value={faq.description!} />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </section>

      {testimonials && testimonials.length > 0 && (
        <section className="bg-white py-16 text-primary md:py-32">
          <div className="container mx-auto space-y-24">
            <SubHeading className="text-center">Doctor Testimonials</SubHeading>
            <div className="mx-auto mt-12 grid max-w-screen-xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center gap-y-6">
                <div className="size-64 rounded-full bg-gray-200"></div>
                <p className="max-w-72 text-center">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Quisquam, quos.
                </p>
              </div>
              <div className="flex flex-col items-center gap-y-6">
                <div className="size-64 rounded-full bg-gray-200"></div>
                <p className="max-w-72 text-center">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Quisquam, quos.
                </p>
              </div>
              <div className="flex flex-col items-center gap-y-6">
                <div className="size-64 rounded-full bg-gray-200"></div>
                <p className="max-w-72 text-center">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Quisquam, quos.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      <section
        className={`relative min-h-screen bg-cover bg-center bg-no-repeat py-8 md:h-[calc(100vh-100px)] md:py-0`}
        style={{
          backgroundImage: `url(${block_11_image})`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-xs md:max-w-xl 2xl:max-w-7xl">
            <div className="flex flex-col gap-6 bg-secondary p-6 text-white md:items-center md:justify-center md:gap-12 md:p-16">
              <div className="space-y-4 md:px-4">
                <LargeText className="text-light mx-auto max-w-lg text-center text-base md:text-lg lg:text-2xl">
                  Be Among the First to Experience Lifestyle Medicine at Curate
                  Health
                </LargeText>
                <p className="max-w-[80ch] text-pretty text-center text-sm font-light md:text-base">
                  {call_to_action}
                </p>
              </div>
              <Button
                asChild
                className="mx-auto w-full max-w-xs rounded-none border border-white bg-white text-primary hover:bg-transparent hover:text-white md:w-fit"
              >
                <a href="/contact">Join the Waitlist</a>
              </Button>
              <p className="text-center text-sm md:text-base">
                Want to refer a patient?{" "}
                <a
                  href={referral_form_pdf?.asset?.url ?? ""}
                  className="underline"
                >
                  Click Here
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
