import HoverLink from './HoverLink';
import ServicesList from './ServicesList';

export default function Services({ services }) {
  return (
    <section>
      <ServicesList services={services} />
      <HoverLink href='/services' text='About Our Services' />
    </section>
  );
}
