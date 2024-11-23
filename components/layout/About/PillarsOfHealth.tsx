import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import imageUrlBuilder from "@sanity/image-url";
import { Loading } from "components/Loading";

import { dataset, projectId } from "../../../sanity/env";
import styles from "../../../styles/CarouselNav.module.css";

const builder = imageUrlBuilder({ projectId, dataset });

export default function PillarsofHealth({ pillarsOfHealth, aboutPages }) {
  const [textContent, setTextContent] = useState("");
  if (!pillarsOfHealth) {
    return <Loading />;
  }

  const {
    pageTitle,
    pageSubtitle,
    headerBgImage,
    mentalHealthTitle,
    mentalHealthTextContent,
    emotionalHealthTitle,
    emotionalHealthTextContent,
    socialHealthTitle,
    socialHealthTextContent,
    spiritualHealthTitle,
    spiritualHealthTextContent,
    physicalHealthTitle,
    physicalHealthTextContent,
  } = pillarsOfHealth;

  function displayText(pillar: string) {
    setTextContent(pillar);
  }

  return (
    <div className="flex w-full flex-col font-light">
      <section
        id="headerSection"
        className="relative w-full bg-primary font-light"
      >
        <Image
          loading="lazy"
          width={1440}
          height={690}
          alt={`${headerBgImage.alt}`}
          src={builder.image(headerBgImage).width(1440).height(690).url()}
          className="h-[354px] w-full object-cover md:h-[450px] lg:h-[690px]"
        />
        <div className="h-[48px] bg-[#C3C7BB] backdrop-blur-3xl md:h-[68px] lg:h-[78px]">
          <div className="h-[78px] bg-[#C3C7BB] backdrop-blur-3xl md:h-[68px] lg:h-[78px]">
            <div
              className={`container -mt-2.5 overflow-x-auto whitespace-nowrap md:-mt-0 ${styles.customScrollbar}`}
            >
              <div className="flex">
                <div className="-mr-8">
                  <div className="group p-1">
                    <Link href="/about/our-story">
                      <div className="flex border-none bg-transparent">
                        <div className="-ml-6 p-6 text-[12px] font-light leading-[14px] text-primary lg:text-[14px]">
                          About
                          <div className="mt-1 w-0 bg-primary transition-all duration-500 group-hover:w-full md:h-[0.5px] lg:h-[1.35px]"></div>
                        </div>
                        <div className="mx-3 -ml-6 p-6 font-light leading-[14px] text-primary lg:inline">
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
                          className={`border-none bg-transparent ${aboutPage.title === "Pillars of Health" ? "text-primary underline underline-offset-[7px] lg:underline-offset-[7.5px]" : ""}`}
                        >
                          <div className="-ml-4 -mr-4 items-center justify-center p-6 text-[12px] font-light leading-[14px] text-primary lg:text-[14px]">
                            {aboutPage.title}
                            <div
                              className={`${aboutPage.title !== "Pillars of Health" ? "mt-1 w-0 bg-primary transition-all duration-500 group-hover:w-full md:h-[0.5px] lg:h-[1.35px]" : ""}`}
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
      <section id="titleSection">
        <h1 className="flex justify-center pt-24 text-2xl font-light leading-8 text-white md:text-5xl md:leading-10 lg:pt-32 lg:text-7xl lg:leading-[72px]">
          {pageTitle}
        </h1>
        <h2 className="text:sm m-auto hidden w-[621px] pl-1 pt-8 text-center italic leading-10 md:block md:text-xl lg:w-[736px] lg:text-3xl">
          {pageSubtitle}
        </h2>
      </section>
      <section
        id="pageContent"
        className="container flex w-full flex-col py-20 md:py-32"
      >
        <div className="flex flex-col items-center justify-center lg:ml-8 lg:flex-row lg:items-start lg:justify-start">
          <div
            id="outterCircle"
            className="flex aspect-square h-[237px] items-center justify-center rounded-full border md:h-[450px] lg:flex-row lg:justify-between"
          >
            <p
              id="textContent"
              className="w-[120px] text-center text-[9px] italic leading-3 md:w-[265px] md:text-sm md:leading-4 lg:w-[450px] lg:translate-x-[40rem] lg:transform lg:text-left lg:text-2xl lg:leading-7"
            >
              {textContent}
            </p>
          </div>
          <div
            className="absolute top-[680px] flex aspect-square h-[78px] cursor-pointer items-center justify-center rounded-full border border-white bg-primary transition-all duration-300 hover:bg-white hover:text-primary focus:bg-white focus:text-primary md:top-[940px] md:h-[145px] lg:top-[1310px] lg:translate-x-[9.5rem] lg:transform"
            onClick={() => displayText(mentalHealthTextContent)}
            onMouseEnter={() => displayText(mentalHealthTextContent)}
            onMouseLeave={() => displayText("")}
          >
            <span className="flex text-center text-xs md:text-lg lg:text-2xl">
              {mentalHealthTitle}
            </span>
          </div>
          <div
            className="absolute top-[750px] flex aspect-square h-[78px] translate-x-[6.5rem] transform cursor-pointer items-center justify-center rounded-full border border-white bg-primary transition-all duration-300 hover:bg-white hover:text-primary focus:bg-white focus:text-primary md:top-[1050px] md:h-[145px] md:translate-x-[12.5rem] lg:top-[1450px] lg:translate-x-[22rem]"
            onClick={() => displayText(emotionalHealthTextContent)}
            onMouseEnter={() => displayText(emotionalHealthTextContent)}
            onMouseLeave={() => displayText("")}
          >
            <span className="flex text-center text-xs md:text-lg lg:text-2xl">
              {emotionalHealthTitle}
            </span>
          </div>
          <div
            className="absolute top-[890px] flex aspect-square h-[78px] translate-x-16 transform cursor-pointer items-center justify-center rounded-full border border-white bg-primary transition-all duration-300 hover:bg-white hover:text-primary focus:bg-white focus:text-primary md:top-[1295px] md:h-[145px] md:translate-x-[135px] lg:top-[1705px] lg:translate-x-[17.5rem]"
            onClick={() => displayText(socialHealthTextContent)}
            onMouseEnter={() => displayText(socialHealthTextContent)}
            onMouseLeave={() => displayText("")}
          >
            <span className="flex text-center text-xs md:text-lg lg:text-2xl">
              {socialHealthTitle}
            </span>
          </div>
          <div
            className="absolute top-[890px] flex aspect-square h-[78px] -translate-x-16 transform cursor-pointer items-center justify-center rounded-full border border-white bg-primary transition-all duration-300 hover:bg-white hover:text-primary focus:bg-white focus:text-primary md:top-[1295px] md:h-[145px] md:-translate-x-[135px] lg:top-[1705px] lg:translate-x-[2rem]"
            onClick={() => displayText(spiritualHealthTextContent)}
            onMouseEnter={() => displayText(spiritualHealthTextContent)}
            onMouseLeave={() => displayText("")}
          >
            <span className="flex text-center text-xs md:text-lg lg:text-2xl">
              {spiritualHealthTitle}
            </span>
          </div>
          <div
            className="absolute top-[750px] flex aspect-square h-[78px] -translate-x-[6.5rem] transform cursor-pointer items-center justify-center rounded-full border border-white bg-primary transition-all duration-300 hover:bg-white hover:text-primary focus:bg-white focus:text-primary md:top-[1050px] md:h-[145px] md:-translate-x-[12.5rem] lg:top-[1450px] lg:-translate-x-12"
            onMouseEnter={() => displayText(physicalHealthTextContent)}
            onMouseLeave={() => displayText("")}
            onClick={() => displayText(physicalHealthTextContent)}
          >
            <span className="flex text-center text-xs md:text-lg lg:text-2xl">
              {physicalHealthTitle}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
