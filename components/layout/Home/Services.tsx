import HoverLink from './HoverLink';
import ServicesList from './ServicesList';

export default function Services() {
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
        <ServicesList />
      </div>
      <HoverLink href='/services' text='About Our Services' />
    </section>
  );
}
