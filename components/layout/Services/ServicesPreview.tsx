import { Loading } from 'components/Loading';
import { useLiveQuery } from 'next-sanity/preview';
import { useRouter } from 'next/router';
import Survey from '../../../components/layout/Home/Survey';
import {
  FOOTER_QUERY,
  NAVIGATION_QUERY,
  SERVICE_BY_SLUG_QUERY,
  SERVICES_QUERY,
  SURVEY_LINK_QUERY,
  TREATMENTS_QUERY,
} from '../../../sanity/lib/queries';
import Newsletter from '../Home/Newsletter';
import Layout from '../layout';
import Picture from './Picture';
import ServiceDetails from './ServiceDetails';
import { ServicesNav } from './ServicesNav';

export default function ServicesPreview() {
  const router = useRouter();
  const { slug } = router.query;

  const [service, isServiceLoading] = useLiveQuery(
    null,
    SERVICE_BY_SLUG_QUERY,
    { slug }
  );

  const [treatments, istreatmentsLoading] = useLiveQuery(
    null,
    TREATMENTS_QUERY
  );
  const [surveySection, issurveySectionLoading] = useLiveQuery(
    null,
    SURVEY_LINK_QUERY
  );
  const [services, isServicesLoading] = useLiveQuery(null, SERVICES_QUERY);
  const [footer, isFooterLoading] = useLiveQuery(null, FOOTER_QUERY);
  const [navigation, isNavigationLoading] = useLiveQuery(
    null,
    NAVIGATION_QUERY
  );

  if (isServiceLoading || isServicesLoading || isFooterLoading) {
    return <Loading />;
  }

  return (
    <Layout
      navigation={navigation}
      footer={footer}
      title={service?.title || 'Services'}
    >
      <Picture service={service} />
      <ServicesNav services={services} currentPageTitle={service.title} />
      <ServiceDetails service={service} treatments={service.treatments} />
      <Survey surveyLink={surveySection} />
      <Newsletter />
    </Layout>
  );
}
