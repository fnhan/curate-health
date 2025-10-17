import Image from "next/image";

import { PortableText } from "@portabletext/react";

import { AlternatingSections } from "@/components/shared/alternating-sections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SERVICE_LIFESTYLE_PROGRAM_BY_SLUG_QUERYResult } from "@/sanity.types";

export default function ServiceLifestyleProgramContent({
  program,
}: {
  program: SERVICE_LIFESTYLE_PROGRAM_BY_SLUG_QUERYResult;
}) {
  if (!program) {
    return null;
  }

  const {
    title,
    intro,
    additionalSections,
    cta,
    additionalCheckinTitle,
    additionalCheckin,
    groupSectionTitle,
    groupSections,
    groupSectionDescription,
    assistanceSectionTitle,
    assistanceSectionDescription,
    assistanceSectionImage,
    referral_form_pdf,
  } = program;
  const { ctaBg, ctaBgAlt, ctaTitle, ctaText, ctaButtonText } = cta || {};

  return (
    <div className="text-primary">
      <section className="bg-white">
        <div className="container flex flex-col gap-3 py-14 md:gap-6 md:py-28 2xl:gap-8">
          <div className="flex flex-col items-center gap-3 md:gap-6 2xl:gap-8">
            <h1 className="text-2xl capitalize md:text-4xl 2xl:text-6xl">
              {title}
            </h1>
            <div className="h-16 w-px bg-primary md:h-24 2xl:h-32" />
          </div>
          <div className="mx-auto max-w-[80ch] space-y-4 text-pretty text-center">
            <h2 className="text-xl capitalize md:text-3xl">
              {intro?.subtitle}
            </h2>
            <p className="font-light">{intro?.introParagraph}</p>
          </div>
        </div>
      </section>

      <AlternatingSections sections={additionalSections!} />

      <section className="bg-white py-14">
        <div className="container mx-auto flex flex-col items-center gap-12">
          <h2 className="text-balance text-center text-2xl font-light">
            {additionalCheckinTitle}
          </h2>
          <div className="mx-auto flex max-w-4xl flex-col gap-6 md:flex-row">
            {additionalCheckin?.map((checkin) => (
              <div
                key={checkin.checkinDescription}
                className="flex flex-1 flex-col items-center gap-6"
              >
                <div className="flex size-20 items-center justify-center text-balance rounded-full bg-[#878E76] text-center text-4xl font-medium text-white">
                  {checkin.checkinCount}
                </div>
                <p className="max-w-64 text-balance text-center font-light italic">
                  {checkin.checkinDescription}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VerticalDivider */}
      <div className="flex flex-row items-center justify-center bg-white">
        <div className="h-16 w-px bg-primary md:h-24 2xl:h-32" />
      </div>

      <section className="bg-white py-14">
        <div className="container flex flex-col items-center gap-12">
          <h1 className="text-2xl capitalize md:text-4xl 2xl:text-5xl">
            {groupSectionTitle}
          </h1>
          <div className="mx-auto max-w-lg space-y-4 text-pretty text-center font-light">
            {groupSectionDescription}
          </div>
          <div className="flex w-full max-w-2xl flex-col justify-center gap-4 divide-y divide-primary">
            {groupSections?.map((section, idx) => (
              <div
                key={idx}
                className="group flex flex-row items-center justify-between gap-4 py-4"
              >
                <div>
                  <PortableText value={section.description!} />
                </div>
                <div className="size-24 shrink-0 rounded-full bg-primary">
                  <Image
                    src={section.image!}
                    alt={section.alt!}
                    width={100}
                    height={100}
                    className="size-full rounded-full object-cover transition-all duration-300 md:grayscale group-hover:md:grayscale-0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-[#EBEBEB] py-14">
        {/* Background Image, flipped horizontally */}
        <Image
          src={assistanceSectionImage?.asset?.url!}
          alt="Assistance Section Image"
          fill
          className="left-0 right-0 hidden h-full min-h-full w-full min-w-full -scale-x-100 bg-[#EBEBEB] object-contain xl:block"
          style={{ objectPosition: "0px center" }}
          priority
        />
        <div className="container relative z-10 flex flex-row py-24">
          <div className="flex flex-col gap-6">
            <h2 className="text-balance text-2xl font-light">
              {assistanceSectionTitle}
            </h2>
            <div className="mx-auto max-w-xl space-y-4 text-pretty font-light">
              {assistanceSectionDescription}
            </div>
            <div className="w-full max-w-md">
              <form
                action="https://formspree.io/f/xrblyjbl"
                method="POST"
                className="space-y-4"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Name"
                      className="w-full rounded-none border-black bg-[#EBEBEB] px-4 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                  <div className="space-y-2">
                    {/* <Label htmlFor="email">Email</Label> */}
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="Email address"
                      className="w-full rounded-none border-black bg-[#EBEBEB] px-4 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  {/* <Label htmlFor="subject">Subject</Label> */}
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    placeholder="Subject"
                    className="w-full rounded-none border-black bg-[#EBEBEB] px-4 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="space-y-2">
                  {/* <Label htmlFor="message">Message</Label> */}
                  <textarea
                    id="message"
                    name="message"
                    required
                    placeholder="Message"
                    className="flex min-h-[80px] w-full border border-black bg-[#EBEBEB] p-4 focus-visible:ring-0 focus-visible:ring-offset-0"
                    rows={4}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-none border border-black bg-[#EBEBEB] py-2 text-sm font-light text-black focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className={`relative h-[calc(100vh-100px)]`}>
        <Image
          src={ctaBg?.asset?.url!}
          alt={ctaBgAlt!}
          width={1440}
          height={1040}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 mx-auto flex max-w-xs flex-col items-center justify-center md:max-w-xl 2xl:max-w-7xl">
          <div className="flex flex-col gap-8 bg-secondary p-8 text-white md:items-center md:justify-center md:gap-12 md:p-16">
            <div className="space-y-4 md:px-4">
              <h6 className="text-balance text-lg capitalize md:text-center md:text-3xl 2xl:text-4xl">
                {ctaTitle}
              </h6>
              <p className="mx-auto max-w-lg text-pretty text-sm font-light md:text-center md:text-base">
                {ctaText}
              </p>
            </div>
            <Button
              asChild
              className="w-fit rounded-none border border-white bg-white text-primary hover:bg-transparent hover:text-white"
            >
              <a target="_blank" href={referral_form_pdf?.asset?.url ?? ""}>
                {ctaButtonText}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
