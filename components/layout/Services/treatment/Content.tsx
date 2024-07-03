import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import imageUrlBuilder from '@sanity/image-url';
import { dataset, projectId } from '../../../../sanity/env';

export default function Content({treatment}) {
  const builder = imageUrlBuilder({ projectId, dataset });
  return (
    <div className='bg-white'>
      <div className="flex flex-col 2xl:flex-row-reverse text-black">
        <div className="2xl:w-1/2 mt-20 justify-start 2xl:mt-24 relative">
        <div className='2xl:container text-[16px] 2xl:mt-6 md:text-[32px] pr-60 bg-primary opacity-75 w-9/12 2xl:w-10/12 2xl: h-[460px] md:h-[500px] 2xl:right-0 absolute'></div>
        <Image
          loading='lazy'
          width={1080}
          height={1440}
          src={builder
            .image(treatment.rightImage)
            .width(1440)
            .height(760)
            .quality(80)
            .url()}
          alt='right image'
          className='object-cover w-11/12 2xl:w-full h-[460px] md:h-[500px] mt-12 2xl:mt-20 relative'
        />
        </div>
        <div className="container 2xl:w-1/2 mb-20 2xl:mb-40 mt-12 2xl:mt-36">
          <div className='2xl:container text-[16px] 2xl:mt-6 md:text-[32px] pr-60 2xl:mb-12'>
            Your Personalized Path to Strength and Vitality
          </div>
          <div className='2xl:container mt-4 text-[11px] md:text-[14px] leading-5 md:leading-6'>
            Imagine a fitness plan that’s not just about hitting the gym or counting 
            but about creating a symphony of movements that align with your body’s 
            unique needs and goals. Our approach to Exercise Therapy goes beyond
            conventional exercises, focusing on personalized programs that enhance 
            your strength, flexibility, and overall well-being, ensuring you feel better, 
            move better, and live better.
          </div>
        </div>
      
      </div>
        <div className="flex flex-col 2xl:flex-row text-black 2xl:mt-24">
          <div className="2xl:w-1/2 mt-20 justify-start">
          <div className='2xl:container text-[16px] md:text-[32px] pr-60 bg-primary opacity-75 w-9/12 2xl:w-2/5 h-[460px] md:h-[500px] absolute'></div>
          <Image
          loading='lazy'
          width={1080}
          height={1440}
          src={builder
            .image(treatment.leftImage)
            .width(1440)
            .height(760)
            .quality(80)
            .url()}
            alt='left image'
            className='object-cover w-11/12 2xl:w-full h-[460px] md:h-[500px] mt-12 2xl:mt-16 relative'
          />
          </div>
        <div className="container 2xl:w-1/2 mb-40 mt-12 2xl:mb-96 2xl:mr-20 2xl:mt-28">
          <div className='text-[16px] 2xl:mt-6 md:text-[32px] pr-60 2xl:mb-12'>
            Your Personalized Path to Strength and Vitality
          </div>
          <div className='mt-4 text-[11px] md:text-[14px] leading-5 md:leading-6'>
            Imagine a fitness plan that’s not just about hitting the gym or counting 
            but about creating a symphony of movements that align with your body’s 
            unique needs and goals. Our approach to Exercise Therapy goes beyond
            conventional exercises, focusing on personalized programs that enhance 
            your strength, flexibility, and overall well-being, ensuring you feel better, 
            move better, and live better.
          </div>
        </div>
        
      </div>
    </div>
  

  );
}