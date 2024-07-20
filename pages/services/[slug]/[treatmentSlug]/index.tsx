import { Loading } from 'components/Loading';
import AbovePicture from 'components/layout/Services/treatment/AbovePicture';
import Content from 'components/layout/Services/treatment/Content';
import Frame from 'components/layout/Services/treatment/Frame';
import Green from 'components/layout/Services/treatment/Green';
import Hero from 'components/layout/Services/treatment/Hero';
import Quote from 'components/layout/Services/treatment/Quote';
import { TreatmentNav } from 'components/layout/Services/treatment/TreatmentNav';
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
  METADATA_BY_SLUG_QUERY,
  NAVIGATION_QUERY,
  SURVEY_LINK_QUERY,
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
  serviceTitle: string;
  serviceSlug: string;
  meta: SanityDocument;
};

export default function TreatmentsPage(props: PageProps) {
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
      title={props.meta?.title || 'Treatments'}
      navigation={props.navigation}
      footer={props.footer}
      description={props.meta?.description || ''}
    >
      <AbovePicture treatment={props.treatment} />
      <TreatmentNav
        treatments={props.treatments}
        currentPageTitle={props.treatment?.title || 'Services'}
        serviceTitle={props.serviceTitle}
        serviceSlug={props.serviceSlug}
      />
      <Hero treatment={props.treatment} />
      <Quote treatment={props.treatment} />
      <Content treatment={props.treatment} />
      <Green treatment={props.treatment} />
      <Frame treatment={props.treatment} />
      <Written treatment={props.treatment} />
      <Survey surveyLink={props.surveySection} />
      <Newsletter />
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
}) => {
  const client = getClient(preview ? token : undefined);

  const treatments = await client.fetch(TREATMENTS_QUERY);
  const treatment = await client.fetch(TREATMENT_BY_SLUG_QUERY, {
    treatmentSlug: params?.treatmentSlug || '',
  });

  if (!treatment) {
    return { notFound: true };
  }

  const serviceSlug = treatment?.service?.slug?.current || '';
  const serviceTitle = treatment?.service?.title || '';
  const navigation = await client.fetch(NAVIGATION_QUERY);
  const footer = await client.fetch(FOOTER_QUERY);
  const surveySection = await client.fetch(SURVEY_LINK_QUERY);
  const meta = (
    await client.fetch<SanityDocument>(METADATA_BY_SLUG_QUERY, {
      slug: params.slug,
    })
  ).meta;

  return {
    props: {
      treatment,
      treatments,
      serviceTitle,
      serviceSlug,
      navigation,
      footer,
      surveySection,
      draftMode: preview,
      meta,
      token: preview ? token : '',
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await getClient().fetch(TREATMENTS_SLUG_QUERY);

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
