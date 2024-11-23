import imageUrlBuilder from '@sanity/image-url';
import Image from 'next/image';
import { Loading } from 'components/Loading';
import { dataset, projectId } from '../../../sanity/env';
import Link from 'next/link';
import styles from '../../../styles/CarouselNav.module.css';

const builder = imageUrlBuilder({ projectId, dataset });

export default function MissionAndValues({ missionAndValues, aboutPages }) {

  if (!missionAndValues) {
    return <Loading />;
  }

  const {
    headerImage,
    purposeTitle,
    purposeTextContent,
    missionTitle,
    missionTextContent,
    visionTitle,
    visionTextContent,
    purposeImage,
    missionImage,
    visionImage
  } = missionAndValues;

  return (
    <div className='flex flex-col w-full font-light'>
      <section id="headerSection" className='relative bg-white font-light w-full'>
        <Image
          loading='lazy'
          width={1440}
          height={608}
          alt={`${headerImage.alt}`}
          src={builder.image(headerImage).width(1440).height(608).url()}
          className='w-full h-[360px] md:h-[603px] lg:h-[608px]'
        />
        <div className='bg-[#C3C7BB] backdrop-blur-3xl h-[68px] lg:h-[78px]'>
          <div className='bg-[#C3C7BB] backdrop-blur-3xl h-[68px] lg:h-[78px]'>
            <div
              className={`container whitespace-nowrap overflow-x-auto -mt-8 md:-mt-0 ${styles.customScrollbar}`}>
              <div className='flex'>
                <div className=' -mr-8'>
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
                          className={`bg-transparent border-none ${aboutPage.title === 'Mission & Values' ? 'underline text-primary underline-offset-[6.5px] lg:underline-offset-[7.25px]' : ''}`}>
                          <div className='-mx-4 items-center font-light justify-center p-4 px-6 md:p-6 text-primary text-[12px] lg:text-[14px] leading-[14px]'>
                            {aboutPage.title}
                            <div
                              className={`${aboutPage.title !== 'Mission & Values' ? 'mt-1 bg-primary md:h-[0.5px] lg:h-[1.35px] w-0 group-hover:w-full transition-all duration-500' : ''}`}></div>
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
      <section id="purpose" className='w-full font-light bg-white flex flex-col lg:grid lg:grid-cols-2 pt-[80px] md:pt-[100px] lg:pt-[160px]
      lg:pb-[100px]'>
        <Image
          loading='lazy'
          width={704}
          height={500}
          alt={`${purposeImage.alt}`}
          src={builder.image(purposeImage).width(704).height(500).url()}
          className='absolute right-0 md:left-0 w-[288px] h-[460px] md:w-[708px] md:h-[600px] lg:w-[704px] lg:h-[500px] transform translate-y-16'
        />
        <div className='bg-secondary w-[288px] h-[460px] md:w-[624px] md:h-[450px] lg:w-[608px] lg:h-[429px]'>
        </div>
        <div className='pt-10 lg:pt-0 flex flex-col justify-center mx-[32px] md:mx-[60px] lg:mx-0 w-[84%] lg:w-[2/5] lg:h-[500px]'>
          <h1 className='text-primary text-base md:text-[32px] lg:text-[40px] md:pt-64 pt-14 py-4 md:py-14 lg:pt-0 lg:mb-12'>{purposeTitle}</h1>
          <p className='lg:col-span-1 lg:p-1 lg:mx-0 text-primary leading-5 md:leading-7 text-xs lg:text-base md:text-sm'
          >
            {purposeTextContent}
          </p>
        </div>
      </section>
      <section id="mission" className='w-full font-light bg-white flex flex-col lg:grid lg:grid-cols-2 pt-[80px] md:pt-[100px] lg:pt-[200px] 
      lg:pb-[100px]'>
        <div className='pt-80 mt-48 lg:pl-40 lg:pt-0 md:mt-10 flex flex-col justify-center mx-[32px] md:mx-[60px] lg:mx-0 w-[84%] lg:w-[2/5] lg:h-[500px]'>
          <h1 className='text-primary text-base md:text-[32px] lg:text-[40px] md:pt-96 pt-14 py-4 md:py-14 lg:pt-0 lg:mb-12'>{missionTitle}</h1>
          <p className='lg:col-span-1 lg:p-1 text-primary leading-5 md:leading-7 text-xs lg:text-base md:text-sm lg:w-[544px]'
          >
            {missionTextContent}
          </p>
        </div>
        <Image
          loading='lazy'
          width={704}
          height={500}
          alt={`${missionImage.alt}`}
          src={builder
            .image(missionImage)
            .width(704)
            .height(500)
            .url()
          }
          className='z-10 absolute left-0 md:right-0 lg:left-auto w-[288px] h-[460px] md:w-[708px] md:h-[600px] lg:w-[704px] lg:h-[500px] transform translate-y-16'
        />
        <div className='z-0 absolute right-0 bg-secondary w-[288px] h-[460px] md:w-[624px] md:h-[450px] lg:w-[608px] lg:h-[429px]'>
        </div>
      </section>
      <section id="vision" className='w-full font-light bg-white flex flex-col lg:grid lg:grid-cols-2 pt-[80px] md:pt-[100px] lg:py-[200px]'>
        <Image
          loading='lazy'
          width={704}
          height={500}
          alt={`${visionImage.alt}`}
          src={builder.image(visionImage).width(704).height(500).url()}
          className='absolute right-0 md:left-0 w-[288px] h-[460px] md:w-[708px] md:h-[600px] lg:w-[704px] lg:h-[500px] transform translate-y-16'
        />
        <div className=' bg-secondary w-[288px] h-[460px] md:w-[624px] md:h-[450px] lg:w-[608px] lg:h-[429px]'>
        </div>
        <div className='pt-14 md:pt-56 md:mt-2 lg:pt-0 flex flex-col justify-center mx-[32px] md:mx-[60px] lg:mx-0 w-[84%] lg:w-[2/5] lg:h-[500px]'>
          <h1 className='text-primary text-base md:text-[32px] lg:text-[40px] pt-14 py-4 md:py-14 lg:mb-12'>{visionTitle}</h1>
          <p className='lg:col-span-1 lg:p-1 lg:mx-0 text-primary leading-5 md:leading-7 text-xs lg:text-base md:text-sm mb-44 lg:mb-0'
          >
            {visionTextContent}
          </p>
        </div>
      </section>
    </div>
  );

}