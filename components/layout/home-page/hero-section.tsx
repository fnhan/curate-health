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

  const videoSrc = `https://player.vimeo.com/video/${videoID}?muted=1&autoplay=1&autopause=0&pip=0&controls=0&loop=1&background=1&quality=undefined&app_id=58479&texttrack=undefined`;

  return (
    <section className="relative flex aspect-video min-h-[600px] flex-col items-center justify-center overflow-hidden py-40 text-white">
      <div className="absolute left-0 top-0 h-full w-full overflow-hidden">
        <iframe
          src={videoSrc}
          allow="autoplay; fullscreen; picture-in-picture"
          className="absolute left-1/2 top-1/2 z-[-10] h-[56.25vw] min-h-full w-full min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2"
          title="curate-health-home-video"
        ></iframe>
      </div>
      <div className="z-10 py-20 text-center">
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
