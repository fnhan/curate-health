import { Loading } from 'components/Loading';
import { useLiveQuery } from 'next-sanity/preview';
import { useRouter } from 'next/router';
import {
  FOOTER_QUERY,
  NAVIGATION_QUERY,
  SERVICE_BY_SLUG_QUERY,
  SERVICES_QUERY,
} from '../../../../sanity/lib/queries';
import Newsletter from '../../Home/Newsletter';
import Layout from '../../layout';
import AbovePicture from './AbovePicture';
import Content from './Content';
import Frame from './Frame';
import Green from './Green';
import Hero from './Hero';
import Quote from './Quote';
import Written from './Written';


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
      title={'Services'}>
      <div>
        <AbovePicture/>
      </div>
      <div className="bg-secondary backdrop-blur-3xl sticky top-[100px] z-50">
      </div>
      <div className='bg-white'>
        <Hero/>
      </div>
      <div className='bg-secondary opacity-100'>
        <Quote/>
      </div>
      <div className='bg-white'>
        <Content/>
      </div>
      <div className='container bg-primary'>
        <Green/>
      </div>
      <div className='bg-white'>
        <Frame/>
      </div>
      <Written/>
      <Newsletter />
    </Layout>
  );
}
