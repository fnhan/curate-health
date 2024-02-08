import Blog from 'components/layout/Home/Blog';
import Clinic from 'components/layout/Home/Clinic';
import CurateCafe from 'components/layout/Home/CurateCafe';
import Hero from 'components/layout/Home/Hero';
import Highlight from 'components/layout/Home/Highlight';
import Newsletter from 'components/layout/Home/Newsletter';
import Products from 'components/layout/Home/Products';
import Services from 'components/layout/Home/Services';
import Survey from 'components/layout/Home/Survey';
import Sustainability from 'components/layout/Home/Sustainability';
import Layout from 'components/layout/layout';
import { SanityDocument } from 'next-sanity';
import dynamic from 'next/dynamic';
import { getClient } from '../sanity/lib/client';
import { homePageQuery } from '../sanity/lib/queries';
import { token } from '../sanity/lib/token';

type PageProps = {
  posts: SanityDocument[];
  heroSection: SanityDocument[];
  highlightSection: SanityDocument[];
  clinicSection: SanityDocument[];
  services: SanityDocument[];
  productsSection: SanityDocument[];
  products: SanityDocument[];
  draftMode: boolean;
  token: string;
};

export default function Index(props: PageProps) {
  const HomePreview = dynamic(
    () => import('../components/layout/Home/HomePreview')
  );

  if (props.draftMode) {
    return <HomePreview />;
  }

  return (
    <Layout title={'Home'}>
      <Hero heroSection={props.heroSection} />
      <Highlight highlightSection={props.highlightSection} />
      <Clinic clinicSection={props.clinicSection} />
      <Services services={props.services} />
      <Products
        productsSection={props.productsSection}
        products={props.products}
      />
      <CurateCafe />
      <Blog posts={props.posts} />
      <Sustainability />
      <Survey />
      <Newsletter />
    </Layout>
  );
}

export const getStaticProps = async ({ draftMode = false }) => {
  const client = getClient(draftMode ? token : undefined);
  const allData = await client.fetch(homePageQuery);

  return {
    props: {
      ...allData,
      draftMode,
      token: draftMode ? token : '',
    },
  };
};
