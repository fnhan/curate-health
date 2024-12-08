import Image from "next/image";
import { notFound } from "next/navigation";

import { PortableText } from "@portabletext/react";

import { Button } from "@/components/ui/button";
import { OUR_STORY_PAGE_QUERYResult } from "@/sanity.types";
import { OUR_STORY_PAGE_QUERY } from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/server-client";

export default async function OurStoryPage() {
  const ourStory = await sanityFetch<OUR_STORY_PAGE_QUERYResult>({
    query: OUR_STORY_PAGE_QUERY,
  });

  if (!ourStory) {
    return notFound();
  }

  const { heroSection, quoteSection, additionalSections, ctaSection } =
    ourStory;

  return (
    <>
      <section>
        <Image
          src={heroSection?.heroImage?.image || ""}
          alt={heroSection?.heroImage?.alt || ""}
          width={1440}
          height={344}
          className="h-[344px] w-full object-cover md:h-[336px] lg:h-[344px]"
        />
        <div className="bg-secondary">
          <div className="container">
            <div className="max-w-[80ch] space-y-2 text-pretty py-14 font-light md:space-y-5 md:py-20 2xl:space-y-12">
              <h1 className="text-2xl md:text-4xl 2xl:text-6xl">
                {heroSection?.heroTitle}
              </h1>
              <p className="text-primary">{heroSection?.heroSubtitle}</p>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-white">
        <div className="container flex flex-col items-center gap-7 py-14 md:gap-16 md:py-16 2xl:gap-20 2xl:py-24">
          <Image
            src={quoteSection?.quoteImage?.image || ""}
            alt={quoteSection?.quoteImage?.alt || ""}
            width={160}
            height={134}
            className="size-16 object-contain md:size-20 2xl:size-40"
          />
          <p className="max-w-[80ch] text-balance text-center text-2xl font-light italic text-primary md:text-4xl 2xl:max-w-6xl 2xl:text-5xl">
            {quoteSection?.quoteText}
          </p>
        </div>
      </section>
      <section className="-z-20 flex flex-col gap-20 bg-white py-14 text-primary md:gap-28">
        {additionalSections?.map((section, index) => (
          <div
            key={section.sectionTitle}
            className="flex flex-col gap-16 md:container md:grid md:grid-cols-2 md:gap-16"
          >
            <div className={`relative ${index % 2 === 1 ? "md:order-2" : ""}`}>
              <Image
                loading="lazy"
                src={section.sectionImage?.image || ""}
                alt={section.sectionImage?.alt || ""}
                width={704}
                height={556}
                className={`h-[360px] w-full object-cover md:h-[556px] ${
                  index % 2 === 0
                    ? "pr-4 sm:pr-8 md:pr-0"
                    : "pl-4 sm:pl-8 md:pl-0"
                }`}
              />
              <div
                className={`absolute -top-7 -z-10 h-[387px] bg-secondary md:h-[487px] ${
                  index % 2 === 0
                    ? "left-0 w-[calc(100%-2rem)] sm:w-[calc(100%-4rem)]"
                    : "right-0 w-[calc(100%-2rem)] sm:w-[calc(100%-4rem)]"
                }`}
              />
            </div>
            <div className="container flex flex-col gap-4 md:max-w-none md:px-0">
              <h2 className="text-2xl font-light">{section.sectionTitle}</h2>
              <div className="prose max-w-[80ch]">
                <PortableText value={section.sectionParagraph!} />
              </div>
            </div>
          </div>
        ))}
      </section>
      <section className={`relative h-full md:h-[calc(100vh-100px)]`}>
        <Image
          loading="lazy"
          src={ctaSection?.ctaSectionImage?.image || ""}
          alt={ctaSection?.ctaSectionImage?.alt || ""}
          width={1440}
          height={1040}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 mx-auto flex max-w-xs flex-col items-center justify-center md:max-w-xl 2xl:max-w-7xl">
          <div className="flex flex-col gap-8 bg-secondary p-8 text-white md:items-center md:justify-center md:gap-12 md:p-16">
            <div className="space-y-4 px-4">
              <h6 className="text-balance text-lg capitalize md:text-center md:text-3xl 2xl:text-4xl">
                {ctaSection?.ctaSectionTitle}
              </h6>
              <p className="max-w-[80ch] text-pretty text-sm font-light md:text-center md:text-base">
                {ctaSection?.ctaSectionParagraph}
              </p>
            </div>
            <Button
              asChild
              className="mx-auto w-fit rounded-none border border-white bg-white text-primary hover:bg-transparent hover:text-white"
            >
              <a target="_blank" href={ctaSection?.ctaButton?.buttonLink!}>
                {ctaSection?.ctaButton?.buttonText}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
