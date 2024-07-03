import { Loading } from 'components/Loading';
import AbovePicture from 'components/layout/Services/treatment/AbovePicture';
import Content from 'components/layout/Services/treatment/Content';
import Frame from 'components/layout/Services/treatment/Frame';
import Green from 'components/layout/Services/treatment/Green';
import Hero from 'components/layout/Services/treatment/Hero';
import Quote from 'components/layout/Services/treatment/Quote';
import Written from 'components/layout/Services/treatment/Written';
import { GetStaticPaths, GetStaticProps } from 'next';
import { SanityDocument } from 'next-sanity';
import dynamic from 'next/dynamic';
import Newsletter from '../../../../components/layout/Home/Newsletter';
import Survey from '../../../../components/layout/Home/Survey';
import Layout from '../../../../components/layout/layout';
import { getClient } from '../../../../sanity/lib/client';
import {
  FOOTER_QUERY,
  NAVIGATION_QUERY,
  SURVERY_QUERY,
  TREATMENTS_QUERY,
  TREATMENTS_SLUG_QUERY,
  TREATMENT_BY_SLUG_QUERY,
} from '../../../../sanity/lib/queries';
import { token } from '../../../../sanity/lib/token';

type PageProps = {
  surveyLink: SanityDocument;
  treatments: SanityDocument[];
  treatment: SanityDocument;
  surveySection: SanityDocument[];
  navigation: SanityDocument;
  footer: SanityDocument;
  draftMode: boolean;
  token: string;
};

export default function TreatmentsPage(props: PageProps) {
  console.log('Props in TreatmentsPage:', props.treatment);

  const TreatmentsPreview = dynamic(
    () =>
      import(
        '../../../../components/layout/Services/treatment/TreatmentsPreview'
      )
  );

  if (props.draftMode) {
    return <TreatmentsPreview />;
  }

  if (!props.treatment) {
    return <Loading />;
  }

  return (
    <Layout
      title={props.treatment?.title || 'Treatments'}
      navigation={props.navigation}
      footer={props.footer}>

      <AbovePicture treatment={props.treatment} />
      <Hero treatment={props.treatment}/>
      <Quote treatment={props.treatment}/>
      <Content treatment={props.treatment}/>

      <div className='container bg-primary'>
        <Green />
      </div>
      <div className='bg-white'>
        <Frame />
      </div>
      <Written />
      <Newsletter />
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
}) => {
  const client = getClient(preview ? token : undefined);

  console.log('Fetching treatments');
  const treatments = await client.fetch(TREATMENTS_QUERY);
  console.log('Fetched treatments:', treatments);

  console.log('Fetching treatment by slug with params:', params);
  const treatment = await client.fetch(TREATMENT_BY_SLUG_QUERY, {
    treatmentSlug: params.treatmentSlug, // Ensure this matches the query parameter
  });
  console.log('Fetched treatment:', treatment);

  const navigation = await client.fetch(NAVIGATION_QUERY);
  const footer = await client.fetch(FOOTER_QUERY);
  const surveySection = await client.fetch(SURVERY_QUERY);

  return {
    props: {
      treatment,
      treatments,
      navigation,
      footer,
      surveySection,
      draftMode: preview,
      token: preview ? token : '',
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  console.log('Fetching paths for static generation');
  const paths = await getClient().fetch(TREATMENTS_SLUG_QUERY);
  console.log('Generated paths:', paths);

  return {
    paths: paths.map((path) => ({
      params: {
        slug: path.slug,
        treatmentSlug: path.treatmentSlug,
      },
    })),
    fallback: true,
  };
};
