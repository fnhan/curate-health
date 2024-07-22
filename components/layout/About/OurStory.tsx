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
    headerSubtitle,
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
    <div className='flex flex-col w-full bg-white'>
      <section id="headerSection" className='relative bg-white font-light w-full'>
        <Image
          loading='lazy'
          width={608}
          height={997}
          alt={`${headerBgImage.alt}`}
          src={builder.image(headerBgImage).width(608).height(997).url()}
          className='object-cover w-full h-[690px] md:w-[317px] md:h-[792px] lg:w-[608px] lg:h-[997px] absolute md:right-0'
        />
        <div className='w-full absolute inset-0 flex flex-col pt-12 bg-secondary 
      h-[450px] md:h-[412px] lg:h-[520px] top-[50px] md:top-[250px]'>
          <h1 className='text-2xl md:text-[40px] lg:text-7xl leading-8 md:leading-10 ml-14 py-10 md:py-12 
          w-3/4 lg:w-2/3'>{headerTitle}</h1>
          <p className='leading-5 md:leading-6 text-xs text-md lg:text-base md:text-sm mx-[58px] 
          w-4/5 lg:w-3/5'>
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
      <section id="sectionOne" className='w-full font-light bg-white pt-[200px] lg:pt-[300px] flex flex-col lg:grid lg:grid-cols-2'>
        <Image
          loading='lazy'
          width={704}
          height={500}
          alt={`${sectionOneImage.alt}`}
          src={builder.image(sectionOneImage).width(704).height(500).url()}
          className='absolute left-0 w-[704px] h-[500px] transform translate-y-16'
        />
        <div className='bg-secondary w-[608px] h-[429px]'>
        </div>
        <div className='flex flex-col justify-center mx-[32px] md:mx-[60px] lg:mx-8 w-[90%] md:w-[85%] lg:w-3/4 lg:h-[500px]'>
          <h1 className='text-primary text-base md:text-[32px] lg:text-[40px] pt-44 lg:pt-0 lg:pb-20'>{sectionOneTitle}</h1>
          <p className='pt-6 md:pt-10 lg:pt-0 lg:col-span-1 md:pl-1 lg:pl-0 text-primary leading-5 md:leading-7 text-xs lg:text-base md:text-sm'
          >
            {sectionOneTextContent}
          </p>
        </div>
      </section>
      <section id="sectionTwo" className='relative bg-white font-light pt-[160px] lg:pt-[300px] w-full flex justify-center'>
        <p className='text-center italic text-2xl md:text-4xl lg:text-6xl text-primary leading-9 md:leading-[50px] lg:leading-[66px] 
        top-48 w-2/3'
        >
          {sectionTwoTextContent}
        </p>
      </section>
      <section id="sectionThree" className='w-full font-light bg-white pt-[180px] lg:pt-[300px]
      flex flex-col lg:grid lg:grid-cols-2'>
        <div className='lg:pl-40 flex flex-col justify-center mx-[32px] md:mx-[60px] lg:mx-0 w-[90%] md:w-[85%] lg:w-[95%]'>
          <h1 className='text-primary text-base md:text-[32px] lg:text-[40px] pt-[600px] lg:pt-20 lg:pb-12 leading-[52px]'>{sectionThreeTitle}</h1>
          <p className='pt-4 md:pt-8 lg:pt-10 lg:col-span-1 md:pl-1 lg:pl-0 text-primary leading-5 md:leading-7 text-xs lg:text-base md:text-sm'
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
          className='z-10 absolute lg:right-0 w-[704px] h-[500px] transform translate-y-16'
        />
        <div className='z-0 absolute lg:right-0 bg-secondary w-[608px] h-[429px]'>
        </div>
      </section>
      <section id="sectionFive" className='w-full font-light bg-white pt-[200px] lg:pt-[500px] flex flex-col lg:grid lg:grid-cols-2'>
        <Image
          loading='lazy'
          width={704}
          height={500}
          alt={`${sectionFiveImage.alt}`}
          src={builder.image(sectionFiveImage).width(704).height(500).url()}
          className='absolute w-[704px] h-[500px] transform translate-y-16'
        />
        <div className='bg-secondary w-[608px] h-[429px] top-[200px]'>
        </div>
        <div className='flex flex-col justify-center mx-[32px] md:mx-[60px] lg:mx-8 lg:h-[500px] w-[90%] md:w-[85%] lg:w-3/4'>
          <h1 className='text-primary text-base md:text-[32px] lg:text-[40px] pt-44 lg:pt-0 lg:pb-12 leading-10'>{sectionFiveTitle}</h1>
          <p className='pt-4 md:pt-8 lg:pt-10 lg:col-span-1 md:pl-1 lg:pl-0 text-primary leading-5 md:leading-7 text-xs lg:text-base md:text-sm'
          >
            {sectionFiveTextContent}
          </p>
        </div>
      </section>
      <section id="sectionSix" className='w-full font-light bg-white pt-[180px] lg:pt-[400px] 
      flex flex-col lg:grid lg:grid-cols-2'>
        <div className='lg:pl-40 flex flex-col justify-center mx-[32px] md:mx-[60px] lg:mx-0 w-[90%] md:w-[85%] lg:w-[95%] lg:h-[364px] 
        lg:pt-28'>
          <h1 className='text-primary text-base md:text-[32px] lg:text-[40px] pt-[600px] lg:pt-0 lg:pb-12 leading-10'>{sectionSixTitle}</h1>
          <p className='pt-4 md:pt-8 lg:col-span-1 md:pl-1 lg:pl-0 text-primary leading-5 md:leading-7 text-xs lg:text-base md:text-sm'
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
          className='z-10 absolute lg:right-0 w-[704px] h-[500px] transform translate-y-16'
        />
        <div className='z-0 absolute lg:right-0 bg-secondary w-[608px] h-[429px]'>
        </div>
      </section>
      <section id="sectionSeven" className='relative bg-white w-full font-light pt-[100px] md:pt-[160px] lg:pt-[400px] text-white'>
        <Image
          width={1440}
          height={1040}
          alt={`${sectionSevenBgImage.alt}`}
          src={builder.image(sectionSevenBgImage).width(1440).height(1040).url()}
          className='object-cover w-full h-[1040px] md:h-[792px] lg:h-[1040px]'
        />
        <div className='text-white absolute top-[30%] md:top-[34%] lg:top-[48%] lg:left-1/2 transform lg:-translate-x-1/2 flex flex-col bg-secondary 
        w-3/4 lg:w-2/3 h-[413px] md:h-[487px] lg:h-[484px] 
        justify-center text-center'>
          <div className='flex flex-col pl-4 md:pl-[60px]'>
            <h1 className='lg:text-[40px] md:text-[32px] text-base leading:6 md:leading-10 lg:leading-[52px] w-2/3 
            self-start lg:self-center text-left lg:text-center'>
            {sectionSevenTitle}
            </h1>
            <p className='leading-5 md:leading-7 text-xs md:text-sm lg:text-base w-3/4 self-start text-left lg:text-center 
            lg:self-center py-6 md:py-8 lg:py-14 text:left'>
            {sectionSevenTextContent}
            </p>
            <p className='italic text-sm md:text-lg lg:text-2xl w-3/4 self-start text:left lg:self-center text-left lg:text-center'>
            {sectionSevenCta}
            </p>
          </div>
        </div>
      </section>
    </div>
  );

}

