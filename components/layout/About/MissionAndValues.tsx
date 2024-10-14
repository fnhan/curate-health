import imageUrlBuilder from '@sanity/image-url';
import Image from 'next/image';
import { Loading } from 'components/Loading';
import { dataset, projectId } from '../../../sanity/env';
import missionAndValues from 'sanity/schemas/missionAndValues';

const builder = imageUrlBuilder({ projectId, dataset });

export default function MissionAndValues({ missionAndValues }) {

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
    <div className='flex flex-col'>
      <section id="headerSection" className='relative bg-white flex justify-center font-light'>
        <Image
          loading='lazy'
          width={1440}
          height={460}
          alt={`${headerImage.alt}`}
          src={builder.image(headerImage).width(1440).height(460).url()}
          className='object-cover w-full h-[360px] md:h-[603px] lg:h-[460px]'
        />
      </section>
      <section id="purpose" className='w-full font-light bg-white flex flex-col lg:grid lg:grid-cols-2 pt-[80px] md:pt-[100px] lg:pt-[160px]
      lg:pb-[100px]'>
        <Image
          loading='lazy'
          width={704}
          height={500}
          alt={`${purposeImage.alt}`}
          src={builder.image(purposeImage).width(704).height(500).url()}
          className='absolute inset-x-13 pt-14 w-[288px] h-[460px] md:w-[708px] md:h-[600px] lg:w-[704px] lg:h-[500px]'
        />
        <div className='bg-secondary w-[288px] h-[460px] md:w-[624px] md:h-[450px] lg:w-[608px] lg:h-[429px]'>
        </div>
        <div className='flex flex-col justify-center mx-[32px] md:mx-[60px] lg:mx-0 w-[258px] md:w-[648px] lg:w-[544px] lg:h-[500px]'>
          <h1 className='text-primary text-base md:text-[32px] lg:text-[40px] py-14 lg:mb-12'>{purposeTitle}</h1>
          <p className='lg:col-span-1 lg:p-1 lg:mx-0 text-primary leading-5 md:leading-7 text-xs lg:text-base md:text-sm'
          >
            {purposeTextContent}
          </p>
        </div>
      </section>
      <section id="mission" className='w-full font-light bg-white flex flex-col lg:grid lg:grid-cols-2 pt-[80px] md:pt-[100px] lg:py-[200px]'>
        <div className='lg:pl-40 flex flex-col justify-center mx-[32px] md:mx-[60px] lg:mx-0 w-[258px] md:w-[648px] lg:w-[544px] lg:h-[500px]'>
          <h1 className='text-primary text-base md:text-[32px] lg:text-[40px] py-14 lg:mb-12'>{missionTitle}</h1>
          <p className='lg:col-span-1 lg:p-1 text-primary leading-5 md:leading-7 text-xs lg:text-base md:text-sm'
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
          className='z-10  absolute right-0 pt-14 w-[288px] h-[460px] md:w-[708px] md:h-[600px] lg:w-[704px] lg:h-[500px]'
        />
        <div className='z-0 lg:block hidden absolute right-0 bg-secondary w-[608px] h-[429px]'>
        </div>
      </section>
      <section id="vision" className='w-full font-light bg-white flex flex-col lg:grid lg:grid-cols-2 pt-[80px] md:pt-[100px] lg:py-[200px]'>
        <Image
          loading='lazy'
          width={704}
          height={500}
          alt={`${visionImage.alt}`}
          src={builder.image(visionImage).width(704).height(500).url()}
          className=' absolute inset-x-13 pt-14 w-[288px] h-[460px] md:w-[708px] md:h-[600px] lg:w-[704px] lg:h-[500px]'
        />
        <div className=' bg-secondary w-[608px] h-[429px] top-[200px]'>
        </div>
        <div className='flex flex-col justify-center mx-[32px] md:mx-[60px] lg:mx-0 w-[258px] md:w-[648px] lg:w-[544px] lg:h-[500px]'>
          <h1 className='text-primary text-base md:text-[32px] lg:text-[40px] py-14 lg:mb-12'>{visionTitle}</h1>
          <p className='lg:col-span-1 lg:p-1 lg:mx-0 text-primary leading-5 md:leading-7 text-xs lg:text-base md:text-sm'
          >
            {visionTextContent}
          </p>
        </div>
      </section>
    </div>
  );

}