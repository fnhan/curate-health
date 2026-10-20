"use client";

import Image from "next/image";
import { memo, useEffect, useState } from "react";

import { PortableText } from "@portabletext/react";

import { portableTextComponents } from "@/components/shared/portable-text-components";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// Memoized component for the pillar title
const PillarTitle = memo(({ title }: { title: string }) => (
  <h2 className="mb-6 text-2xl font-medium">{title}</h2>
));

PillarTitle.displayName = "PillarTitle";

// Memoized component for the pillar content
const PillarContent = memo(({ content }: { content: any }) => (
  <div className="prose">
    <PortableText value={content!} components={portableTextComponents} />
  </div>
));

PillarContent.displayName = "PillarContent";

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

  const [textContent, setTextContent] = useState(pillars?.[0]?.description);
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
    // Map to specific clock positions: 1, 3, 5, 7, 9, 11 o'clock
    const clockPositions = [1.5, 3, 4.5, 7.5, 9, 10.5];
    const clockPosition = clockPositions[index % clockPositions.length];

    // Convert clock position to angle (12 o'clock = 0°, 3 o'clock = 90°, etc.)
    const angle = clockPosition * 30 - 90; // 30° per hour, -90° to start from 12 o'clock
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
                <PortableText
                  value={pillar.description!}
                  components={portableTextComponents}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      {/* Tablet */}
      <div className="hidden sm:block">
        <div className="flex items-center gap-2 sm:flex-col lg:flex-row">
          <div className="flex-1">
            <div
              className="relative mx-auto rounded-full"
              style={{
                width: `${circleSize}px`,
                height: `${circleSize}px`,
              }}
            >
              {/* Static background image - doesn't re-render */}
              <div className="absolute inset-0 mx-auto flex items-center justify-center text-balance p-20 text-center text-sm italic md:text-base 2xl:text-lg">
                <Image
                  src={block_4_image!}
                  alt=""
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="h-full w-full object-cover"
                />
              </div>
              {pillars?.map((pillar: any, index: number) => (
                <button
                  onMouseEnter={() =>
                    displayText(pillar.description, pillar.title)
                  }
                  onClick={() => displayText(pillar.description, pillar.title)}
                  className={`absolute size-32 rounded-full border border-2 border-primary px-2 transition-all duration-300 lg:size-40 lg:text-lg ${
                    activePillar === pillar.title
                      ? "bg-[#C2C6BA]"
                      : "bg-platinum text-primary"
                  }`}
                  key={pillar.title}
                  style={calculatePosition(index, pillars.length)}
                >
                  {pillar.title}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-22 max-w-lg flex-1 lg:pl-8 lg:pr-4">
            <PillarTitle title={activePillar} />
            <PillarContent content={textContent} />
          </div>
        </div>
      </div>
    </section>
  );
}
