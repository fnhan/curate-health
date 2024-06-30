import { getClient } from '../../../sanity/lib/client';
import { SURVERY_QUERY, CONTACT_PAGE_QUERY , SERVICES_QUERY} from '../../../sanity/lib/queries';
import { token } from '../../../sanity/lib/token';

import Layout from 'components/layout/layout';
import Newsletter from 'components/layout/Home/Newsletter';
import { CarouselNav } from 'components/layout/Services/CarouselNav';
import Survey from '../../../components/layout/Home/Survey';

import { SanityDocument } from 'next-sanity';
import OurServiceDetail from 'components/layout/Services/OurServiceDetail';
import AbovePicture from 'components/layout/Services/treatment/AbovePicture';
import Hero from 'components/layout/Services/treatment/Hero';
import Quote from 'components/layout/Services/treatment/Quote';
import Content  from 'components/layout/Services/treatment/Content';
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

const OurService = ({
  services = [],
  surveySection,
  navigation,
  footer,
  draftMode,
  token,
}: PageProps) => {


  return (
    <Layout title="Our Services" navigation={navigation} footer={footer}>
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
        <Survey surveySection={surveySection} />
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