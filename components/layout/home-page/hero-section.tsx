import { Suspense } from "react";

import { PortableText } from "@portabletext/react";
import PrimaryCTAButton from "components/shared/primary-cta-button";
import {
  HERO_SECTION_QUERYResult,
  PRIMARY_CTA_BUTTON_QUERYResult,
} from "sanity.types";

export default function HeroSection({
  heroSection,
  primaryCTAButton,
}: {
  heroSection: HERO_SECTION_QUERYResult;
  primaryCTAButton: PRIMARY_CTA_BUTTON_QUERYResult;
}) {
  if (!heroSection) return null;

  const { videoID, heroText } = heroSection;

  return (
    <section className="relative flex aspect-video min-h-[600px] flex-col items-center justify-center overflow-hidden py-40 text-white">
      <div className="absolute left-0 top-0 h-full w-full overflow-hidden">
        {/* Thumbnail loads first */}
        <Suspense
          fallback={
            <div className="absolute inset-0 z-10 h-full w-full bg-black md:left-1/2 md:top-1/2 md:h-[56.25vw] md:min-h-full md:min-w-[177.77vh] md:-translate-x-1/2 md:-translate-y-1/2" />
          }
        >
          <ThumbnailBackground videoID={videoID!} />
        </Suspense>

        {/* Video loads on top with transparent background */}
        <Suspense fallback={null}>
          <div className="bg-transparent">
            <VimeoIframe videoID={videoID!} />
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

async function ThumbnailBackground({ videoID }: { videoID: string }) {
  const thumbnailResponse = await fetch(
    `https://vimeo.com/api/v2/video/${videoID}.json`
  );
  const thumbnailData = await thumbnailResponse.json();
  const thumbnailUrl = thumbnailData[0]?.thumbnail_large;

  if (!thumbnailUrl) return null;

  return (
    <img
      src={thumbnailUrl}
      alt=""
      className="absolute inset-0 h-full w-full object-cover md:left-1/2 md:top-1/2 md:h-[56.25vw] md:min-h-full md:min-w-[177.77vh] md:-translate-x-1/2 md:-translate-y-1/2"
    />
  );
}

async function VimeoIframe({ videoID }: { videoID: string }) {
  const videoSrc = `https://player.vimeo.com/video/${videoID}?muted=1&autoplay=1&autopause=0&pip=0&controls=0&loop=1&background=1&quality=auto&transparent=1`;

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden">
      <iframe
        src={videoSrc}
        allow="autoplay; fullscreen; picture-in-picture"
        className="absolute left-1/2 top-1/2 h-[100vh] w-[177.77vh] -translate-x-1/2 -translate-y-1/2 object-cover"
        title="curate-health-home-video"
      />
    </div>
  );
}
