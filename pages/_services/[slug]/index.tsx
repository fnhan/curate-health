import { GetStaticPaths } from "next";
import dynamic from "next/dynamic";

import { Loading } from "components/Loading";
import Picture from "components/layout/Services/Picture";
import ServiceDetails from "components/layout/Services/ServiceDetails";
import { ServicesNav } from "components/layout/Services/ServicesNav";
import { SanityDocument } from "next-sanity";

import Newsletter from "../../../components/layout/Home/Newsletter";
import Survey from "../../../components/layout/Home/Survey";
import Layout from "../../../components/layout/layout";
import { getClient } from "../../../sanity/lib/client";
import {
  FOOTER_QUERY,
  METADATA_BY_SLUG_QUERY,
  NAVIGATION_QUERY,
  SERVICES_QUERY,
  SERVICES_SLUG_QUERY,
  SERVICE_BY_SLUG_QUERY,
  SURVEY_LINK_QUERY,
  TREATMENTS_QUERY,
} from "../../../sanity/lib/queries";
import { token } from "../../../sanity/lib/token";

type PageProps = {
  draftMode: boolean;
  token: string;
  services: SanityDocument[];
  service: SanityDocument;
  navigation: SanityDocument;
  surveySection: SanityDocument[];
  treatments: SanityDocument[];
  footer: SanityDocument;
  meta: SanityDocument;
};

export default function ServicesPage(props: PageProps) {
  const ServicesPreview = dynamic(
    () => import("../../../components/layout/Services/ServicesPreview")
  );

  if (props.draftMode) {
    return <ServicesPreview />;
  }

  if (!props.service) {
    return <Loading />;
  }

  return (
    <Layout
      navigation={props.navigation}
      footer={props.footer}
      title={props.service?.title || "Services"}
      description={props.service?.meta?.description || ""}
    >
      <Picture service={props.service} />
      <ServicesNav
        services={props.services}
        currentPageTitle={props.service?.title || "Services"}
      />
      <ServiceDetails
        service={props.service}
        treatments={props.service.treatments}
      />
      <Survey surveyLink={props.surveySection} />
      <Newsletter />
    </Layout>
  );
}

export const getStaticProps = async ({ params, preview = false }) => {
  const client = getClient(preview ? token : undefined);

  const services = await client.fetch(SERVICES_QUERY);
  const service = await client.fetch(SERVICE_BY_SLUG_QUERY, {
    slug: params?.slug || "",
  });

  if (!service) {
    return { notFound: true };
  }

  const navigation = await client.fetch(NAVIGATION_QUERY);
  const footer = await client.fetch(FOOTER_QUERY);
  const surveySection = await client.fetch(SURVEY_LINK_QUERY);

  const treatments = await client.fetch(TREATMENTS_QUERY, {
    serviceSlug: service?.slug || "",
  });

  const meta = (
    await client.fetch<SanityDocument>(METADATA_BY_SLUG_QUERY, {
      slug: params.slug,
    })
  ).meta;

  return {
    props: {
      services,
      service,
      navigation,
      footer,
      surveySection,
      treatments,
      meta,
      draftMode: preview,
      token: preview ? token : "",
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await getClient().fetch(SERVICES_SLUG_QUERY);
  return { paths, fallback: true };
};
