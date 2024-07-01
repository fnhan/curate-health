import Newsletter from 'components/layout/Home/Newsletter';
import OurServiceDetail from 'components/layout/Services/OurServiceDetail';
import OurServicePicture from 'components/layout/Services/OurServicePicture';
import { ServicesNav } from 'components/layout/Services/ServicesNav';
import Layout from 'components/layout/layout';
import { SanityDocument } from 'next-sanity';
import Survey from '../../components/layout/Home/Survey';
import { getClient } from '../../sanity/lib/client';
import {
  CONTACT_PAGE_QUERY,
  SERVICES_QUERY,
  SURVERY_QUERY,
} from '../../sanity/lib/queries';
import { token } from '../../sanity/lib/token';

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

const OurService = ({
  services = [],
  surveySection,
  navigation,
  footer,
  draftMode,
  token,
}: PageProps) => {
  return (
    <Layout title='Our Services' navigation={navigation} footer={footer}>
      <div>
        <OurServicePicture />
      </div>
      <div className='bg-secondary bg-opacity-50 backdrop-blur-3xl sticky top-[100px] z-50'>
        <ServicesNav services={services} currentPageTitle='Our Services' />
      </div>
      <div className='bg-white'>
        <div className='mb-32'>
          <OurServiceDetail services={services} />
        </div>
        <Survey surveySection={surveySection} />
      </div>
      <Newsletter />
    </Layout>
  );
};

export const getStaticProps = async ({ draftMode = false }) => {
  const client = getClient(draftMode ? token : undefined);
  const allData = await client.fetch(CONTACT_PAGE_QUERY);
  const surveySection = await client.fetch(SURVERY_QUERY);
  const services = await client.fetch(SERVICES_QUERY);

  return {
    props: {
      ...allData,
      draftMode,
      surveySection,
      token: draftMode ? token : '',
      services,
    },
  };
};

export default OurService;
