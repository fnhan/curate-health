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
            <div className="absolute left-1/2 top-1/2 z-10 h-[56.25vw] min-h-full w-full min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 bg-black" />
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
      <div className="z-20 py-20 text-center">
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
      className="absolute left-1/2 top-1/2 z-10 h-[56.25vw] min-h-full w-full min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 object-cover"
    />
  );
}

async function VimeoIframe({ videoID }: { videoID: string }) {
  const videoSrc = `https://player.vimeo.com/video/${videoID}?muted=1&autoplay=1&autopause=0&pip=0&controls=0&loop=1&background=1&quality=auto&transparent=1&background=0`;

  return (
    <iframe
      src={videoSrc}
      allow="autoplay; fullscreen; picture-in-picture"
      loading="lazy"
      className="absolute left-1/2 top-1/2 z-20 h-[56.25vw] min-h-full w-full min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 bg-transparent"
      title="Background video"
      style={{ backgroundColor: "transparent" }}
    />
  );
}
