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
      <div className='container pt-10'></div>
      <div className='py-10'>
        {service ? <ServiceDetails service={service} /> : <p>Loading...</p>}
      </div>
      <Newsletter />
    </Layout>
  );
};

export default ServicePage;
