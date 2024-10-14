import imageUrlBuilder from '@sanity/image-url';
import Image from 'next/image';
import { Loading } from 'components/Loading';
import { dataset, projectId } from '../../../sanity/env';
import Link from 'next/link';
import styles from '../../../styles/CarouselNav.module.css';

const builder = imageUrlBuilder({ projectId, dataset });

export default function OurStory({ ourStory, aboutPages }) {

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
    sectionFiveTextContent,
    sectionFiveTitle,
    sectionSixTextContent,
    sectionSixTitle,
    sectionSevenCta,
    sectionSevenTextContent,
    sectionSevenTitle,
    sectionOneImage,
    sectionThreeImage,
    sectionFiveImage,
    sectionSixImage,
    sectionSevenBgImage,
    headerBgImage,
  } = ourStory;

  return (
    <div className='flex flex-col'>
      <section id="headerSection" className='relative bg-white font-light'>
        <Image
          loading='lazy'
          width={608}
          height={997}
          alt={`${headerBgImage.alt}`}
          src={builder.image(headerBgImage).width(608).height(997).url()}
          className='object-cover w-full h-[690px] md:w-[317px] md:h-[792px] lg:w-[608px] lg:h-[997px] absolute right-0'
        />
        <div className='absolute inset-0 flex flex-col pt-12 bg-secondary 
      h-[450px] md:h-[412px] lg:h-[520px] top-[50px] md:top-[250px]'>
          <h1 className='block md:hidden text-2xl leading-8 ml-[32px] pb-4'>{headerTitle}</h1>
          <h1 className='hidden md:block w-[798px] md:text-4xl lg:text-7xl lg:ml-[160px] top-[408px] pb-8 md:leading-10 md:ml-[60px] md:pb-6'>{headerTitleDesktop}</h1>
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
        <div className='bg-[#C3C7BB] bg-opacity-50 backdrop-blur-3xl h-[78px] mt-[500px] md:mt-[662px] lg:mt-[770px]'>
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
      </section>
      <section id="sectionOne" className='w-full font-light bg-white pt-[200px] md:pt-0 lg:pt-[300px] grid grid-cols-2'>
        <Image
          loading='lazy'
          width={704}
          height={500}
          alt={`${sectionOneImage.alt}`}
          src={builder.image(sectionOneImage).width(704).height(500).url()}
          className='absolute inset-x-13 w-[704px] h-[500px] pt-14'
        />
        <div className='bg-secondary w-[608px] h-[429px] top-[200px]'>
        </div>
        <div className='flex flex-col justify-center mx-[32px] md:mx-[60px] lg:mx-0 w-[258px] md:w-[648px] lg:w-[544px] lg:h-[500px]'>
          <h1 className='text-primary hidden lg:block text-[40px] py-14'>{sectionOneTitle}</h1>
          <p className='lg:col-span-1 lg:p-1 lg:mx-0 text-primary leading-5 md:leading-7 text-xs lg:text-base md:text-sm'
          >
            {sectionOneTextContent}
          </p>
        </div>
      </section>
      <section id="sectionTwo" className='relative bg-white font-light pt-[40px] md:pt-[200px]'>
        <div className='absolute inset-0 pt-[60px] mt-[200px] md:pt-[200px] md:h-[264px] h-[216px]'>
          <p className='text-center italic text-2xl md:text-4xl lg:text-6xl text-primary leading-9 md:leading-[50px] lg:leading-[66px] 
          mx-[32px] md:mx-[60px] lg:w-[928px] lg:ml-[352px] top-48'
          >
            {sectionTwoTextContent}
          </p>
        </div>
      </section>
      <section id="sectionThree" className='w-full font-light bg-white pt-[40px] md:pt-[180px] lg:pt-[200px] grid grid-cols-2'>
        <div className='lg:pl-40 flex flex-col justify-center mx-[32px] md:mx-[60px] lg:mx-0 w-[258px] md:w-[648px]  lg:h-[364px]'>
          <h1 className='text-primary hidden lg:block text-[40px] py-14'>{sectionThreeTitle}</h1>
          <p className='lg:col-span-1 lg:p-1 text-primary leading-5 md:leading-7 text-xs lg:text-base md:text-sm'
          >
            {sectionThreeTextContent}
          </p>
        </div>
        <Image
          loading='lazy'
          width={704}
          height={500}
          alt={`${sectionThreeImage.alt}`}
          src={builder
            .image(sectionThreeImage)
            .width(704)
            .height(500)
            .url()
          }
          className='z-10 absolute right-0 w-[704px] h-[500px]'
        />
        <div className='z-0 absolute right-0 bg-secondary w-[608px] h-[429px]'>
        </div>
      </section>
      <section id="sectionFive" className='w-full font-light bg-white pt-[40px] md:pt-[180px] lg:pt-[200px] grid grid-cols-2'>
        <Image
          loading='lazy'
          width={704}
          height={500}
          alt={`${sectionFiveImage.alt}`}
          src={builder.image(sectionFiveImage).width(704).height(500).url()}
          className='absolute inset-x-13 w-[704px] h-[500px]'
        />
        <div className='bg-secondary w-[608px] h-[429px] top-[200px]'>
        </div>
        <div className='flex flex-col justify-center mx-[32px] md:mx-[60px] lg:mx-0 w-[258px] md:w-[648px] lg:w-[544px] lg:h-[500px]'>
          <h1 className='text-primary text-[40px] py-14'>{sectionFiveTitle}</h1>
          <p className='lg:col-span-1 lg:p-1 lg:mx-0 text-primary leading-5 md:leading-7 text-xs lg:text-base md:text-sm'
          >
            {sectionFiveTextContent}
          </p>
        </div>
      </section>
      <section id="sectionSix" className='w-full font-light bg-white pt-[40px] md:pt-[180px] lg:pt-[200px] grid grid-cols-2'>
        <div className='lg:pl-40 flex flex-col justify-center mx-[32px] md:mx-[60px] lg:mx-0 w-[258px] md:w-[648px] lg:h-[364px]'>
          <h1 className='text-primary hidden lg:block text-[40px] py-14'>{sectionSixTitle}</h1>
          <p className='lg:col-span-1 lg:p-1 text-primary leading-5 md:leading-7 text-xs lg:text-base md:text-sm'
          >
            {sectionSixTextContent}
          </p>
        </div>
        <Image
          loading='lazy'
          width={704}
          height={500}
          alt={`${sectionSixImage.alt}`}
          src={builder
            .image(sectionSixImage)
            .width(704)
            .height(500)
            .url()
          }
          className='z-10 absolute right-0 w-[704px] h-[500px]'
        />
        <div className='z-0 absolute right-0 bg-secondary w-[608px] h-[429px]'>
        </div>
      </section>
      <section id="sectionSeven" className='relative bg-white h-full font-light md:pt-[180px] lg:pt-[200px] text-white'>
        <Image
          width={1440}
          height={1040}
          alt={`${sectionSevenBgImage.alt}`}
          src={builder.image(sectionSevenBgImage).width(1440).height(1040).url()}
          className='object-cover w-full h-[1040px] md:h-[792px] lg:h-[1040px] mt-[200px]'
        />
        <div className='text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 flex flex-col bg-secondary lg:w-[928px] lg:h-[484px] 
        justify-center text-center'>
          <h1 className='text-5xl text-white'>{sectionSevenTitle}</h1>
          <p className='text-white leading-5 md:leading-6 lg:leading-7 text-xs md:text-sm lg:text-base'>{sectionSevenTextContent}</p>
          <p className='italic text-sm md:text-lg lg:text-2xl'>{sectionSevenCta}</p>
        </div>
      </section>
    </div>
  );

}

