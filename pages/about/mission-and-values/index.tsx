import MissionAndValues from 'components/layout/About/MissionAndValues';
import Newsletter from 'components/layout/Home/Newsletter';
import SurveyLink from 'components/layout/Survey/SurveyLink';
import { SanityDocument } from 'next-sanity';
import Layout from '../../../components/layout/layout';
import { getClient } from '../../../sanity/lib/client';
import {
  METADATA_BY_SLUG_QUERY,
  MISSION_AND_VALUES_PAGE_QUERY,
} from '../../../sanity/lib/queries';
import { token } from '../../../sanity/lib/token';

type PageProps = {
  aboutPages: SanityDocument;
  surveyLink: SanityDocument;
  navigation: SanityDocument;
  missionAndValues: SanityDocument;
  footer: SanityDocument;
  description: SanityDocument;
  draftMode: boolean;
  token: string;
};

export default function MissionValues(props: PageProps) {
  return (
    <Layout
      title={'Mission-And-Values'}
      navigation={props.navigation}
      footer={props.footer}
      description={props.description}>
      <MissionAndValues
        missionAndValues={props.missionAndValues}
        aboutPages={props.aboutPages}
      />
      <SurveyLink surveyLink={props.surveyLink} />
      <Newsletter />
    </Layout>
  );
}

export const getStaticProps = async ({ draftMode = false }) => {
  const client = getClient(draftMode ? token : undefined);
  const allData = await client.fetch(MISSION_AND_VALUES_PAGE_QUERY);

  const meta = (
    await client.fetch<SanityDocument>(METADATA_BY_SLUG_QUERY, {
      slug: '/about/mission-and-values',
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
