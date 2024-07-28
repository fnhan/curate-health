import Layout from '../../components/layout/layout';
import SurveyLink from 'components/layout/Survey/SurveyLink';
import Newsletter from 'components/layout/Home/Newsletter';
import { SUSTAINABILITY_PAGE_QUERY } from '../../sanity/lib/queries';
import { SanityDocument } from 'next-sanity';
import { getClient } from '../../sanity/lib/client';
import { token } from '../../sanity/lib/token';
import Sustainability from 'components/layout/About/Sustainability';

type PageProps = {
  aboutPages: SanityDocument;
  surveyLink: SanityDocument;
  navigation: SanityDocument;
  sustainability: SanityDocument;
  footer: SanityDocument;
  draftMode: boolean;
  token: string;
};

export default function AboutOS(props: PageProps) {

  return (
    <Layout
      title={'Sustainability'}
      navigation={props.navigation}
      footer={props.footer}>
      <Sustainability sustainability={props.sustainability} aboutPages={props.aboutPages}/>
      <SurveyLink surveyLink={props.surveyLink} />
      <Newsletter />
    </Layout>
  );
}

export const getStaticProps = async ({ draftMode = false }) => {
  const client = getClient(draftMode ? token : undefined);
  const allData = await client.fetch(SUSTAINABILITY_PAGE_QUERY);

  return {
    props: {
      ...allData,
      draftMode,
      token: draftMode ? token : '',
    },
  };
};