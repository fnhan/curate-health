import ServicesList from '../Services/ServicesList';
import HoverLink from './HoverLink';

export default function Services() {
  return (
    <section>
      <div className='container flex flex-col gap-10 md:gap-20 pt-8 md:py-16 pb-12'>
        <div className='flex justify-center'>
          <h2 className='mb-6 text-3xl md:text-5xl'>Our Services</h2>
        </div>
        <ServicesList />
      </div>
      <HoverLink href='/services' text='About Our Services' />
    </section>
  );
}
