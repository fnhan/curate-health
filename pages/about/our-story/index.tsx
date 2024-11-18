import OurStory from 'components/layout/About/OurStory';
import Newsletter from 'components/layout/Home/Newsletter';
import SurveyLink from 'components/layout/Survey/SurveyLink';
import { SanityDocument } from 'next-sanity';
import Layout from '../../../components/layout/layout';
import { getClient } from '../../../sanity/lib/client';
import {
  METADATA_BY_SLUG_QUERY,
  OUR_STORY_PAGE_QUERY,
} from '../../../sanity/lib/queries';
import { token } from '../../../sanity/lib/token';

type PageProps = {
  surveyLink: SanityDocument;
  navigation: SanityDocument;
  description: SanityDocument;
  ourStory: SanityDocument;
  footer: SanityDocument;
  draftMode: boolean;
  token: string;
  aboutPages: SanityDocument;
};

export default function OurStoryPage(props: PageProps) {
  return (
    <Layout
      title={'Our-Story'}
      navigation={props.navigation}
      footer={props.footer}
      description={props.description}>
      <OurStory ourStory={props.ourStory} aboutPages={props.aboutPages} />
      <SurveyLink surveyLink={props.surveyLink} />
      <Newsletter />
    </Layout>
  );
}

export const getStaticProps = async ({ draftMode = false }) => {
  const client = getClient(draftMode ? token : undefined);
  const allData = await client.fetch(OUR_STORY_PAGE_QUERY);

  const meta = (
    await client.fetch<SanityDocument>(METADATA_BY_SLUG_QUERY, {
      slug: '/about/our-story',
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
