import { fetchServices } from 'lib/api';
import Image from 'next/image';
import Link from 'next/link';
import HoverLink from './HoverLink';

export default function Services({ servicesList }) {
  console.log(fetchServices());

  return (
    <section>
      <div className='container flex flex-col gap-10 py-9'>
        <div>
          <h2 className='mb-12 text-secondary md:text-xl'>Sevices</h2>
          <p>
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
        {/* <div className='md:flex justify-between grid grid-cols-3 gap-y-6 gap-x-2'>
          {servicesList.map((service) => (
            <div key={service.title}>
              <Link className='flex flex-col gap-7 group' href={service.href}>
                <Image
                  src={service.image}
                  width={142}
                  height={142}
                  alt=''
                  className='rounded-full w-[85px] h-[85px] 2xl:w-[142px] 2xl:h-[142px] object-cover mx-auto group-hover:-translate-y-2 transition-all duration-300'
                />
                <h6 className='font-denton text-center text-sm border-b border-transparent md:text-base group-hover:underline duration-300 transition-all'>
                  {service.title}
                </h6>
              </Link>
            </div>
          ))}
        </div> */}
      </div>
      <HoverLink href='/services' text='More About Our Services' />
    </section>
  );
}

export async function getStaticProps() {
  const servicesList = await fetchServices();

  return {
    props: {
      servicesList,
    },
    revalidate: 60,
  };
}
