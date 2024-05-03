import ContactDetails from 'components/layout/Contact/ContactDetails';
import ContactInfo from 'components/layout/Contact/ContactInfo';
import Newsletter from 'components/layout/Home/Newsletter';
import { CarouselNav } from 'components/layout/Services/CarouselNav';
import SurveyLink from 'components/layout/Survey/SurveyLink';
import Layout from 'components/layout/layout';
import { SanityDocument } from 'next-sanity';
import dynamic from 'next/dynamic';
import { getClient } from '../../../sanity/lib/client';
import { SURVERY_QUERY, CONTACT_PAGE_QUERY } from '../../../sanity/lib/queries';
import { token } from '../../../sanity/lib/token';
import Survey from '../../../components/layout/Home/Survey';

type PageProps = {
  contactInfo: SanityDocument;
  contactDetails: SanityDocument;
  surveyLink: SanityDocument;
  services: SanityDocument[];
  surveySection: SanityDocument[];
  navigation: SanityDocument;
  footer: SanityDocument;
  draftMode: boolean;
  token: string;
};

export default function Index(props: PageProps) {
  return (
    <Layout
      title={'Our Services'}
      navigation={props.navigation}
      footer={props.footer}>
      {/* <div className='bg-secondary/60 backdrop-blur-3xl sticky top-[105px] z-50'>
        <CarouselNav services={props.services} />
      </div> */}
      <Survey surveySection={props.surveySection} />
      <Newsletter />
    </Layout>
  );
}

export const getStaticProps = async ({ draftMode = false }) => {
  const client = getClient(draftMode ? token : undefined);
  const allData = await client.fetch(CONTACT_PAGE_QUERY);
  const surveySection = await client.fetch(SURVERY_QUERY);

  return {
    props: {
      ...allData,
      draftMode,
      surveySection,
      token: draftMode ? token : '',
    },
  };
};
