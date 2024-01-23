import Image from 'next/image';
import Link from 'next/link';
import PerformanceTraining from 'public/images/service/Performance Training.jpg';
import LifestyleMedicine from 'public/images/service/lifestyle-medicine.png';
import MentalHealth from 'public/images/service/mental-health.jpg';
import Recovery from 'public/images/service/recovery-sanctuary.jpg';
import Regenerative from 'public/images/service/regenerative-medicine.jpg';
import Rehab from 'public/images/service/rehab.jpg';
import SurgicalConsultation from 'public/images/service/surgical-consultation.jpg';
import HoverLink from './HoverLink';

export default function Services() {
  const servicesList = [
    {
      title: 'Lifestyle Medicine',
      href: '/services#lifestyle-medicine',
      image: LifestyleMedicine,
    },
    {
      title: 'Rehabilitation',
      href: '/services#rehabilitation',
      image: Rehab,
    },
    {
      title: 'Performance Training',
      href: '/services#performance-training',
      image: PerformanceTraining,
    },
    // {
    //   title: 'Recovery Sanctuary',
    //   href: '/services#recovery-sancturary',
    //   image: Recovery,
    // },
    // {
    //   title: 'Regenerative Medicine',
    //   href: '/services#regenerative-medicine',
    //   image: Regenerative,
    // },
    {
      title: 'Mental Health',
      href: '/services#mental-health',
      image: MentalHealth,
    },
    // {
    //   title: 'Surgical Consultation',
    //   href: '/services#surgical-consultation',
    //   image: SurgicalConsultation,
    // },
  ];

  return (
    <section>
      <div className='container flex flex-col gap-10 md:gap-20 pt-[90px] pb-[60px]'>
        <div className='flex flex-col md:flex-row justify-between md:gap-20'>
          <h2 className='mb-12 text-3xl md:text-5xl'>
            Our <br />
            Services
          </h2>
          <p className='md:max-w-[736px]'>
            Our services are designed to address the physical, mental, and
            emotional aspects of your health, ensuring a well-rounded and
            individualized care plan. Whether you seek routine check-ups,
            rehabilitation, or guidance on healthy living, our clinic is
            committed to fostering a supportive and healing environment for
            everyone who walks through our doors. Your journey to optimal health
            begins here, where our integrated services work together to promote
            a healthier and happier you.
          </p>
        </div>
        <div className='md:flex justify-between grid grid-cols-3 gap-y-6 gap-x-2'>
          {servicesList.map((service) => (
            <div key={service.title}>
              <Link className='flex flex-col gap-7 group' href={service.href}>
                <Image
                  src={service.image}
                  width={175}
                  height={175}
                  alt=''
                  className='rounded-full w-[85px] h-[85px] 2xl:w-[175px] 2xl:h-[175px] object-cover mx-auto group-hover:-translate-y-3 transition-all duration-300'
                />
                <h6 className='font-denton text-center text-md border-b border-transparent md:text-base group-hover:underline duration-300 transition-all'>
                  {service.title}
                </h6>
              </Link>
            </div>
          ))}
        </div>
      </div>
      <HoverLink href='/services' text='About Our Services' />
    </section>
  );
}
