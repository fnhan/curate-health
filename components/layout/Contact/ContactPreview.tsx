import { Loading } from 'components/Loading';
import { useLiveQuery } from 'next-sanity/preview';
import { CONTACT_PAGE_QUERY } from '../../../sanity/lib/queries';
import Layout from 'components/layout/layout';
import ContactInfo from './ContactInfo';
import ContactDetails from './ContactDetails';
import SurveyLink from '../Survey/SurveyLink';
import Newsletter from '../Home/Newsletter';

export default function ContactPreview() {
  // Fetch data using live query
  const [contactPageData, isLoading] = useLiveQuery(
    null,
    CONTACT_PAGE_QUERY
  );

  if (isLoading) {
    return <Loading />;
  }

  if (!contactPageData) {
    return <div>Data could not be fetched.</div>;
  }

  const { contactInfo, contactDetails, footer, surveyLink, navigation, feedbackLink } = contactPageData;

  return (
    <Layout
      title="Contact"
      navigation={navigation}
      footer={footer}
      description={contactInfo?.meta?.description || 'Contact page description'}
    >
      <ContactInfo contactInfo={contactInfo} feedbackLink={feedbackLink} />
      <ContactDetails contactDetails={contactDetails} />
      <SurveyLink surveyLink={surveyLink} />
      <Newsletter />
    </Layout>
  );
}


