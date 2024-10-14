import imageUrlBuilder from '@sanity/image-url';
import Image from 'next/image';
import { Loading } from 'components/Loading';
import { dataset, projectId } from '../../../sanity/env';

const builder = imageUrlBuilder({ projectId, dataset });

export default function OurStory({ ourStory }) {

  if (!ourStory) {
    return <Loading />;
  }
  
  const {
    headerTitle,
    headerTitleDesktop,
    headerSubtitle,
    headerSubtitleDesktop,
    sectionOneTextContent,
    sectionOneTitle,
    sectionTwoTextContent,
    sectionThreeTextContent,
    sectionThreeTitle,
    sectionFourTextContent,
    sectionFiveTextContent,
    sectionFiveTitle,
    sectionSixTextContent,
    sectionSixTitle,
    sectionSevenCta,
    SectionSevenTextContent,
    SectionSevenTitle,
    sectionOneImage,
    sectionTwoImage,
    sectionThreeImage,
    sectionFourImage,
    sectionFiveImage,
    sectionSixImage,
    sectionSevenImage,
    headerBgImage,
  } = ourStory;

  return (
    <>
      <section className='relative bg-white h-[524px] md:h-[960px] flex justify-center'>
        <div className='font-thin'>
        <Image
          width={608}
          height={997}
          alt={`${headerBgImage.alt}`}
          src={builder.image(headerBgImage).width(1440).height(936).url()}
          className='object-cover w-full h-[690px] md:w-[317px] md:h-[792px] lg:w-[608px] lg:h-[997px] absolute right-0'
        />
        <div className='absolute inset-0 flex flex-col pt-12 bg-secondary 
      h-[450px] md:h-[412px] lg:h-[520px] top-[50px] md:top-[336px] lg:top-[250px]'>
          <h1 className='block lg:hidden text-2xl md:text-4xl leading-8 md:leading-10 ml-[32px] md:ml-[60px] pb-4 md:pb-6'>{headerTitle}</h1>
          <h1 className='hidden lg:block w-[798px] text-7xl ml-[160px] top-[408px] pb-8'>{headerTitleDesktop}</h1>
          <p className='hidden lg:block leading-7 text-base w-[832px] 
          ml-[160px]'
          >
            {headerSubtitleDesktop}
          </p>
          <p className='block lg:hidden leading-5 md:leading-6 text-xs md:text-sm
          mx-[32px] md:mx-[60px]'
          >
            {headerSubtitle}
          </p>
        </div>
        </div>
      </section>
    </>
  );

}

