import { PortableText } from '@portabletext/react';
import PrimaryCTAButton from 'components/shared/primary-cta';
import {
  HERO_SECTION_QUERYResult,
  PRIMARY_CTA_BUTTON_QUERYResult,
} from 'sanity.types';

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
    <section className='relative flex justify-center items-center flex-col text-white overflow-hidden h-[600px] 2xl:h-[1080px]'>
      <div className='absolute top-0 left-0 w-full h-full overflow-hidden -mt-4'>
        <iframe
          src={videoSrc}
          allow='autoplay; fullscreen; picture-in-picture'
          className='absolute top-1/2 left-1/2 w-full h-[56.25vw] min-h-full min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 z-[-10]'
          title='curate-health-home-video'></iframe>
      </div>
      <div className='z-10 text-center'>
        <h1 className='text-[32px] md:text-[42px] 2xl:text-[72px] mb-6'>
          <PortableText value={heroText!} />
        </h1>
        <div className='flex justify-center text-white text-secondary font-thin text-[150px] h-[250px]'>
          |
        </div>
        <PrimaryCTAButton cta={primaryCTAButton?.ctaButton} />
      </div>
    </section>
  );
}
