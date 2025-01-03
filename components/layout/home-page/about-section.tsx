"use client";

import Image from "next/image";

import HoverLink from "components/shared/hover-link";
import { motion, useScroll, useTransform } from "framer-motion";
import highlightCircleText from "public/images/CircleText.png";
import { ABOUT_SECTION_QUERYResult } from "sanity.types";

export default function AboutSection({
  aboutSection,
}: {
  aboutSection: ABOUT_SECTION_QUERYResult;
}) {
  if (!aboutSection) return null;

  const { title1, title2, aboutImage, hoverLinkText, hoverLinkHref } =
    aboutSection;

  const { scrollYProgress } = useScroll();
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 540]);

  return (
    <section className="w-full bg-primary">
      <div className="container flex flex-col gap-20 py-12 text-left md:py-40">
        <div className="z-20 max-w-prose md:sticky md:top-60 md:pt-2">
          <p className="max-w-[250px] font-light md:max-w-[350px] md:text-2xl 2xl:max-w-[555px] 2xl:text-[40px] 2xl:leading-10">
            {title1}
          </p>
        </div>
        <div className="flex justify-center">
          <div className="relative inline-block">
            <Image
              width={536}
              height={536}
              alt={aboutImage?.alt || ""}
              src={aboutImage?.asset?.url!}
              className="w-[250px] md:w-[375px] 2xl:w-[536px]"
            />
            <motion.div
              className="absolute -right-10 -top-5 md:-right-20 2xl:-right-32"
              style={{ rotate }}
            >
              <Image
                src={highlightCircleText}
                width={287}
                height={287}
                alt=""
                className="w-[107px] md:w-[165px] 2xl:w-[287px]"
              />
            </motion.div>
          </div>
        </div>
        <div className="flex justify-end">
          <p className="max-w-[250px] font-light md:max-w-[350px] md:text-2xl 2xl:max-w-[555px] 2xl:text-[40px] 2xl:leading-10">
            {title2}
          </p>
        </div>
      </div>
      <HoverLink href={hoverLinkHref || ""} text={hoverLinkText || ""} />
    </section>
  );
}
