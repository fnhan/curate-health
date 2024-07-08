import { Loading } from 'components/Loading';
import { CarouselNav } from 'components/layout/Services/CarouselNav';
import ServiceDetails from 'components/layout/Services/ServiceDetails';
import { GetStaticPaths } from 'next';
import { SanityDocument } from 'next-sanity';
import dynamic from 'next/dynamic';
import Newsletter from '../../components/layout/Home/Newsletter';
import Layout from '../../components/layout/layout';
import { getClient } from '../../sanity/lib/client';
import Image from 'next/image';
import { SERVICES_QUERY, SURVEY_LINK_QUERY } from '../../sanity/lib/queries';
import {
  FOOTER_QUERY,
  NAVIGATION_QUERY,
  PRODUCTS_SECTION_QUERY,
  PRODUCTS_QUERY,
  PRODUCT_SLUG_QUERY,
  PRODUCT_QUERY,
} from '../../sanity/lib/queries';
import { token } from '../../sanity/lib/token';
import Product from 'components/layout/Product';
import SurveyLink from 'components/layout/Survey/SurveyLink';

type PageProps = {
  draftMode: boolean;
  token: string;
  services: SanityDocument[];
  product: SanityDocument;
  service: SanityDocument;
  navigation: SanityDocument;
  footer: SanityDocument;
  surveyLink: SanityDocument;
};

export default function ServicesPage(props: PageProps) {
  const ServicesPreview = dynamic(
    () => import('../../components/layout/Services/ServicesPreview')
  );

  if (props.draftMode) {
    return <ServicesPreview />;
  }

  if (!props.product) {
    return <Loading />;
  }

  return (
    <Layout
      navigation={props.navigation}
      footer={props.footer}
      title={props.product?.meta?.title || 'Product'}
      description={props.product?.meta?.description}
    >
      <div className='relative bg-secondary/60 backdrop-blur-3xl z-50'>
        <CarouselNav services={props.services} />

        <Product product={props.product}></Product>
      </div>
      {/* <div className='py-10'>
        <ServiceDetails service={props.service} />
      </div> */}
      <SurveyLink surveyLink={props.surveyLink} />
      <Newsletter />
    </Layout>
  );
}

export const getStaticProps = async ({ params, preview = false }) => {
  const client = getClient(preview ? token : undefined);
  const products = await client.fetch(PRODUCTS_SECTION_QUERY);
  const service = await client.fetch(PRODUCTS_QUERY, {
    slug: params.slug,
  });
  const navigation = await client.fetch(NAVIGATION_QUERY);
  const footer = await client.fetch(FOOTER_QUERY);
  // const product = await client.fetch<SanityDocument>(
  //   PRODUCT_SLUG_QUERY,
  //   params
  // );
  const surveyLink = await client.fetch(SURVEY_LINK_QUERY);
  const product = await client.fetch<SanityDocument>(PRODUCT_QUERY, params);
  const services = await client.fetch<SanityDocument>(SERVICES_QUERY);

  return {
    props: {
      service,
      services,
      product,
      navigation,
      footer,
      draftMode: preview,
      surveyLink,
      token: preview ? token : '',
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await getClient().fetch(PRODUCT_SLUG_QUERY);

  return { paths, fallback: true };
};
