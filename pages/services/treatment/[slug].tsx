import { Loading } from 'components/Loading';
import { GetStaticPaths } from 'next';
import { SanityDocument } from 'next-sanity';
import dynamic from 'next/dynamic';
import Newsletter from '../../../components/layout/Home/Newsletter';
import Survey from '../../../components/layout/Home/Survey';
import Layout from '../../../components/layout/layout';
import { getClient } from '../../../sanity/lib/client';
import {
  FOOTER_QUERY,
  NAVIGATION_QUERY,
  TREATMENTS_SLUG_QUERY,
  TREATMENT_BY_SLUG_QUERY,
  SURVERY_QUERY,
  TREATMENTS_QUERY,
} from '../../../sanity/lib/queries';
import { token } from '../../../sanity/lib/token';
import AbovePicture from 'components/layout/Services/treatment/AbovePicture';
import Hero from 'components/layout/Services/treatment/Hero';
import Quote from 'components/layout/Services/treatment/Quote';
import Content  from 'components/layout/Services/treatment/Content';
import Green  from 'components/layout/Services/treatment/Green';
import Frame from 'components/layout/Services/treatment/Frame';
import Written from 'components/layout/Services/treatment/Written';
// import StickyNav from 'components/layout/Services/treatment/StickyNav';

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
  console.log('Props in TreatmentsPage:', props); 

  const TreatmentsPreview = dynamic(
    () => import('../../../components/layout/Services/treatment/TreatmentsPreview')
  );

  if (props.draftMode) {
    return <TreatmentsPreview />;
  }

  if (!props.treatment) {
    return <Loading />;
  }



  return (
    <Layout title={props.treatment?.title || 'Treatments'}
     navigation={props.navigation} 
     footer={props.footer}>
      <div>
        <AbovePicture treatment={props.treatment}/>
      </div>
      <div className="bg-secondary backdrop-blur-3xl sticky top-[100px] z-50">
      </div>
      <div className='bg-white'>
        <Hero/>
      </div>
      <div className='bg-secondary opacity-100'>
        <Quote/>
      </div>
      <div className='bg-white'>
        <Content/>
      </div>
      <div className='container bg-primary'>
        <Green/>
      </div>
      <div className='bg-white'>
        <Frame/>
      </div>
      <Written/>
      <Newsletter />
    </Layout>
  );
};

export const getStaticProps = async ({ params, preview = false }) => {
  const client = getClient(preview ? token : undefined);
  const treatments = await client.fetch(TREATMENTS_QUERY);
  const treatment = await client.fetch(TREATMENT_BY_SLUG_QUERY, {
    slug: params.slug,
  });


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
  const paths = await getClient().fetch(TREATMENTS_SLUG_QUERY);
  console.log('Generated paths:', paths); 
  return { paths, fallback: true };
};