// @ts-nocheck
import { useRouter } from "next/router";

import { Loading } from "components/Loading";
import { useLiveQuery } from "next-sanity/preview";

import Survey from "../../../../components/layout/Home/Survey";
import {
  FOOTER_QUERY,
  METADATA_BY_SLUG_QUERY,
  NAVIGATION_QUERY,
  SURVEY_LINK_QUERY,
  TREATMENTS_QUERY,
  TREATMENT_BY_SLUG_QUERY,
} from "../../../../sanity/lib/queries";
import Newsletter from "../../Home/Newsletter";
import Layout from "../../layout";
import AbovePicture from "./AbovePicture";
import Content from "./Content";
import Frame from "./Frame";
import Green from "./Green";
import Hero from "./Hero";
import Quote from "./Quote";
import { TreatmentNav } from "./TreatmentNav";
import Written from "./Written";

export default function TreatmentsPreview() {
  const router = useRouter();
  const { slug } = router.query;

  const [treatment, isTreatmentLoading] = useLiveQuery(
    null,
    TREATMENT_BY_SLUG_QUERY,
    { slug }
  );

  const [surveySection, issurveySectionLoading] = useLiveQuery(
    null,
    SURVEY_LINK_QUERY
  );
  const [treatments, isTreatmentsLoading] = useLiveQuery(
    null,
    TREATMENTS_QUERY
  );
  const [footer, isFooterLoading] = useLiveQuery(null, FOOTER_QUERY);
  const [navigation, isNavigationLoading] = useLiveQuery(
    null,
    NAVIGATION_QUERY
  );

  if (isTreatmentLoading || isTreatmentsLoading || isFooterLoading) {
    return <Loading />;
  }

  const [meta, isMetaLoading] = useLiveQuery(null, METADATA_BY_SLUG_QUERY, {
    slug,
  });

  return (
    <Layout
      title={treatment?.title || "Treatments"}
      navigation={navigation}
      footer={footer}
      description={meta?.description || ""}
    >
      <TreatmentNav
        treatments={treatments}
        currentPageTitle={treatment?.title || "Services"}
        serviceTitle={treatment?.service?.title || ""}
        serviceSlug={treatment?.service?.slug.current || ""}
      />
      <AbovePicture treatment={treatment} />
      <Hero treatment={treatment} />
      <Quote treatment={treatment} />
      <Content treatment={treatment} />
      <Green treatment={treatment} />
      <Frame treatment={treatment} />
      <Written treatment={treatment} />
      <Survey surveyLink={surveySection} />
      <Newsletter />
    </Layout>
  );
}
