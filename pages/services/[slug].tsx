import { CarouselNav } from 'components/layout/Services/CarouselNav';
import ServiceDetails from 'components/layout/Services/ServiceDetails';
import { useRouter } from 'next/router';
import Newsletter from '../../components/layout/Home/Newsletter';
import Layout from '../../components/layout/layout';
import { servicesList } from '../../public/data/serviceList';

const ServicePage = () => {
  const router = useRouter();
  const { slug } = router.query;

  const service = servicesList.find((service) => service.id === slug);

  return (
    <Layout title={service?.title || 'Services'}>
      <div className='bg-secondary/60 backdrop-blur-3xl sticky top-[105px] z-50'>
        <CarouselNav />
      </div>
      <div className='py-10'>
        {service ? <ServiceDetails service={service} /> : <p>Loading...</p>}
      </div>
      <Newsletter />
    </Layout>
  );
};

export default ServicePage;
