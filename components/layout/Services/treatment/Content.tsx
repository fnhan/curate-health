import Image from 'next/image';
import ourServices from '../../../../public/images/our-service.jpg';

export default function Content() {
  return (
    <div>
      <div className="flex flex-col 2xl:flex-row-reverse text-black">
        <div className="2xl:w-1/2 mt-20 justify-start 2xl:mt-40">
        <Image
          loading='lazy'
          width={1080}
          height={1440}
          src={ourServices}
          alt='left image'
          className='object-cover w-11/12 2xl:w-full h-[460px] md:h-[500px]'
        />
        </div>
        <div className="container 2xl:w-1/2 mb-40 mt-12 2xl:mt-32">
          <div className='2xl:container text-[16px] 2xl:mt-6 md:text-[32px] pr-60'>
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
        <div className="flex flex-col 2xl:flex-row text-black 2xl:mt-32">
          <div className="2xl:w-1/2 mt-20 justify-start">
          <Image
            loading='lazy'
            width={1080}
            height={1440}
            src={ourServices}
            alt='left image'
            className='object-cover w-11/12 2xl:w-full h-[460px] md:h-[500px]'
          />
          </div>
        <div className="container 2xl:w-1/2 mb-40 mt-12 2xl:mb-96 2xl:mr-20">
          <div className='text-[16px] 2xl:mt-6 md:text-[32px] pr-60'>
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