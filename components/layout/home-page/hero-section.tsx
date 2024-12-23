import { Suspense } from "react";

import { PortableText } from "@portabletext/react";
import PrimaryCTAButton from "components/shared/primary-cta-button";
import {
  HERO_SECTION_QUERYResult,
  PRIMARY_CTA_BUTTON_QUERYResult,
} from "sanity.types";

import HeroBgVideo from "./hero-bg-video";

export default function HeroSection({
  heroSection,
  primaryCTAButton,
}: {
  heroSection: HERO_SECTION_QUERYResult;
  primaryCTAButton: PRIMARY_CTA_BUTTON_QUERYResult;
}) {
  if (!heroSection) return null;

  const { heroText, videoFile } = heroSection;

  return (
    <section className="relative flex aspect-video min-h-[600px] flex-col items-center justify-center overflow-hidden py-40 text-white">
      <div className="absolute left-0 top-0 h-full w-full overflow-hidden">
        {/* Thumbnail loads first */}
        <Suspense
          fallback={
            <div className="absolute inset-0 z-10 h-full w-full bg-black" />
          }
        >
          {/* @ts-ignore */}
          <ThumbnailBackground playbackId={videoFile?.asset?.playbackId!} />
        </Suspense>
        {/* Video loads on top with transparent background */}
        <Suspense fallback={null}>
          <div className="absolute inset-0 h-full w-full">
            {/* @ts-ignore */}
            <HeroBgVideo playbackId={videoFile?.asset?.playbackId!} />
          </div>
        </Suspense>
      </div>
      <div className="container z-20 py-20 text-center">
        <h1 className="mb-6 text-pretty text-[32px] md:text-[42px] 2xl:text-[72px]">
          <PortableText value={heroText!} />
        </h1>
        <div className="flex h-[250px] justify-center text-[150px] font-thin text-secondary text-white">
          |
        </div>
        <PrimaryCTAButton primaryCTAButton={primaryCTAButton} size="xl" />
      </div>
    </section>
  );
}

async function ThumbnailBackground({ playbackId }: { playbackId: string }) {
  const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg?time=0`;

  if (!playbackId) return null;

  return (
    <img
      src={thumbnailUrl}
      alt=""
      className="absolute inset-0 h-full w-full object-cover md:left-1/2 md:top-1/2 md:h-[56.25vw] md:min-h-full md:min-w-[177.77vh] md:-translate-x-1/2 md:-translate-y-1/2"
    />
  );
}
