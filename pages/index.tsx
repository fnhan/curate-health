import Posts from 'components/layout/Blog-Page/Posts';
import Blog from 'components/layout/Home/Blog';
import Clinic from 'components/layout/Home/Clinic';
import CurateCafe from 'components/layout/Home/CurateCafe';
import Highlight from 'components/layout/Home/Highlight';
import HomeLayout from 'components/layout/Home/HomeLayout';
import Newsletter from 'components/layout/Home/Newsletter';
import Products from 'components/layout/Home/Products';
import Services from 'components/layout/Home/Services';
import Survey from 'components/layout/Home/Survey';
import Sustainability from 'components/layout/Home/Sustainability';
import { SanityDocument } from 'next-sanity';
import dynamic from 'next/dynamic';
import { getClient } from '../sanity/lib/client';
import { POSTS_QUERY } from '../sanity/lib/queries';
import { token } from '../sanity/lib/token';

type PageProps = {
  posts: SanityDocument[];
  draftMode: boolean;
  token: string;
};

export default function Index({ posts, draftMode, token }: PageProps) {
  return (
    <HomeLayout title={'Home'}>
      <Highlight />
      <Clinic />
      <Services />
      <Products />
      <CurateCafe />
      <Blog posts={posts} draftMode={draftMode} token={token} />
      <Sustainability />
      <Survey />
      <Newsletter />
    </HomeLayout>
  );
}

export const getStaticProps = async ({ draftMode = false }) => {
  const client = getClient(draftMode ? token : undefined);
  const posts = await client.fetch<SanityDocument[]>(POSTS_QUERY);

  return {
    props: {
      posts,
      draftMode,
      token: draftMode ? token : '',
    },
  };
};
