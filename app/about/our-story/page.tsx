import Image from "next/image";
import { notFound } from "next/navigation";

import { AlternatingSections } from "@/components/shared/alternating-sections";
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
      <AlternatingSections sections={additionalSections!} />
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
