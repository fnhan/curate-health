import { Loading } from 'components/Loading';
import { useLiveQuery } from 'next-sanity/preview';
import { useRouter } from 'next/router';
import {
  FOOTER_QUERY,
  NAVIGATION_QUERY,
  TREATMENT_BY_SLUG_QUERY,
  SURVERY_QUERY,
  TREATMENTS_QUERY,
} from '../../../../sanity/lib/queries';
import Newsletter from '../../Home/Newsletter';
import Layout from '../../layout';
import AbovePicture from './AbovePicture';
import Content from './Content';
import Frame from './Frame';
import Green from './Green';
import Hero from './Hero';
import Quote from './Quote';
import Written from './Written';
import Survey from '../../../../components/layout/Home/Survey';


export default function TreatmentsPreview() {
  const router = useRouter();
  const { slug } = router.query;

  const [treatment, isTreatmentLoading] = useLiveQuery(
    null,
    TREATMENT_BY_SLUG_QUERY,
    { slug }
  );
  const [surveySection, issurveySectionLoading] = useLiveQuery(null, SURVERY_QUERY);
  const [Treatments, isTreatmentsLoading] = useLiveQuery(null, TREATMENTS_QUERY);
  const [footer, isFooterLoading] = useLiveQuery(null, FOOTER_QUERY);
  const [navigation, isNavigationLoading] = useLiveQuery(
    null,
    NAVIGATION_QUERY
  );

  if (isTreatmentLoading || isTreatmentsLoading || isFooterLoading) {
    return <Loading />;
  }

  return (
    <Layout
      title={treatment?.title || 'Treatments'}
      navigation={navigation}
      footer={footer}>

      <AbovePicture treatment={treatment} />
      <Hero treatment={treatment}/>
      <Quote treatment={treatment}/>
      <Content treatment={treatment}/>
      <Green treatment={treatment}/>
      <Frame />
      <Written treatment={treatment}/>
      <Survey surveySection={surveySection} />
      <Newsletter />
    </Layout>
  );
}