import { SanityDocument } from 'next-sanity';
import Layout from '../../components/layout/layout';
import SurveyLink from 'components/layout/Survey/SurveyLink';
import Newsletter from 'components/layout/Home/Newsletter';
import OurStory from 'components/layout/About/OurStory';
import { OUR_STORY_PAGE_QUERY, METADATA_BY_SLUG_QUERY } from '../../sanity/lib/queries';
import { getClient } from '../../sanity/lib/client';
import { token } from '../../sanity/lib/token';

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

export default function AboutOS(props: PageProps) {

  return (
    <Layout
      title={'Our-Story'}
      navigation={props.navigation}
<<<<<<< HEAD
      footer={props.footer}
      description={props.description}
      >
      <OurStory ourStory={props.ourStory} />
=======
      footer={props.footer}>
      <OurStory ourStory={props.ourStory} aboutPages={props.aboutPages}/>
>>>>>>> 8b1167e (add Nav to About pages, reformat schema and layout based off Figma design changes)
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
      token: draftMode ? token : '',
    },
  };
};

// export const getStaticPaths: GetStaticPaths = async () => {
//   const paths = await getClient().fetch(MetaData_Slug);
//   return { paths, fallback: true };
// };
