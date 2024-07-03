import { Loading } from 'components/Loading';
import { useLiveQuery } from 'next-sanity/preview';
import { useRouter } from 'next/router';
import {
  FOOTER_QUERY,
  NAVIGATION_QUERY,
  SERVICE_BY_SLUG_QUERY,
  SERVICES_QUERY,
} from '../../../sanity/lib/queries';
import Newsletter from '../Home/Newsletter';
import Layout from '../layout';
import { ServicesNav } from './ServicesNav';
import ServiceDetails from './ServiceDetails';

export default function ServicesPreview() {
  const router = useRouter();
  const { slug } = router.query;

  const [service, isServiceLoading] = useLiveQuery(
    null,
    SERVICE_BY_SLUG_QUERY,
    { slug }
  );
  const [services, isServicesLoading] = useLiveQuery(null, SERVICES_QUERY);
  const [footer, isFooterLoading] = useLiveQuery(null, FOOTER_QUERY);
  const [navigation, isNavigationLoading] = useLiveQuery(
    null,
    NAVIGATION_QUERY
  );

  if (isServiceLoading || isServicesLoading || isFooterLoading) {
    return <Loading />;
  }

  return (
    <Layout
      navigation={navigation}
      footer={footer}
      title={service?.title || 'Services'}>
      <div className='bg-secondary/60 backdrop-blur-3xl sticky top-[105px] z-50'>
        <ServicesNav services={services} currentPageTitle={service.title}/>
      </div>
      <div className='py-10'>
        <ServiceDetails service={service} />
      </div>
      <Newsletter />
    </Layout>
  );
}
