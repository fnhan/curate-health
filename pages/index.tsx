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
import { getClient } from '../sanity/lib/client';
import { POSTS_QUERY, heroSectionQuery } from '../sanity/lib/queries';
import { token } from '../sanity/lib/token';

type PageProps = {
  posts: SanityDocument[];
  heroSection: SanityDocument[];
  draftMode: boolean;
  token: string;
};

export default function Index({
  posts,
  draftMode,
  token,
  heroSection,
}: PageProps) {
  return (
    <Layout title={'Home'}>
      <Hero heroSection={heroSection} />
      <Highlight />
      <Clinic />
      <Services />
      <Products />
      <CurateCafe />
      <Blog posts={posts} draftMode={draftMode} token={token} />
      <Sustainability />
      <Survey />
      <Newsletter />
    </Layout>
  );
}

export const getStaticProps = async ({ draftMode = false }) => {
  const client = getClient(draftMode ? token : undefined);
  const posts = await client.fetch<SanityDocument[]>(POSTS_QUERY);
  const heroSection = await client.fetch<SanityDocument[]>(heroSectionQuery);

  return {
    props: {
      posts,
      heroSection,
      draftMode,
      token: draftMode ? token : '',
    },
  };
};
