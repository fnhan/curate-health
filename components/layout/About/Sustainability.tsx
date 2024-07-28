import imageUrlBuilder from '@sanity/image-url';
import Image from 'next/image';
import { Loading } from 'components/Loading';
import { dataset, projectId } from '../../../sanity/env';
import Link from 'next/link';
import styles from '../../../styles/CarouselNav.module.css';

const builder = imageUrlBuilder({ projectId, dataset });

export default function Sustainability({ sustainability, aboutPages }) {

  if (!sustainability) {
    return <Loading />;
  }

  const {
    headerTopImage,
    headerBottomImage,
    headerTitle,
    headerTitleDesktop,
    headerTextContent,
    sectionOneImage,
    sectionOneTitle,
    sectionOneTextContent,
    sectionTwoImage,
    sectionTwoTitle,
    sectionTwoTextContent,
    sectionThreeTitle,
    sectionThreeImage,
    sectionThreeTextContent,
    sectionFourTitle,
    sectionFourTextContent,
    sectionFourImage,
    sectionFiveImage,
    sectionFiveTitle,
    sectionFiveTextContent,
    sectionSixTitle,
    sectionSixTextContent,
    sectionSixImage,
    sectionSevenBgImage,
    sectionSevenTitle,
    sectionSevenTextContent,
    sectionSevenCta,
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
          className='w-[124px] h-[124px] md:w-[294px] md:h-[294px] lg:w-[352px] lg:h-[322px] absolute top-[36px] md:top-[32px]
          left-8 md:left-[60px] lg:left-1/2 lg:top-[30px]'
        />
        <Image
          loading='lazy'
          width={322}
          height={322}
          alt={`${headerBottomImage.alt}`}
          src={builder.image(headerBottomImage).width(322).height(322).url()}
          className='w-[124px] h-[124px] md:w-[294px] md:h-[294px] lg:w-[322px] lg:h-[308px] absolute top-48 md:top-[315px] 
          lg:top-[290px] right-0'
        />
        <div className='bg-[#C3C7BB] bg-opacity-50 backdrop-blur-3xl h-[78px] mt-[316px] md:mt-[295px] lg:mt-[598px]'>
          <div className='bg-[#C3C7BB] bg-opacity-50 backdrop-blur-3xl h-[78px]'>
            <div
              className={`container whitespace-nowrap overflow-x-auto ${styles.customScrollbar}`}>
              <div className='flex'>
                <div className=' -mr-8'>
                  <div className='p-1 group'>
                    <Link href='/about'>
                      <div className='flex bg-transparent border-none'>
                        <div
                          className='p-6 text-black font-light font-Poppins text-[12px] lg:text-[14px] leading-[14px] underline'>
                          About
                          <div
                            className='-mt-1 bg-black h-[1.35px] w-0 group-hover:w-full transition-all duration-500'></div>
                        </div>
                        <div className='text-black font-light -ml-6 p-6 mx-3 lg:inline leading-[14px]'>
                          |
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
                {aboutPages.map((aboutPage, index) => (
                  <div key={index}>
                    <div className='p-1 group'>
                      <Link href={`/about/${aboutPage.slug}`}>
                        <div
                          className='bg-transparent border-none underline text-black'>
                          <div className='-ml-4 -mr-4 items-center font-light font-Poppins justify-center p-6 text-black text-[12px] lg:text-[14px] leading-[14px]'>
                            {aboutPage.title}
                            <div
                              className='-mt-1 bg-black h-[1.35px] w-0 group-hover:w-full transition-all duration-500'></div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className='flex flex-col pt-20 lg:pt-28 pl-8 md:pl-[60px] lg:pl-40'>
          <h1 className='block lg:hidden text-2xl md:text-5xl leading-8 md:leading-10'>
            {headerTitle}
          </h1>
          <h1 className='hidden lg:block text-7xl leading-[72px] w-1/2'>
            {headerTitleDesktop}
          </h1>
          <p className='leading-5 md:leading-7 text-xs md:text-sm lg:text-base pt-3 md:pt-9 w-3/4 md:w-[60%] lg:w-[37%]'>
            {headerTextContent}
          </p>
        </div>
      </section>
      <section id="sectionOne" className='w-full font-light bg-white pt-[180px] lg:pt-[300px]
      flex flex-col lg:grid lg:grid-cols-2'>
        <div className='lg:pl-40 flex flex-col justify-center mx-[32px] md:mx-[60px] lg:mx-0 w-[90%] md:w-[85%] lg:w-[95%]'>
          <h1 className='text-primary text-base md:text-[32px] lg:text-[40px] pt-[600px] lg:pt-20 lg:pb-12 leading-[52px]'>{sectionOneTitle}</h1>
          <p className='pt-4 md:pt-8 lg:pt-10 lg:col-span-1 md:pl-1 lg:pl-0 text-primary leading-5 md:leading-7 text-xs lg:text-base md:text-sm'
          >
            {sectionOneTextContent}
          </p>
        </div>
        <Image
          loading='lazy'
          width={704}
          height={500}
          alt={`${sectionOneImage.alt}`}
          src={builder
            .image(sectionOneImage)
            .width(704)
            .height(500)
            .url()
          }
          className='z-10 absolute lg:right-0 w-[704px] h-[500px] transform translate-y-16'
        />
        <div className='z-0 absolute lg:right-0 bg-secondary w-[608px] h-[429px]'>
        </div>
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