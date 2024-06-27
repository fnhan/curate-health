import HoverLink from './HoverLink';
import ServicesList from './ServicesList';

export default function Services({ services }) {
  return (
    <section>
      <div className='flex flex-col justify-start gap-10 md:gap-20 pt-8 md:py-16 pb-12 '>
        <div className='flex justify-start container'>
          <h2 className='mt-10 text-3xl md:text-5xl'>Our Services</h2>
        </div>
        <ServicesList services={services} />
      </div>
      <HoverLink href='/services/our-services' text='About Our Services' />
    </section>
  );
}
