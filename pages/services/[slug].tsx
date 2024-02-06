import { Loading } from 'components/Loading';
import { CarouselNav } from 'components/layout/Services/CarouselNav';
import ServiceDetails from 'components/layout/Services/ServiceDetails';
import { GetStaticPaths } from 'next';
import { SanityDocument } from 'next-sanity';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Newsletter from '../../components/layout/Home/Newsletter';
import Layout from '../../components/layout/layout';
import { getClient } from '../../sanity/lib/client';
import {
  SERVICES_QUERY,
  SERVICES_SLUG_QUERY,
  SERVICE_BY_SLUG_QUERY,
} from '../../sanity/lib/queries';
import { token } from '../../sanity/lib/token';

type PageProps = {
  draftMode: boolean;
  token: string;
  services: SanityDocument[];
  service: SanityDocument[];
};

export default function ServicesPage(props: PageProps) {
  const ServicesPreview = dynamic(
    () => import('../../components/layout/Services/ServicesPreview')
  );

  if (props.draftMode) {
    return <ServicesPreview />;
  }

  const router = useRouter();
  const { slug } = router.query;

  const service = props.services.find((service) => service.slug === slug);

  if (!service) {
    return <Loading />;
  }

  return (
    <Layout title={service?.title || 'Services'}>
      <div className='bg-secondary/60 backdrop-blur-3xl sticky top-[105px] z-50'>
        <CarouselNav services={props.services} />
      </div>
      <div className='py-10'>
        <ServiceDetails service={props.service} />
      </div>
      <Newsletter />
    </Layout>
  );
}

export const getStaticProps = async ({ params, preview = false }) => {
  const client = getClient(preview ? token : undefined);
  const services = await client.fetch(SERVICES_QUERY);
  const service = await client.fetch(SERVICE_BY_SLUG_QUERY, {
    slug: params.slug,
  });

  return {
    props: {
      service,
      services,
      draftMode: preview,
      token: preview ? token : '',
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await getClient().fetch(SERVICES_SLUG_QUERY);

  return { paths, fallback: true };
};
