import Image from 'next/image';
import SustainabilityBg from 'public/images/sustainability.jpg';

export default function Sustainability() {
  return (
    <section>
      <Image
        width={1080}
        height={1440}
        src={SustainabilityBg}
        alt='clinic'
        layout='responsive'
        className='w-full object-cover max-h-[435px] md:max-h-[649px]'
      />
      <div className='relative 2xl:container 2xl:p-0'>
        <div className='absolute bottom-0 left-0 text-xs w-[237px] bg-white text-black flex flex-col gap-10 p-8 md:p-20 my-10 md:my-0 md:w-[496px] md:text-base'>
          <p>
            Curate Health is committed to the well-being of individuals and the
            planet through environmental sustainability and social
            responsibility.
          </p>
        </div>
      </div>
    </section>
  );
}
