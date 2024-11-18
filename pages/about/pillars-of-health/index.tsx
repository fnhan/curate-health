import PillarsofHealth from 'components/layout/About/PillarsOfHealth';
import Newsletter from 'components/layout/Home/Newsletter';
import SurveyLink from 'components/layout/Survey/SurveyLink';
import { SanityDocument } from 'next-sanity';
import Layout from '../../../components/layout/layout';
import { getClient } from '../../../sanity/lib/client';
import {
  METADATA_BY_SLUG_QUERY,
  PILLARS_OF_HEALTH_PAGE_QUERY,
} from '../../../sanity/lib/queries';
import { token } from '../../../sanity/lib/token';

type PageProps = {
  aboutPages: SanityDocument;
  surveyLink: SanityDocument;
  navigation: SanityDocument;
  pillarsOfHealth: SanityDocument;
  footer: SanityDocument;
  description: SanityDocument;
  draftMode: boolean;
  token: string;
};

export default function PillarsHealth(props: PageProps) {
  return (
    <Layout
      title={'Pillars-of-Health'}
      navigation={props.navigation}
      footer={props.footer}
      description={props.description}>
      <PillarsofHealth
        pillarsOfHealth={props.pillarsOfHealth}
        aboutPages={props.aboutPages}
      />
      <SurveyLink surveyLink={props.surveyLink} />
      <Newsletter />
    </Layout>
  );
}

export const getStaticProps = async ({ draftMode = false }) => {
  const client = getClient(draftMode ? token : undefined);
  const allData = await client.fetch(PILLARS_OF_HEALTH_PAGE_QUERY);

  const meta = (
    await client.fetch<SanityDocument>(METADATA_BY_SLUG_QUERY, {
      slug: '/about/pillars-of-health',
    })
  ).meta;

  return {
    props: {
      ...allData,
      draftMode,
      meta,
      token: draftMode ? token : '',
    },
  };
};
