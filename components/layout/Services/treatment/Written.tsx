import Image from 'next/image';
import ourServices from '../../../../public/images/our-service.jpg';

export default function Written() {
  return (
    <div className='relative'>
      <Image
        loading='lazy'
        width={1080}
        height={1440}
        src={ourServices}
        alt='written content'
        className='object-cover w-full h-[660px] md:h-[827px]'
      />
      <div className="absolute w-11/12 h-4/6 md:w-9/12 2xl:w-8/12 2xl:h-2/4 top-1/2 2xl:left-1/2 flex flex-col justify-center 2xl:-translate-x-1/2 -translate-y-1/2 bg-secondary px-4 2xl:text-center 2xl:px-16 2xl:leading-11 text-white">
        <div className="container  text-[16px] md:text-[32px] 2xl:text-[40px]">
          Embrace a Life of Balance and Freedom
        </div>
        <div className="container text-[11px] md:text-[16px] mt-4 leading-6 md:leading-7">
          Don’t let physical limitations define your life. With Curate Health’s Physiotherapy services, unlock your potential for a more active, pain-free lifestyle. It’s time to take the first step on your path to recovery and strength.
        </div>
        <div className="container italic text-[10px] md:text-[16px] 2xl:text-[24px] mt-4 md:mt-16">
          {'['}Begin Your Journey with Exercise Therapy{']'}

        </div>
      </div>
    </div>
  );
}