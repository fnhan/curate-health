import Layout from 'components/layout/layout';
import { Loading } from 'components/Loading';
import { useLiveQuery } from 'next-sanity/preview';
import { CONTACT_PAGE_QUERYResult } from 'sanity.types';
import { CONTACT_PAGE_QUERY } from '../../../sanity/lib/queries';
import Newsletter from '../Home/Newsletter';
import SurveyLink from '../Survey/SurveyLink';
import ContactDetails from './ContactDetails';
import ContactInfo from './ContactInfo';

export default function ContactPreview() {
  const [data, isLoading] = useLiveQuery<CONTACT_PAGE_QUERYResult>(
    {} as CONTACT_PAGE_QUERYResult,
    CONTACT_PAGE_QUERY
  );

  if (isLoading) {
    return <Loading />;
  }

  if (!data) {
    return <div>Data could not be fetched.</div>;
  }

  const {
    contactInfo,
    contactDetails,
    footer,
    surveyLink,
    navigation,
    feedbackLink,
  } = data;

  return (
    <Layout
      title='Contact'
      navigation={navigation}
      footer={footer}
      description={contactInfo?.meta?.description}>
      <ContactInfo contactInfo={contactInfo} feedbackLink={feedbackLink} />
      <ContactDetails contactDetails={contactDetails} />
      <SurveyLink surveyLink={surveyLink} />
      <Newsletter />
    </Layout>
  );
}
