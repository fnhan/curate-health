import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  PRIMARY_CTA_BUTTON_QUERYResult,
  TREATMENT_BY_SLUG_QUERYResult,
} from "@/sanity.types";

export default function TreatmentContent({
  treatment,
  primaryCTA,
}: {
  treatment: TREATMENT_BY_SLUG_QUERYResult;
  primaryCTA: PRIMARY_CTA_BUTTON_QUERYResult;
}) {
  if (!treatment) {
    return null;
  }

  const { title, intro, quoteContent, overview, benefits, cta } = treatment;
  const { title: benefitsTitle, benefitsList } = benefits || {};
  const { ctaBg, ctaBgAlt, ctaTitle, ctaText, ctaButtonText } = cta || {};
  const { ctaButton } = primaryCTA || {};

  return (
    <div className="bg-white text-primary">
      <section className="container flex flex-col gap-3 py-14 md:gap-6 md:py-28 2xl:gap-8">
        <div className="flex flex-col items-center gap-3 md:gap-6 2xl:gap-8">
          <h1 className="text-2xl capitalize md:text-4xl 2xl:text-6xl">
            {title}
          </h1>
          <div className="h-16 w-px bg-primary md:h-24 2xl:h-32" />
        </div>
        <div className="mx-auto max-w-[80ch] space-y-4 text-pretty text-center">
          <h2 className="text-xl capitalize md:text-3xl">{intro?.subtitle}</h2>
          <p className="font-light">{intro?.introParagraph}</p>
        </div>
      </section>
      <section className="flex bg-secondary py-24 2xl:py-52">
        <div className="container flex flex-col items-center gap-14 md:gap-12 2xl:gap-10">
          <div className="size-14 md:size-20 2xl:size-40">
            <svg
              viewBox="0 0 160 134"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                opacity="1"
                d="M44.2023 88.1732C51.6731 88.1732 57.4837 90.3002 61.6342 94.5541C66.1997 98.8081 68.4825 104.222 68.4825 110.797C68.4825 126.266 58.9364 134 39.8443 134C27.393 134 17.6394 129.746 10.5836 121.238C3.52785 112.343 0 99.7749 0 83.5325C0 68.0635 3.73535 53.7547 11.2062 40.6061C18.677 27.0707 29.6757 13.7287 44.2023 0.580118C44.6173 0.193376 45.2399 0 46.07 0C47.3151 0 48.3528 0.5801 49.1829 1.74028C50.013 2.90046 50.013 3.86727 49.1829 4.64071C28.8456 23.9769 18.677 46.7937 18.677 73.0909C18.677 83.9192 20.7523 91.8471 24.9027 96.8745C28.6382 91.0736 35.0713 88.1732 44.2023 88.1732ZM135.72 88.1732C143.191 88.1732 149.001 90.3002 153.152 94.5541C157.717 98.8081 160 104.222 160 110.797C160 126.266 150.454 134 131.362 134C118.91 134 109.157 129.746 102.101 121.238C95.0454 112.343 91.5175 99.7749 91.5175 83.5325C91.5175 68.0635 95.2529 53.7547 102.724 40.6061C110.195 27.0707 121.193 13.7287 135.72 0.580118C136.135 0.193376 136.757 0 137.588 0C138.833 0 139.87 0.5801 140.7 1.74028C141.53 2.90046 141.53 3.86727 140.7 4.64071C120.363 23.9769 110.195 46.7937 110.195 73.0909C110.195 83.9192 112.27 91.8471 116.42 96.8745C120.156 91.0736 126.589 88.1732 135.72 88.1732Z"
                fill="#283619"
              />
            </svg>
          </div>
          <p className="mx-auto max-w-[80ch] text-balance text-center text-lg md:text-3xl">
            {quoteContent}
          </p>
        </div>
      </section>
      <section className="bg-white py-20 md:py-28">
        <div className="flex flex-col gap-20">
          {overview?.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col-reverse gap-14 md:container md:grid md:grid-cols-2 md:items-center"
            >
              <div
                className={`container space-y-4 md:space-y-6 md:px-0 ${idx % 2 === 1 ? "md:order-2" : "md:order-1"}`}
              >
                <h3 className="text-balance text-lg capitalize md:text-3xl">
                  {item.title}
                </h3>
                <p className="max-w-[80ch] text-pretty font-light">
                  {item.paragraph}
                </p>
              </div>
              <div
                className={`w-full ${idx % 2 === 1 ? "md:order-1" : "md:order-2"}`}
              >
                <Image
                  src={item.image?.asset?.url!}
                  alt={item.image?.alt!}
                  width={708}
                  height={556}
                  className="h-[460px] w-full object-cover pr-4 md:h-[556px] md:pr-0"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="container flex flex-col gap-8 py-20 md:py-28">
        <h4 className="text-center text-xl capitalize md:text-3xl 2xl:text-4xl">
          {benefitsTitle}
        </h4>
        <div className="flex flex-col">
          {benefitsList?.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-4 border-b py-8 md:items-center md:justify-center md:py-12"
            >
              <h5 className="text-balance text-lg md:text-2xl 2xl:text-3xl">
                {item.title}
              </h5>
              <p className="max-w-[80ch] text-pretty font-light md:text-center">
                {item.subtitle}
              </p>
            </div>
          ))}
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
            <div className="space-y-4 px-4">
              <h6 className="text-balance text-lg capitalize md:text-center md:text-3xl 2xl:text-4xl">
                {ctaTitle}
              </h6>
              <p className="max-w-[80ch] text-pretty text-sm font-light md:text-center md:text-base">
                {ctaText}
              </p>
            </div>
            <Button
              asChild
              className="w-fit rounded-none border border-white bg-white text-primary hover:bg-transparent hover:text-white"
            >
              <a target="_blank" href={ctaButton?.ctaLink!}>
                {ctaButtonText}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
