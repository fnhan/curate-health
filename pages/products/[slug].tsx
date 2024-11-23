import { GetStaticPaths } from "next";
import dynamic from "next/dynamic";
import Image from "next/image";

import { Loading } from "components/Loading";
import Product from "components/layout/Product";
import { ProductsNav } from "components/layout/ProductsNav";
import ServiceDetails from "components/layout/Services/ServiceDetails";
import SurveyLink from "components/layout/Survey/SurveyLink";
import { SanityDocument } from "next-sanity";

import Newsletter from "../../components/layout/Home/Newsletter";
import Layout from "../../components/layout/layout";
import { getClient } from "../../sanity/lib/client";
import {
  METADATA_BY_SLUG_QUERY,
  SERVICES_QUERY,
  SURVEY_LINK_QUERY,
} from "../../sanity/lib/queries";
import {
  FOOTER_QUERY,
  NAVIGATION_QUERY,
  PRODUCTS_QUERY,
  PRODUCTS_SECTION_QUERY,
  PRODUCT_QUERY,
  PRODUCT_SLUG_QUERY,
} from "../../sanity/lib/queries";
import { token } from "../../sanity/lib/token";

type PageProps = {
  draftMode: boolean;
  token: string;
  services: SanityDocument[];
  product: SanityDocument;
  service: SanityDocument;
  navigation: SanityDocument;
  footer: SanityDocument;
  surveyLink: SanityDocument;
  meta: SanityDocument;
};

export default function ProductPage(props: PageProps) {
  const ServicesPreview = dynamic(
    () => import("../../components/layout/Services/ServicesPreview")
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
      title={props.meta?.title || "Product"}
      description={props.meta?.description || "Description here"}
    >
      <ProductsNav
        products={props.service}
        currentPageTitle={null}
      ></ProductsNav>
      <div className="relative z-50 bg-secondary/60 backdrop-blur-3xl">
        {/* <ServiceDetails service={props.services} treatments={props.services.treatments} /> */}

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

  const surveyLink = await client.fetch(SURVEY_LINK_QUERY);
  const product = await client.fetch<SanityDocument>(PRODUCT_QUERY, params);
  const services = await client.fetch<SanityDocument>(SERVICES_QUERY);
  const meta = (
    await client.fetch<SanityDocument>(METADATA_BY_SLUG_QUERY, {
      slug: "/products/" + params.slug,
    })
  ).meta;

  return {
    props: {
      service,
      services,
      product,
      navigation,
      footer,
      draftMode: preview,
      surveyLink,
      meta,
      token: preview ? token : "",
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await getClient().fetch(PRODUCT_SLUG_QUERY);

  return { paths, fallback: true };
};
