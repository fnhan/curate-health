"use client";

import { useEffect, useState } from "react";

import { PortableText } from "@portabletext/react";
import { AnimatePresence, motion } from "framer-motion";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Image from "next/image";

export default function PillarsModified({
  pillars,
  block_4_image,
}: {
  pillars: any[];
  block_4_image: string;
}) {
  if (!pillars) {
    return null;
  }

  const [textContent, setTextContent] = useState(
    pillars?.[0]?.description
  );
  const [activePillar, setActivePillar] = useState(pillars?.[0]?.title);
  const [circleSize, setCircleSize] = useState(500);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const isLargeScreen = useMediaQuery("(min-width: 1536px)");

  useEffect(() => {
    // Get the smallest dimension between window width and height
    const viewportSmallestDimension = Math.min(
      window.innerWidth,
      window.innerHeight
    );

    if (isLargeScreen) {
      setCircleSize(Math.min(550, viewportSmallestDimension * 0.7));
    } else if (!isTablet) {
      setCircleSize(Math.min(450, viewportSmallestDimension * 0.7));
    } else if (!isMobile) {
      setCircleSize(Math.min(500, viewportSmallestDimension * 0.7));
    } else {
      setCircleSize(0);
    }
  }, [isMobile, isTablet, isLargeScreen]);

  function displayText(pillarDescription: any, pillarName: string) {
    setTextContent(pillarDescription);
    setActivePillar(pillarName);
  }

  const calculatePosition = (index: number, total: number) => {
    const angle = (index * 360) / total - 90;
    const radius = circleSize / 2;
    const radian = (angle * Math.PI) / 180;

    return {
      left: `${radius + radius * Math.cos(radian)}px`,
      top: `${radius + radius * Math.sin(radian)}px`,
      transform: "translate(-50%, -50%)",
    };
  };

  return (
    <section className="flex w-full flex-col sm:py-20">
      {/* Mobile */}
      <div className="sm:hidden">
        <Accordion type="single" collapsible>
          {pillars?.map((pillar: any) => (
            <AccordionItem key={pillar.title} value={pillar.title}>
              <AccordionTrigger>{pillar.title}</AccordionTrigger>
              <AccordionContent>
                <PortableText value={pillar.description!} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      {/* Tablet */}
      <div className="hidden sm:block">
        <div className="flex sm:flex-col lg:flex-row gap-2 items-center">
          <div className="flex-1">
            <div
              className="relative mx-auto rounded-full"
              style={{
                width: `${circleSize}px`,
                height: `${circleSize}px`,
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePillar}
                  // initial={{ opacity: 0, y: 10 }}
                  // animate={{ opacity: 1, y: 0 }}
                  // exit={{ opacity: 0, y: -10 }}
                  // transition={{ duration: 0.2 }}
                  className="p-20 absolute inset-0 mx-auto flex items-center justify-center text-balance text-center text-sm italic  md:text-base 2xl:text-lg"
                >
                  <Image
                    src={block_4_image!}
                    alt=""
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="object-cover w-full h-full"
                  />
                </motion.div>
              </AnimatePresence>
              {pillars?.map((pillar: any, index: number) => (
                <button
                  onMouseEnter={() =>
                    displayText(pillar.description, pillar.title)
                  }
                  onClick={() =>
                    displayText(pillar.description, pillar.title)
                  }
                  className={`absolute size-32 rounded-full border border-2 px-2 border-primary transition-all duration-300 lg:text-lg lg:size-40 ${activePillar === pillar.title
                    ? "bg-[#C2C6BA]"
                    : "text-primary bg-platinum"
                    }`}
                  key={pillar.title}
                  style={calculatePosition(index, pillars.length)}
                >
                  {pillar.title}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 max-w-lg mt-22 lg:pl-8 lg:pr-4">
            <h2 className="text-2xl font-medium mb-6">{activePillar}</h2>
            <div className="prose">
              <PortableText value={textContent!} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
