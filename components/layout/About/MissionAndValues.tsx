import Image from "next/image";
import Link from "next/link";

import imageUrlBuilder from "@sanity/image-url";
import { Loading } from "components/Loading";

import { dataset, projectId } from "../../../sanity/env";
import styles from "../../../styles/CarouselNav.module.css";

const builder = imageUrlBuilder({ projectId, dataset });

export default function MissionAndValues({ missionAndValues, aboutPages }) {
  if (!missionAndValues) {
    return <Loading />;
  }

  const {
    headerImage,
    purposeTitle,
    purposeTextContent,
    missionTitle,
    missionTextContent,
    visionTitle,
    visionTextContent,
    purposeImage,
    missionImage,
    visionImage,
  } = missionAndValues;

  return (
    <div className="flex w-full flex-col font-light">
      <section
        id="headerSection"
        className="relative w-full bg-white font-light"
      >
        <Image
          loading="lazy"
          width={1440}
          height={608}
          alt={`${headerImage.alt}`}
          src={builder.image(headerImage).width(1440).height(608).url()}
          className="h-[360px] w-full md:h-[603px] lg:h-[608px]"
        />
        <div className="h-[68px] bg-[#C3C7BB] backdrop-blur-3xl lg:h-[78px]">
          <div className="h-[68px] bg-[#C3C7BB] backdrop-blur-3xl lg:h-[78px]">
            <div
              className={`container -mt-8 overflow-x-auto whitespace-nowrap md:-mt-0 ${styles.customScrollbar}`}
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
                          className={`border-none bg-transparent ${aboutPage.title === "Mission & Values" ? "text-primary underline underline-offset-[6.5px] lg:underline-offset-[7.25px]" : ""}`}
                        >
                          <div className="-mx-4 items-center justify-center p-4 px-6 text-[12px] font-light leading-[14px] text-primary md:p-6 lg:text-[14px]">
                            {aboutPage.title}
                            <div
                              className={`${aboutPage.title !== "Mission & Values" ? "mt-1 w-0 bg-primary transition-all duration-500 group-hover:w-full md:h-[0.5px] lg:h-[1.35px]" : ""}`}
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
      </section>
      <section
        id="purpose"
        className="flex w-full flex-col bg-white pt-[80px] font-light md:pt-[100px] lg:grid lg:grid-cols-2 lg:pb-[100px] lg:pt-[160px]"
      >
        <Image
          loading="lazy"
          width={704}
          height={500}
          alt={`${purposeImage.alt}`}
          src={builder.image(purposeImage).width(704).height(500).url()}
          className="absolute right-0 h-[460px] w-[288px] translate-y-16 transform md:left-0 md:h-[600px] md:w-[708px] lg:h-[500px] lg:w-[704px]"
        />
        <div className="h-[460px] w-[288px] bg-secondary md:h-[450px] md:w-[624px] lg:h-[429px] lg:w-[608px]"></div>
        <div className="mx-[32px] flex w-[84%] flex-col justify-center pt-10 md:mx-[60px] lg:mx-0 lg:h-[500px] lg:w-[2/5] lg:pt-0">
          <h1 className="py-4 pt-14 text-base text-primary md:py-14 md:pt-64 md:text-[32px] lg:mb-12 lg:pt-0 lg:text-[40px]">
            {purposeTitle}
          </h1>
          <p className="text-xs leading-5 text-primary md:text-sm md:leading-7 lg:col-span-1 lg:mx-0 lg:p-1 lg:text-base">
            {purposeTextContent}
          </p>
        </div>
      </section>
      <section
        id="mission"
        className="flex w-full flex-col bg-white pt-[80px] font-light md:pt-[100px] lg:grid lg:grid-cols-2 lg:pb-[100px] lg:pt-[200px]"
      >
        <div className="mx-[32px] mt-48 flex w-[84%] flex-col justify-center pt-80 md:mx-[60px] md:mt-10 lg:mx-0 lg:h-[500px] lg:w-[2/5] lg:pl-40 lg:pt-0">
          <h1 className="py-4 pt-14 text-base text-primary md:py-14 md:pt-96 md:text-[32px] lg:mb-12 lg:pt-0 lg:text-[40px]">
            {missionTitle}
          </h1>
          <p className="text-xs leading-5 text-primary md:text-sm md:leading-7 lg:col-span-1 lg:w-[544px] lg:p-1 lg:text-base">
            {missionTextContent}
          </p>
        </div>
        <Image
          loading="lazy"
          width={704}
          height={500}
          alt={`${missionImage.alt}`}
          src={builder.image(missionImage).width(704).height(500).url()}
          className="absolute left-0 z-10 h-[460px] w-[288px] translate-y-16 transform md:right-0 md:h-[600px] md:w-[708px] lg:left-auto lg:h-[500px] lg:w-[704px]"
        />
        <div className="absolute right-0 z-0 h-[460px] w-[288px] bg-secondary md:h-[450px] md:w-[624px] lg:h-[429px] lg:w-[608px]"></div>
      </section>
      <section
        id="vision"
        className="flex w-full flex-col bg-white pt-[80px] font-light md:pt-[100px] lg:grid lg:grid-cols-2 lg:py-[200px]"
      >
        <Image
          loading="lazy"
          width={704}
          height={500}
          alt={`${visionImage.alt}`}
          src={builder.image(visionImage).width(704).height(500).url()}
          className="absolute right-0 h-[460px] w-[288px] translate-y-16 transform md:left-0 md:h-[600px] md:w-[708px] lg:h-[500px] lg:w-[704px]"
        />
        <div className="h-[460px] w-[288px] bg-secondary md:h-[450px] md:w-[624px] lg:h-[429px] lg:w-[608px]"></div>
        <div className="mx-[32px] flex w-[84%] flex-col justify-center pt-14 md:mx-[60px] md:mt-2 md:pt-56 lg:mx-0 lg:h-[500px] lg:w-[2/5] lg:pt-0">
          <h1 className="py-4 pt-14 text-base text-primary md:py-14 md:text-[32px] lg:mb-12 lg:text-[40px]">
            {visionTitle}
          </h1>
          <p className="mb-44 text-xs leading-5 text-primary md:text-sm md:leading-7 lg:col-span-1 lg:mx-0 lg:mb-0 lg:p-1 lg:text-base">
            {visionTextContent}
          </p>
        </div>
      </section>
    </div>
  );
}
