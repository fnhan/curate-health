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
  contactInfo: {
    contactInfoImage: {
      asset: {
        _id: string;
        url: string;
      };
      alt: string;
    };
    streetAddress: string;
    postalAddress: string;
    emailAddress: string;
    phoneNumber: string;
    hrefDirections: string;
  };
  contactDetails: {
    title: string;
    monHours: string;
    tuesHours: string;
    wedHours: string;
    thursHours: string;
    friHours: string;
    satHours: string;
    sunHours: string;
    mapURL: string;
    cta: string;
    href: string;
  };
  footer: SanityDocument;
  surveyLink: SanityDocument;
  navigation: SanityDocument;
};

export default function ContactPreview() {
  const [data, isLoading] = useLiveQuery<ContactPageData>(null, CONTACT_PAGE_QUERY);

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
    <Layout title='Contact' navigation={data.navigation} footer={data.footer}>
      <ContactInfo contactInfo={data.contactInfo} />
      <ContactDetails contactDetails={data.contactDetails} />
      <SurveyLink surveyLink={data.surveyLink} />
      <Newsletter />
    </Layout>
  );
}