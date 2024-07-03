import { Loading } from 'components/Loading';
import Picture from 'components/layout/Services/Picture';
import ServiceDetails from 'components/layout/Services/ServiceDetails';
import { ServicesNav } from 'components/layout/Services/ServicesNav';
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

type PageProps = {
  draftMode: boolean;
  token: string;
  services: SanityDocument[];
  service: SanityDocument;
  navigation: SanityDocument;
  surveySection: SanityDocument[];
  footer: SanityDocument;
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
    <Layout
      navigation={props.navigation}
      footer={props.footer}
      title={props.service?.title || 'Services'}>
      <Picture service={props.service} />
      <ServicesNav
        services={props.services}
        currentPageTitle={props.service?.title || 'Services'}
      />
      <ServiceDetails service={props.service} />
      <Survey surveySection={props.surveySection} />
      <Newsletter />
    </Layout>
  );
}

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
      services,
      service,
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
