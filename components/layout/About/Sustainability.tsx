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
    headerImage,
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
    sectionSixSubtitleOne,
    sectionSixSubtitleOneText,
    sectionSixSubtitleTwo,
    sectionSixSubtitleTwoText,
    sectionSixSubtitleThree,
    sectionSixSubtitleThreeText,
    sectionSevenBgImage,
    sectionSevenTitle,
    sectionSevenTextContent,
    sectionSevenCta,
    ctaUrl,
    sectionSevenEsg,
    esgLink,
  } = sustainability;

  return (
    <div className='flex flex-col w-full bg-white font-light'>
      <section id="headerSection" className='relative bg-white flex flex-col font-light h-[604px] md:h-[798px] lg:h-[915px] w-full text-primary'>
        <Image
          loading='lazy'
          width={1440}
          height={690}
          alt={`${headerImage.alt}`}
          src={builder.image(headerImage).width(1440).height(690).url()}
          className='w-full h-[354px] md:h-[450px] lg:h-[690px]'
        />
        <div className='bg-[#C3C7BB] backdrop-blur-3xl h-[48px] md:h-[68px] lg:h-[78px]'>
          <div className='bg-[#C3C7BB] backdrop-blur-3xl h-[48px] md:h-[68px] lg:h-[78px]'>
            <div
              className={`container whitespace-nowrap overflow-x-auto -mt-5 md:-mt-0 ${styles.customScrollbar}`}>
              <div className='flex'>
                <div className='-mr-8'>
                  <div className='p-1 group'>
                    <Link href='/about/our-story'>
                      <div className='flex bg-transparent border-none'>
                        <div
                          className='-ml-4 p-4 md:-ml-6 md:p-6 text-primary font-light text-[12px] lg:text-[14px] leading-[14px]'>
                          About
                          <div
                            className='mt-1 bg-primary md:h-[0.5px] lg:h-[1.35px] w-0 group-hover:w-full transition-all duration-500'></div>
                        </div>
                        <div className='text-primary font-light -ml-4 p-4 md:-ml-6 md:p-6 mx-3 lg:inline leading-[14px]'>
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
                          className={`bg-transparent border-none ${aboutPage.title === 'Sustainability' ? 'underline text-primary underline-offset-[6.5px] lg:underline-offset-[7.25px]' : ''}`}>
                          <div className='-mx-4 items-center font-light justify-center p-4 px-6 md:p-6 text-primary text-[12px] lg:text-[14px] leading-[14px]'>
                            {aboutPage.title}
                            <div
                              className={`${aboutPage.title !== 'Sustainability' ? 'mt-1 bg-primary md:h-[0.5px] lg:h-[1.35px] w-0 group-hover:w-full transition-all duration-500' : ''}`}></div>
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
        <div className='flex flex-col pt-20 md:pt-28 pl-8 md:pl-[60px] lg:pl-40'>
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
      <section id="sectionOne" className='w-full font-light bg-white pt-[180px] lg:pt-[400px]
      flex flex-col lg:grid lg:grid-cols-2'>
        <div className='md:pt-36 lg:pt-0 lg:pl-40 flex flex-col justify-center mx-[32px] md:mx-[60px] lg:mx-0 w-[90%] md:w-[85%] lg:w-[95%]'>
          <h1 className='text-primary text-base md:text-[32px] lg:text-[40px] pt-[600px] lg:pt-20 md:pb-12 leading-[52px]'>{sectionOneTitle}</h1>
          <p className='lg:pt-10 lg:col-span-1 lg:p-1 lg:mx-0 text-primary leading-5 md:leading-7 text-xs lg:text-base md:text-sm'
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
          className='z-10 absolute left-0 lg:right-0 lg:left-auto w-[304px] h-[496px] md:w-[708px] md:h-[600px] lg:w-[704px] lg:h-[500px] transform translate-y-16'
        />
        <div className='z-0 absolute left-0 lg:right-0 lg:left-auto bg-secondary w-[288px] h-[460px] md:w-[624px] md:h-[450px] lg:w-[608px] lg:h-[429px]'>
        </div>
      </section>
      <section id="sectionTwo" className='w-full font-light bg-white flex flex-col lg:grid lg:grid-cols-2 pt-[180px] lg:pt-[400px]'>
        <Image
          loading='lazy'
          width={704}
          height={500}
          alt={`${sectionTwoImage.alt}`}
          src={builder.image(sectionTwoImage).width(704).height(500).url()}
          className='absolute left-0 w-[304px] h-[496px] md:w-[708px] md:h-[600px] lg:w-[704px] lg:h-[500px] transform translate-y-16'
        />
        <div className='bg-secondary w-[288px] h-[460px] md:w-[624px] md:h-[450px] lg:w-[608px] lg:h-[429px]'>
        </div>
        <div className='pt-24 md:pt-12 lg:pt-0 flex flex-col justify-center mx-[32px] md:mx-[60px] lg:mx-2.5 w-[84%] lg:w-[2/5] lg:h-[500px]'>
          <h1 className='text-primary text-base md:text-[32px] lg:text-[40px] md:pt-64 pt-14 py-4 md:py-14 lg:pt-0 lg:mb-12'>{sectionTwoTitle}</h1>
          <p className='lg:col-span-1 lg:p-1 lg:mx-0 text-primary leading-5 md:leading-7 text-xs lg:text-base md:text-sm'
          >
            {sectionTwoTextContent}
          </p>
        </div>
      </section>
      <section id="sectionThree" className='w-full font-light bg-white pt-[180px] lg:pt-[250px] flex flex-col lg:grid lg:grid-cols-2'>
        <div className='md:pt-36 lg:pt-0 lg:pl-40 flex flex-col justify-center mx-[32px] md:mx-[60px] lg:mx-0 w-[90%] md:w-[85%] lg:w-[95%]'>
          <h1 className='text-primary text-base md:text-[32px] lg:text-[40px] pt-[600px] lg:pt-20 md:mb-12 leading-[52px]'>{sectionThreeTitle}</h1>
          <p className='lg:pt-10 lg:col-span-1 lg:p-1 lg:mx-0 text-primary leading-5 md:leading-7 text-xs lg:text-base md:text-sm'
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
          className='z-10 absolute left-0 lg:right-0 lg:left-auto w-[304px] h-[496px] md:w-[708px] md:h-[600px] lg:w-[704px] lg:h-[500px] transform translate-y-16'
        />
        <div className='z-0 absolute left-0 lg:right-0 lg:left-auto bg-secondary w-[288px] h-[460px] md:w-[624px] md:h-[450px] lg:w-[608px] lg:h-[429px]'>
        </div>
      </section>
      <section id="sectionFour" className='w-full font-light bg-white flex flex-col lg:grid lg:grid-cols-2 pt-[180px] lg:pt-[400px]'>
        <Image
          loading='lazy'
          width={704}
          height={500}
          alt={`${sectionFourImage.alt}`}
          src={builder.image(sectionFourImage).width(704).height(500).url()}
          className='absolute left-0 w-[304px] h-[496px] md:w-[708px] md:h-[600px] lg:w-[704px] lg:h-[500px] transform translate-y-16'
        />
        <div className='bg-secondary w-[288px] h-[460px] md:w-[624px] md:h-[450px] lg:w-[608px] lg:h-[429px]'>
        </div>
        <div className='pt-24 md:pt-12 lg:pt-0 flex flex-col justify-center mx-[32px] md:mx-[60px] lg:mx-2.5 w-[84%] lg:w-[2/5] lg:h-[500px]'>
          <h1 className='text-primary text-base md:text-[32px] lg:text-[40px] md:pt-64 pt-14 py-4 md:py-14 lg:pt-0 lg:mb-12'>{sectionFourTitle}</h1>
          <p className='lg:col-span-1 lg:p-1 lg:mx-0 text-primary leading-5 md:leading-7 text-xs lg:text-base md:text-sm'
          >
            {sectionFourTextContent}
          </p>
        </div>
      </section>
      <section id="sectionFive" className='w-full font-light bg-white pt-[180px] lg:pt-[250px] flex flex-col lg:grid lg:grid-cols-2'>
        <div className='md:pt-36 lg:pt-0 lg:pl-40 flex flex-col justify-center mx-[32px] md:mx-[60px] lg:mx-0 w-[90%] md:w-[85%] lg:w-[95%]'>
          <h1 className='text-primary text-base md:text-[32px] lg:text-[40px] pt-[600px] lg:pt-20 md:mb-12 leading-[52px]'>{sectionFiveTitle}</h1>
          <p className='lg:pt-10 lg:col-span-1 lg:p-1 lg:mx-0 text-primary leading-5 md:leading-7 text-xs lg:text-base md:text-sm'
          >
            {sectionFiveTextContent}
          </p>
        </div>
        <Image
          loading='lazy'
          width={704}
          height={500}
          alt={`${sectionFiveImage.alt}`}
          src={builder
            .image(sectionFiveImage)
            .width(704)
            .height(500)
            .url()
          }
          className='z-10 absolute left-0 lg:right-0 lg:left-auto w-[304px] h-[496px] md:w-[708px] md:h-[600px] lg:w-[704px] lg:h-[500px] transform translate-y-16'
        />
        <div className='z-0 absolute left-0 lg:right-0 lg:left-auto bg-secondary w-[288px] h-[460px] md:w-[624px] md:h-[450px] lg:w-[608px] lg:h-[429px]'>
        </div>
      </section>
      <section id="sectionSix" className='w-full font-light bg-white flex flex-col lg:grid lg:grid-cols-2 pt-[150px] lg:pt-[400px]'>
        <Image
          loading='lazy'
          width={704}
          height={500}
          alt={`${sectionSixImage.alt}`}
          src={builder.image(sectionSixImage).width(704).height(500).url()}
          className='absolute left-0 w-[304px] h-[496px] md:w-[708px] md:h-[600px] lg:w-[704px] lg:h-[500px] transform translate-y-16'
        />
        <div className='bg-secondary w-[288px] h-[460px] md:w-[624px] md:h-[450px] lg:w-[608px] lg:h-[429px]'>
        </div>
        <div className='pt-24 md:pt-12 lg:pt-0 flex flex-col justify-center mx-[32px] md:mx-[60px] lg:mx-2.5 w-[84%] lg:w-[70%]'>
          <h1 className='leading-7 text-primary text-base md:text-[32px] lg:text-[40px] md:pt-64 pt-14 py-4 md:py-14 lg:pt-20 lg:mb-6'>{sectionSixTitle}</h1>
          <p className='lg:col-span-1 lg:p-1 lg:mx-0 text-primary leading-7 text-xs lg:text-base md:text-sm'
          >
            {sectionSixTextContent}
          </p>
          <p className='pt-8 pl-4 leading-7 text-primary text-xs lg:text-base md:text-sm'>
            <b className='font-bold'>&#x2022; {sectionSixSubtitleOne}</b>
            {sectionSixSubtitleOneText}</p>
          <p className='pt-8 pl-4 leading-7 text-primary text-xs lg:text-base md:text-sm'>
            <b className='font-bold'>&#x2022; {sectionSixSubtitleTwo}</b>
            {sectionSixSubtitleTwoText}</p>
          <p className='pt-8 pl-4 leading-7 text-primary text-xs lg:text-base md:text-sm'>
            <b className='font-bold'>&#x2022; {sectionSixSubtitleThree}</b>
            {sectionSixSubtitleThreeText}</p>
        </div>
      </section>
      <section id="sectionSeven" className='relative bg-white w-full font-light pt-[100px] md:pt-[160px] text-white'>
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
          <div className='flex flex-col px-2 md:px-[30px]'>
            <h1 className='lg:text-[40px] md:text-[32px] text-base leading:6 md:leading-10 lg:leading-[52px] w-2/3 
            self-start lg:self-center text-left lg:text-center'>
              {sectionSevenTitle}
            </h1>
            <p className='leading-5 md:leading-7 text-xs md:text-sm lg:text-base w-3/4 self-start text-left lg:text-center 
            lg:self-center py-6 md:py-8 lg:py-14 text:left'>
              {sectionSevenTextContent}
            </p>
            <Link href={ctaUrl}>
              <p className='md:hover:underline italic text-sm md:text-lg lg:text-2xl self-start text:left lg:self-center text-left lg:text-center'>
                {sectionSevenCta}
              </p>
            </Link>
            <a
              href={esgLink}
              target="blank"
              className='md:hover:underline text-xs md:text-sm lg:text-base self-start text:left lg:self-center text-left lg:text-center
              pt-4 md:pt-6 lg:pt-10'>
              {sectionSevenEsg}
            </a>
          </div>
        </div>
      </section>
    </div>
  );

}