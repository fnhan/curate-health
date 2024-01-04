import Image from 'next/image';
import ClinicBG from 'public/images/clinic-bg.jpg';

export default function Clinic() {
  return (
    <section className='relative'>
      <Image
        width={1080}
        height={1440}
        src={ClinicBG}
        alt='clinic'
        layout='responsive'
        className='w-full object-cover max-h-[435px] md:max-h-[649px]'
      />
      <div className='relative container'>
        <div className='absolute bottom-0 right-0 text-xs w-[237px] bg-white text-black flex flex-col gap-10 p-8 md:p-20 my-10 md:my-0 md:w-[496px] md:text-base'>
          <p>
            Focused on optimizing the 5 pillars of health - physical, mental,
            emotional, social and spiritual, to help you achieve your highest
            potential.
          </p>
          <p>
            Our evidence-based holistic approach empowers individuals to
            proactively manage their well-being and achieve fulfillment in all
            areas of their lives.
          </p>
        </div>
      </div>
    </section>
  );
}
