import imageUrlBuilder from '@sanity/image-url';
import Image from 'next/image';
import { Loading } from 'components/Loading';
import { dataset, projectId } from '../../../sanity/env';
import sustainability from '../../../sanity/schemas/sustainability';

const builder = imageUrlBuilder({ projectId, dataset });

export default function Sustainability({ sustainability }) {

  if (!sustainability) {
    return <Loading />;
  }

  const {
    headerTopImage,
    headerBottomImage,
    headerTitle,
    headerTextContent,
    sectionOneImage,
    sectionTwoImage,
    sectionTwoTextContent,
    sectionThreeTextContent,
    sectionFourImage,
  } = sustainability;

  return (
    <div className='flex flex-col w-full bg-white'>
      <section id="headerSection" className='relative bg-white flex flex-col font-light h-[604px] md:h-[798px] lg:h-[915px] w-full text-primary'>
        <Image
          loading='lazy'
          width={322}
          height={322}
          alt={`${headerTopImage.alt}`}
          src={builder.image(headerTopImage).width(322).height(322).url()}
          className='w-[124px] h-[124px] md:w-[294px] md:h-[294px] lg:w-[322px] lg:h-[322px] absolute top-[90px] left-8 md:left-[60px]
          lg:left-[640px] lg:top-[152px]'
        />
        <Image
          loading='lazy'
          width={322}
          height={322}
          alt={`${headerBottomImage.alt}`}
          src={builder.image(headerBottomImage).width(322).height(322).url()}
          className='w-[124px] h-[124px] md:w-[294px] md:h-[294px] lg:w-[322px] lg:h-[322px] absolute top-48 md:top-[388px] 
          lg:top-[440px] right-0'
        />
        <div className='flex flex-col'>
          <h1 className='text-2xl md:text-5xl lg:text-7xl leading-8 md:leading-10 lg:leading-[72px] flex absolute 
          top-[329px] md:top-[470px] lg:top-[674px] left-[32px] md:left-[60px] lg:left-[448px]'>
            {headerTitle}
          </h1>
          <p className='leading-5 md:leading-7 text-xs md:text-sm lg:text-base absolute top-[373px] md:top-[546px] lg:top-[775px] 
          left-[32px] md:left-[60px] lg:left-[352px] w-[256px] md:w-[400px] lg:w-[736px]'>
            {headerTextContent}
          </p>
        </div>
      </section>
      <section id="sectionOne" className='relative bg-white flex h-[413px] md:h-[622px] lg:h-[827px]'>
        <Image
          loading='lazy'
          width={736}
          height={352}
          alt={`${sectionOneImage.alt}`}
          src={builder.image(sectionOneImage).width(736).height(352).url()}
          className='object-cover w-[222px] h-[129px] md:w-[460px] md:h-[220px] lg:w-[736px] lg:h-[352px] absolute left-0 top-[175px]'
        />
      </section>
      <section id="sectionTwo" className='relative bg-white font-light h-[613px] md:h-[822px]'>
        <Image
          loading='lazy'
          width={608}
          height={997}
          alt={`${sectionTwoImage.alt}`}
          src={builder.image(sectionTwoImage).width(608).height(997).url()}
          className='w-full h-[560px] md:w-[317px] lg:w-[448px] lg:h-[656px] md:ml-[60px] lg:ml-[160px] absolute lg:left-[160px]'
        />
        <div className='absolute inset-0 pt-[120px] md:h-[264px] md:pt-[150px] lg:pt-[200px] h-[216px] mx-16 md:mx-44 lg:mx-96'>
          <p className='text-center italic text-[26px] md:text-4xl lg:text-[56px] text-primary leading-9 md:leading-[50px] lg:leading-[66px] 
          w-[256px] md:w-[482px] lg:w-[928px]'
          >
            {sectionTwoTextContent}
          </p>
        </div>
      </section>
      <section id="sectionThree" className='flex justify-center bg-white font-light h-[462px] md:h-[322px] pt-[60px] md:pt-0'>
        <div className='md:h-[264px] w-[256px] md:w-[648px] lg:w-[736px] h-[216px]'>
          <p className='text-center italic leading-5 md:leading-7 text-xs md:text-sm lg:text-base text-primary'>
            {sectionThreeTextContent}
          </p>
        </div>
      </section>
      <section id="sectionFour" className='relative bg-white flex h-[413px] md:h-[622px] lg:mb-14'>
        <Image
          loading='lazy'
          width={736}
          height={352}
          alt={`${sectionFourImage.alt}`}
          src={builder.image(sectionFourImage).width(736).height(352).url()}
          className='object-cover w-[222px] h-[129px] md:w-[460px] md:h-[220px] lg:w-[736px] lg:h-[352px] absolute right-0 top-[175px]'
        />
      </section>
    </div>
  );

}