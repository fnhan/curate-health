import Layout from 'components/layout/layout';
import { Loading } from 'components/Loading';
import { SanityDocument } from 'next-sanity';
import { useLiveQuery } from 'next-sanity/preview';
import { OUR_STORY_PAGE_QUERY } from '../../../sanity/lib/queries';
import Newsletter from '../Home/Newsletter';
import SurveyLink from '../Survey/SurveyLink';

type AboutPageData = {
  ourStory: SanityDocument;
  footer: SanityDocument;
  surveyLink: SanityDocument;
  navigation: SanityDocument;
};

export default function AboutPreview() {
  const [data, isLoading] = useLiveQuery<AboutPageData>(
    {} as AboutPageData,
    OUR_STORY_PAGE_QUERY
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
      title='About'
      description='About'
      navigation={data.navigation}
      footer={data.footer}>
      <SurveyLink surveyLink={data.surveyLink} />
      <Newsletter />
    </Layout>
  );
}
