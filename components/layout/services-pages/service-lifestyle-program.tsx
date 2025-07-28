import Image from "next/image";

import { AlternatingSections } from "@/components/shared/alternating-sections";
import { Button } from "@/components/ui/button";
import {
  SERVICE_LIFESTYLE_PROGRAM_BY_SLUG_QUERYResult,
} from "@/sanity.types";
import { PortableText } from "@portabletext/react";

export default function ServiceLifestyleProgramContent({
  program,
}: {
  program: SERVICE_LIFESTYLE_PROGRAM_BY_SLUG_QUERYResult;
}) {
  if (!program) {
    return null;
  }

  const { title, intro, additionalSections, cta, additionalCheckinTitle, additionalCheckin, groupSectionTitle, groupSections, groupSectionDescription, assistanceSectionTitle, assistanceSectionDescription, assistanceSectionImage, referral_form_pdf } = program;
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
        <div className="container flex flex-col gap-12 items-center mx-auto">
          <h2 className="text-balance text-2xl font-light text-center">
            {additionalCheckinTitle}
          </h2>
          <div className="flex flex-col md:flex-row max-w-4xl gap-6 mx-auto">
            {additionalCheckin?.map((checkin) => (
              <div key={checkin.checkinDescription} className="flex-1 flex flex-col gap-6 items-center">
                <div className="text-balance text-4xl text-center bg-[#878E76] size-20 rounded-full text-white font-medium flex items-center justify-center">{checkin.checkinCount}</div>
                <p className="text-balance font-light text-center italic max-w-64">{checkin.checkinDescription}</p>
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
        <div className="container flex flex-col gap-12 items-center">

          <h1 className="text-2xl capitalize md:text-4xl 2xl:text-5xl">{groupSectionTitle}</h1>
          <div className="mx-auto font-light max-w-lg space-y-4 text-pretty text-center">
            {groupSectionDescription}
          </div>
          <div className="flex flex-col gap-4 justify-center divide-y divide-primary w-full max-w-2xl">
            {groupSections?.map((section, idx) => (
              <div key={idx} className="flex flex-row gap-4 justify-between items-center py-4">
                <div><PortableText value={section.description!} /></div>
                <div className="size-24 rounded-full bg-primary shrink-0">
                  <Image src={section.image!} alt={section.alt!} width={100} height={100} className="rounded-full size-full object-cover grayscale" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-white py-14">
        {/* Background Image, flipped horizontally */}
        <Image
          src={assistanceSectionImage?.asset?.url!}
          alt="Assistance Section Image"
          fill
          className="object-cover w-full h-full min-w-full min-h-full -scale-x-100 left-0 top-0"
          style={{ objectPosition: '60% center' }}
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
            <div>
              -add form here-
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
              <p className="max-w-lg mx-auto text-pretty text-sm font-light md:text-center md:text-base">
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
            <div className="text-white text-sm font-light">
              Want to refer a patient? <a href="#" className="underline">Click Here</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
