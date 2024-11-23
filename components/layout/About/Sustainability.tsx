import Image from "next/image";
import Link from "next/link";

import imageUrlBuilder from "@sanity/image-url";
import { Loading } from "components/Loading";
import { Button } from "components/ui/button";

import { dataset, projectId } from "../../../sanity/env";
import styles from "../../../styles/CarouselNav.module.css";

const builder = imageUrlBuilder({ projectId, dataset });

export default function Sustainability({ sustainability, aboutPages }) {
  if (!sustainability) {
    return <Loading />;
  }

  const {
    headerImage,
    headerTitle,
    headerTitleDesktop,
    headerTextContent,
    sectionOneImage,
    sectionOneTitle,
    sectionOneTextContent,
    sectionTwoImage,
    sectionTwoTitle,
    sectionTwoTextContent,
    sectionThreeTitle,
    sectionThreeImage,
    sectionThreeTextContent,
    sectionFourTitle,
    sectionFourTextContent,
    sectionFourImage,
    sectionFiveImage,
    sectionFiveTitle,
    sectionFiveTextContent,
    sectionSixTitle,
    sectionSixTextContent,
    sectionSixImage,
    sectionSixSubtitleOne,
    sectionSixSubtitleOneText,
    sectionSixSubtitleTwo,
    sectionSixSubtitleTwoText,
    sectionSixSubtitleThree,
    sectionSixSubtitleThreeText,
    sectionSevenBgImage,
    sectionSevenTitle,
    sectionSevenTextContent,
    sectionSevenCta,
    ctaUrl,
    sectionSevenEsg,
    esgLink,
  } = sustainability;

  return (
    <div className="flex w-full flex-col bg-white font-light">
      <section
        id="headerSection"
        className="relative flex h-[604px] w-full flex-col bg-white font-light text-primary md:h-[798px] lg:h-[915px]"
      >
        <Image
          loading="lazy"
          width={1440}
          height={690}
          alt={`${headerImage.alt}`}
          src={builder.image(headerImage).width(1440).height(690).url()}
          className="h-[354px] w-full md:h-[450px] lg:h-[690px]"
        />
        <div className="h-[48px] bg-[#C3C7BB] backdrop-blur-3xl md:h-[68px] lg:h-[78px]">
          <div className="h-[48px] bg-[#C3C7BB] backdrop-blur-3xl md:h-[68px] lg:h-[78px]">
            <div
              className={`container -mt-5 overflow-x-auto whitespace-nowrap md:-mt-0 ${styles.customScrollbar}`}
            >
              <div className="flex">
                <div className="-mr-8">
                  <div className="group p-1">
                    <Link href="/about/our-story">
                      <div className="flex border-none bg-transparent">
                        <div className="-ml-4 p-4 text-[12px] font-light leading-[14px] text-primary md:-ml-6 md:p-6 lg:text-[14px]">
                          About
                          <div className="mt-1 w-0 bg-primary transition-all duration-500 group-hover:w-full md:h-[0.5px] lg:h-[1.35px]"></div>
                        </div>
                        <div className="mx-3 -ml-4 p-4 font-light leading-[14px] text-primary md:-ml-6 md:p-6 lg:inline">
                          |
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
                {aboutPages.map((aboutPage, index) => (
                  <div key={index}>
                    <div className="group p-1">
                      <Link href={`/about/${aboutPage.slug}`}>
                        <div
                          className={`border-none bg-transparent ${aboutPage.title === "Sustainability" ? "text-primary underline underline-offset-[6.5px] lg:underline-offset-[7.25px]" : ""}`}
                        >
                          <div className="-mx-4 items-center justify-center p-4 px-6 text-[12px] font-light leading-[14px] text-primary md:p-6 lg:text-[14px]">
                            {aboutPage.title}
                            <div
                              className={`${aboutPage.title !== "Sustainability" ? "mt-1 w-0 bg-primary transition-all duration-500 group-hover:w-full md:h-[0.5px] lg:h-[1.35px]" : ""}`}
                            ></div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col pl-8 pt-20 md:pl-[60px] md:pt-28 lg:pl-40">
          <h1 className="block text-2xl leading-8 md:text-5xl md:leading-10 lg:hidden">
            {headerTitle}
          </h1>
          <h1 className="hidden w-1/2 text-7xl leading-[72px] lg:block">
            {headerTitleDesktop}
          </h1>
          <p className="w-3/4 pt-3 text-xs leading-5 md:w-[60%] md:pt-9 md:text-sm md:leading-7 lg:w-[37%] lg:text-base">
            {headerTextContent}
          </p>
        </div>
      </section>
      <section
        id="sectionOne"
        className="flex w-full flex-col bg-white pt-[180px] font-light lg:grid lg:grid-cols-2 lg:pt-[400px]"
      >
        <div className="mx-[32px] flex w-[90%] flex-col justify-center md:mx-[60px] md:w-[85%] md:pt-36 lg:mx-0 lg:w-[95%] lg:pl-40 lg:pt-0">
          <h1 className="pt-[600px] text-base leading-[52px] text-primary md:pb-12 md:text-[32px] lg:pt-20 lg:text-[40px]">
            {sectionOneTitle}
          </h1>
          <p className="text-xs leading-5 text-primary md:text-sm md:leading-7 lg:col-span-1 lg:mx-0 lg:p-1 lg:pt-10 lg:text-base">
            {sectionOneTextContent}
          </p>
        </div>
        <Image
          loading="lazy"
          width={704}
          height={500}
          alt={`${sectionOneImage.alt}`}
          src={builder.image(sectionOneImage).width(704).height(500).url()}
          className="absolute left-0 z-10 h-[496px] w-[304px] translate-y-16 transform md:h-[600px] md:w-[708px] lg:left-auto lg:right-0 lg:h-[500px] lg:w-[704px]"
        />
        <div className="absolute left-0 z-0 h-[460px] w-[288px] bg-secondary md:h-[450px] md:w-[624px] lg:left-auto lg:right-0 lg:h-[429px] lg:w-[608px]"></div>
      </section>
      <section
        id="sectionTwo"
        className="flex w-full flex-col bg-white pt-[180px] font-light lg:grid lg:grid-cols-2 lg:pt-[400px]"
      >
        <Image
          loading="lazy"
          width={704}
          height={500}
          alt={`${sectionTwoImage.alt}`}
          src={builder.image(sectionTwoImage).width(704).height(500).url()}
          className="absolute left-0 h-[496px] w-[304px] translate-y-16 transform md:h-[600px] md:w-[708px] lg:h-[500px] lg:w-[704px]"
        />
        <div className="h-[460px] w-[288px] bg-secondary md:h-[450px] md:w-[624px] lg:h-[429px] lg:w-[608px]"></div>
        <div className="mx-[32px] flex w-[84%] flex-col justify-center pt-24 md:mx-[60px] md:pt-12 lg:mx-2.5 lg:-mt-8 lg:h-[500px] lg:w-[2/5] lg:pt-0">
          <h1 className="py-4 pt-14 text-base text-primary md:py-14 md:pt-64 md:text-[32px] lg:mb-12 lg:pt-0 lg:text-[40px]">
            {sectionTwoTitle}
          </h1>
          <p className="text-xs leading-5 text-primary md:text-sm md:leading-7 lg:col-span-1 lg:mx-0 lg:p-1 lg:text-base">
            {sectionTwoTextContent}
          </p>
        </div>
      </section>
      <section
        id="sectionThree"
        className="flex w-full flex-col bg-white pt-[180px] font-light lg:grid lg:grid-cols-2 lg:pt-[250px]"
      >
        <div className="mx-[32px] flex w-[90%] flex-col justify-center md:mx-[60px] md:w-[85%] md:pt-36 lg:mx-0 lg:w-[95%] lg:pl-40 lg:pt-0">
          <h1 className="pt-[600px] text-base leading-[52px] text-primary md:mb-12 md:text-[32px] lg:pt-20 lg:text-[40px]">
            {sectionThreeTitle}
          </h1>
          <p className="text-xs leading-5 text-primary md:text-sm md:leading-7 lg:col-span-1 lg:mx-0 lg:p-1 lg:pt-10 lg:text-base">
            {sectionThreeTextContent}
          </p>
        </div>
        <Image
          loading="lazy"
          width={704}
          height={500}
          alt={`${sectionThreeImage.alt}`}
          src={builder.image(sectionThreeImage).width(704).height(500).url()}
          className="absolute left-0 z-10 h-[496px] w-[304px] translate-y-16 transform md:h-[600px] md:w-[708px] lg:left-auto lg:right-0 lg:h-[500px] lg:w-[704px]"
        />
        <div className="absolute left-0 z-0 h-[460px] w-[288px] bg-secondary md:h-[450px] md:w-[624px] lg:left-auto lg:right-0 lg:h-[429px] lg:w-[608px]"></div>
      </section>
      <section
        id="sectionFour"
        className="flex w-full flex-col bg-white pt-[180px] font-light lg:grid lg:grid-cols-2 lg:pt-[400px]"
      >
        <Image
          loading="lazy"
          width={704}
          height={500}
          alt={`${sectionFourImage.alt}`}
          src={builder.image(sectionFourImage).width(704).height(500).url()}
          className="absolute left-0 h-[496px] w-[304px] translate-y-16 transform md:h-[600px] md:w-[708px] lg:h-[500px] lg:w-[704px]"
        />
        <div className="h-[460px] w-[288px] bg-secondary md:h-[450px] md:w-[624px] lg:h-[429px] lg:w-[608px]"></div>
        <div className="mx-[32px] flex w-[84%] flex-col justify-center pt-24 md:mx-[60px] md:pt-12 lg:mx-2.5 lg:-mt-8 lg:h-[500px] lg:w-[2/5] lg:pt-0">
          <h1 className="py-4 pt-14 text-base text-primary md:py-14 md:pt-64 md:text-[32px] lg:mb-12 lg:pt-0 lg:text-[40px]">
            {sectionFourTitle}
          </h1>
          <p className="text-xs leading-5 text-primary md:text-sm md:leading-7 lg:col-span-1 lg:mx-0 lg:p-1 lg:text-base">
            {sectionFourTextContent}
          </p>
        </div>
      </section>
      <section
        id="sectionFive"
        className="flex w-full flex-col bg-white pt-[180px] font-light lg:grid lg:grid-cols-2 lg:pt-[250px]"
      >
        <div className="mx-[32px] flex w-[90%] flex-col justify-center md:mx-[60px] md:w-[85%] md:pt-36 lg:mx-0 lg:w-[95%] lg:pl-40 lg:pt-0">
          <h1 className="pt-[600px] text-base leading-[52px] text-primary md:mb-12 md:text-[32px] lg:pt-20 lg:text-[40px]">
            {sectionFiveTitle}
          </h1>
          <p className="text-xs leading-5 text-primary md:text-sm md:leading-7 lg:col-span-1 lg:mx-0 lg:p-1 lg:pt-10 lg:text-base">
            {sectionFiveTextContent}
          </p>
        </div>
        <Image
          loading="lazy"
          width={704}
          height={500}
          alt={`${sectionFiveImage.alt}`}
          src={builder.image(sectionFiveImage).width(704).height(500).url()}
          className="absolute left-0 z-10 h-[496px] w-[304px] translate-y-16 transform md:h-[600px] md:w-[708px] lg:left-auto lg:right-0 lg:h-[500px] lg:w-[704px]"
        />
        <div className="absolute left-0 z-0 h-[460px] w-[288px] bg-secondary md:h-[450px] md:w-[624px] lg:left-auto lg:right-0 lg:h-[429px] lg:w-[608px]"></div>
      </section>
      <section
        id="sectionSix"
        className="flex w-full flex-col bg-white pt-[150px] font-light lg:grid lg:grid-cols-2 lg:pt-[400px]"
      >
        <Image
          loading="lazy"
          width={704}
          height={500}
          alt={`${sectionSixImage.alt}`}
          src={builder.image(sectionSixImage).width(704).height(500).url()}
          className="absolute left-0 h-[496px] w-[304px] translate-y-16 transform md:h-[600px] md:w-[708px] lg:h-[500px] lg:w-[704px]"
        />
        <div className="h-[460px] w-[288px] bg-secondary md:h-[450px] md:w-[624px] lg:h-[429px] lg:w-[608px]"></div>
        <div className="mx-[32px] flex w-[84%] flex-col justify-center pt-24 md:mx-[60px] md:pt-12 lg:mx-2.5 lg:w-[70%] lg:pt-0">
          <h1 className="py-4 pt-14 text-base leading-7 text-primary md:py-14 md:pt-64 md:text-[32px] lg:mb-6 lg:pt-20 lg:text-[40px]">
            {sectionSixTitle}
          </h1>
          <p className="text-xs leading-7 text-primary md:text-sm lg:col-span-1 lg:mx-0 lg:p-1 lg:text-base">
            {sectionSixTextContent}
          </p>
          <p className="pl-4 pt-8 text-xs leading-7 text-primary md:text-sm lg:text-base">
            <b className="font-bold">&#x2022; {sectionSixSubtitleOne}</b>
            {sectionSixSubtitleOneText}
          </p>
          <p className="pl-4 pt-8 text-xs leading-7 text-primary md:text-sm lg:text-base">
            <b className="font-bold">&#x2022; {sectionSixSubtitleTwo}</b>
            {sectionSixSubtitleTwoText}
          </p>
          <p className="pl-4 pt-8 text-xs leading-7 text-primary md:text-sm lg:text-base">
            <b className="font-bold">&#x2022; {sectionSixSubtitleThree}</b>
            {sectionSixSubtitleThreeText}
          </p>
        </div>
      </section>
      <section
        id="sectionSeven"
        className="relative w-full bg-white pt-[100px] font-light text-white md:pt-[160px]"
      >
        <Image
          width={1440}
          height={1040}
          alt={`${sectionSevenBgImage.alt}`}
          src={builder
            .image(sectionSevenBgImage)
            .width(1440)
            .height(1040)
            .url()}
          className="h-[1040px] w-full object-cover md:h-[792px] lg:h-[1040px]"
        />
        <div className="absolute top-[35%] flex h-[413px] w-3/4 transform flex-col justify-center bg-secondary text-center text-white md:top-[33%] md:h-[487px] lg:left-1/2 lg:top-[35%] lg:h-[484px] lg:w-2/3 lg:-translate-x-1/2">
          <div className="flex flex-col px-2 md:px-[30px]">
            <h1 className="leading:6 w-2/3 self-start text-left text-base md:text-[32px] md:leading-10 lg:self-center lg:text-center lg:text-[40px] lg:leading-[52px]">
              {sectionSevenTitle}
            </h1>
            <p className="text:left w-3/4 self-start py-6 text-left text-xs leading-5 md:py-8 md:text-sm md:leading-7 lg:self-center lg:py-14 lg:text-center lg:text-base">
              {sectionSevenTextContent}
            </p>
            <Link href={ctaUrl}>
              <p className="text:left self-start text-left text-sm italic md:text-lg md:hover:underline lg:self-center lg:text-center lg:text-2xl">
                {sectionSevenCta}
              </p>
            </Link>
            <a
              href={esgLink}
              target="blank"
              className="self-start pt-8 lg:self-center"
            >
              <Button className="rounded-none bg-white text-xs font-light leading-4 text-primary transition-all duration-300 hover:bg-primary hover:text-white md:text-base lg:text-xl">
                {sectionSevenEsg}
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
