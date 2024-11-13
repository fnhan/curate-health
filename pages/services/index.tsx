import HomePagePreview from 'components/layout/Home/HomePreview';
import Newsletter from 'components/layout/Home/Newsletter';
import OurServiceDetail from 'components/layout/Services/OurServiceDetail';
import OurServicePicture from 'components/layout/Services/OurServicePicture';
import { ServicesNav } from 'components/layout/Services/ServicesNav';
import Layout from 'components/layout/layout';
import { SanityDocument } from 'next-sanity';
import Survey from '../../components/layout/Home/Survey';
import { getClient } from '../../sanity/lib/client';
import {
  FOOTER_QUERY,
  METADATA_BY_SLUG_QUERY,
  NAVIGATION_QUERY,
  SERVICES_QUERY,
  SURVEY_LINK_QUERY,
  OURSERVICES_QUERY,
} from '../../sanity/lib/queries';
import { token } from '../../sanity/lib/token';

type PageProps = {
  contactInfo: SanityDocument;
  contactDetails: SanityDocument;
  surveyLink: SanityDocument;
  services: SanityDocument[];
  service: SanityDocument;
  ourServices: SanityDocument;
  surveySection: SanityDocument[];
  navigation: SanityDocument;
  footer: SanityDocument;
  draftMode: boolean;
  token: string;
  meta: SanityDocument;
};

const OurService = (props: PageProps) => {
  return (
    <Layout
      title={props.meta?.title || 'Our Services'}
      navigation={props.navigation}
      footer={props.footer}
      description={props.meta?.description || ''}
    >
      <OurServicePicture ourServices={props.ourServices} />
      <div className='bg-secondary bg-opacity-50 backdrop-blur-3xl sticky top-[100px] z-50'>
        <ServicesNav
          services={props.services}
          currentPageTitle='Our Services'
        />
      </div>
      <div className='bg-white'>
        <div className='mb-32'>
          <OurServiceDetail services={props.services} />
        </div>
        <Survey surveyLink={props.surveySection} />
      </div>
      <Newsletter />
    </Layout>
  );
};

export const getStaticProps = async ({ draftMode = false }) => {
  const client = getClient(draftMode ? token : undefined);
  const surveySection = await client.fetch(SURVEY_LINK_QUERY);
  const services = await client.fetch(SERVICES_QUERY);
  const ourServices = await client.fetch(OURSERVICES_QUERY);
  const navigation = await client.fetch<SanityDocument>(NAVIGATION_QUERY);
  const footer = await client.fetch(FOOTER_QUERY);
  const meta = (
    await client.fetch<SanityDocument>(METADATA_BY_SLUG_QUERY, {
      slug: '/services',
    })
  ).meta;

  return {
    props: {
      draftMode,
      navigation,
      footer,
      surveySection,
      meta,
      token: draftMode ? token : '',
      services,
      ourServices,
    },
  };
};

export default OurService;
