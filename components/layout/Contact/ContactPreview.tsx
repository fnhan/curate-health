import { Loading } from 'components/Loading';
import ContactInfo from './ContactInfo';
import ContactDetails from './ContactDetails';
import SurveyLink from '../Survey/SurveyLink';
import Newsletter from '../Home/Newsletter';
import Layout from 'components/layout/layout';
import { SanityDocument } from 'next-sanity';
import { useLiveQuery } from 'next-sanity/preview';
import { CONTACT_PAGE_QUERY } from '../../../sanity/lib/queries';

type ContactPageData = {
  contactInfo: SanityDocument;
  contactDetails: SanityDocument;
  footer: SanityDocument;
  surveyLink: SanityDocument;
  navigation: SanityDocument;
};

export default function ContactPreview() {
  const [data, isLoading] = useLiveQuery<ContactPageData>(
    null,
    CONTACT_PAGE_QUERY
  );

  if (isLoading) {
    return (
      <div className='flex flex-col min-h-screen justify-center items-center'>
        <Loading />;
      </div>
    );
  }

  if (!data) {
    return <div>Data could not be fetched.</div>;
  }

  return (
    <Layout
      title='Contact'
      navigation={data.navigation}
      footer={data.footer}
      description={''}
    >
      <ContactInfo contactInfo={data.contactInfo} />
      <ContactDetails contactDetails={data.contactDetails} />
      <SurveyLink surveyLink={data.surveyLink} />
      <Newsletter />
    </Layout>
  );
}
