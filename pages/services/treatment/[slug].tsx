import { Loading } from 'components/Loading';
import { CarouselNav } from 'components/layout/Services/CarouselNav';
import ServiceDetails from 'components/layout/Services/ServiceDetails';
import Picture from 'components/layout/Services/Picture';
import { GetStaticPaths } from 'next';
import { SanityDocument } from 'next-sanity';
import dynamic from 'next/dynamic';
import Newsletter from '../../../components/layout/Home/Newsletter';
import Survey from '../../../components/layout/Home/Survey';
import Layout from '../../../components/layout/layout';
import { getClient } from '../../../sanity/lib/client';
import {
  FOOTER_QUERY,
  NAVIGATION_QUERY,
  SERVICES_QUERY,
  SERVICES_SLUG_QUERY,
  SERVICE_BY_SLUG_QUERY,
  SURVERY_QUERY,
} from '../../../sanity/lib/queries';
import { token } from '../../../sanity/lib/token';
import AbovePicture from 'components/layout/Services/treatment/AbovePicture';
import Hero from 'components/layout/Services/treatment/Hero';
import Quote from 'components/layout/Services/treatment/Quote';
import Content  from 'components/layout/Services/treatment/Content';
import Green  from 'components/layout/Services/treatment/Green';
import Frame from 'components/layout/Services/treatment/Frame';
import Written from 'components/layout/Services/treatment/Written';
// import StickyNav from 'components/layout/Services/treatment/StickyNav';

type PageProps = {
  contactInfo: SanityDocument;
  contactDetails: SanityDocument;
  surveyLink: SanityDocument;
  services: SanityDocument[];
  service: SanityDocument;
  surveySection: SanityDocument[];
  navigation: SanityDocument;
  footer: SanityDocument;
  draftMode: boolean;
  token: string;
};

export default function ServicesPage(props: PageProps) {
  const ServicesPreview = dynamic(
    () => import('../../../components/layout/Services/ServicesPreview')
  );

  if (props.draftMode) {
    return <ServicesPreview />;
  }

  // if (!props.service) {
  //   return <Loading />;
  // }



  return (
    <Layout title="Our Services" navigation={props.navigation} footer={props.footer}>
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
};

export const getStaticProps = async ({ params, preview = false }) => {
  const client = getClient(preview ? token : undefined);
  const services = await client.fetch(SERVICES_QUERY);
  const service = await client.fetch(SERVICE_BY_SLUG_QUERY, {
    slug: params.slug,
  });
  const navigation = await client.fetch(NAVIGATION_QUERY);
  const footer = await client.fetch(FOOTER_QUERY);
  const surveySection = await client.fetch(SURVERY_QUERY);

  return {
    props: {
      service,
      services,
      navigation,
      footer,
      surveySection,
      draftMode: preview,
      token: preview ? token : '',
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await getClient().fetch(SERVICES_SLUG_QUERY);

  return { paths, fallback: true };
};