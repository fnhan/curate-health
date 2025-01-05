"use client";

import { useEffect, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { PILLARS_OF_HEALTH_QUERYResult } from "@/sanity.types";

export default function Pillars({
  pillarsOfHealth,
}: {
  pillarsOfHealth: PILLARS_OF_HEALTH_QUERYResult;
}) {
  if (!pillarsOfHealth) {
    return null;
  }

  const { pillars } = pillarsOfHealth;
  const [textContent, setTextContent] = useState(
    pillars?.[0]?.pillarDescription
  );
  const [activePillar, setActivePillar] = useState(pillars?.[0]?.pillarName);
  const [circleSize, setCircleSize] = useState(540);
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
      setCircleSize(Math.min(800, viewportSmallestDimension * 0.7));
    } else if (!isTablet) {
      setCircleSize(Math.min(640, viewportSmallestDimension * 0.7));
    } else if (!isMobile) {
      setCircleSize(Math.min(448, viewportSmallestDimension * 0.7));
    } else {
      setCircleSize(0);
    }
  }, [isMobile, isTablet, isLargeScreen]);

  function displayText(pillarDescription: string, pillarName: string) {
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
            <AccordionItem key={pillar.pillarName} value={pillar.pillarName}>
              <AccordionTrigger>{pillar.pillarName}</AccordionTrigger>
              <AccordionContent>{pillar.pillarDescription}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      {/* Tablet */}
      <div className="hidden sm:block">
        <div
          className="relative mx-auto rounded-full border border-white"
          style={{
            width: `${circleSize}px`,
            height: `${circleSize}px`,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={textContent}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 mx-auto flex w-1/2 items-center justify-center text-balance text-center text-sm italic text-white md:text-base 2xl:text-lg"
            >
              {textContent}
            </motion.div>
          </AnimatePresence>
          {pillars?.map((pillar: any, index: number) => (
            <button
              onMouseEnter={() =>
                displayText(pillar.pillarDescription, pillar.pillarName)
              }
              onClick={() =>
                displayText(pillar.pillarDescription, pillar.pillarName)
              }
              className={`absolute size-32 rounded-full border border-white transition-all duration-300 md:text-lg lg:size-40 ${
                activePillar === pillar.pillarName
                  ? "border-secondary bg-secondary text-white"
                  : "bg-white text-primary hover:bg-primary hover:text-white"
              }`}
              key={pillar.pillarName}
              style={calculatePosition(index, pillars.length)}
            >
              {pillar.pillarName}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
