import ContactInfo from 'components/layout/Contact/ContactInfo';
import ContactDetails from 'components/layout/Contact/ContactDetails';
import SurveyLink from 'components/layout/Survey/SurveyLink';
import Newsletter from 'components/layout/Home/Newsletter';
import Layout from 'components/layout/layout';
import { SanityDocument } from 'next-sanity';
import dynamic from 'next/dynamic';
import { getClient } from '../../sanity/lib/client';
import { CONTACT_PAGE_QUERY } from '../../sanity/lib/queries';
import { token } from '../../sanity/lib/token';

type PageProps = {
  contactInfo: SanityDocument[];
  contactDetails: SanityDocument[];
  surveyLink: SanityDocument[];
  navigation: SanityDocument[];
  footer: SanityDocument[];
  draftMode: boolean;
  token: string;
};

export default function Index(props: PageProps) {
  const ContactPreview = dynamic(
    () => import('../../components/layout/Contact/ContactPreview')
  );

  if (props.draftMode) {
    return <ContactPreview />;
  }

  return (
    <Layout title={'Contact'} navigation={props.navigation} footer={props.footer}>
      <ContactInfo contactInfo={props.contactInfo} />
      <ContactDetails contactDetails={props.contactDetails} />
      <SurveyLink surveyLink={props.surveyLink} />
      <Newsletter />
    </Layout>
  );
}

export const getStaticProps = async ({ draftMode = false }) => {
  const client = getClient(draftMode ? token : undefined);
  const allData = await client.fetch(CONTACT_PAGE_QUERY);

  return {
    props: {
      ...allData,
      draftMode,
      token: draftMode ? token : '',
    },
    revalidate: 10,
  };
};

