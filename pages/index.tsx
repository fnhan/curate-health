import Blog from 'components/layout/Home/Blog';
import Clinic from 'components/layout/Home/Clinic';
import CurateCafe from 'components/layout/Home/CurateCafe';
import Highlight from 'components/layout/Home/Highlight';
import HomeLayout from 'components/layout/Home/HomeLayout';
import Products from 'components/layout/Home/Products';
import Services from 'components/layout/Home/Services';
import Survey from 'components/layout/Home/Survey';
import Sustainability from 'components/layout/Home/Sustainability';
import { getTwoMostRecentPosts } from 'lib/api';
import { GetStaticProps } from 'next';

export default function Index({ mostRecentPosts }) {
  return (
    <HomeLayout title={'Home'}>
      <Highlight />
      <Clinic />
      <Services />
      <Products />
      <CurateCafe />
      <Blog posts={mostRecentPosts} />
      <Sustainability />
      <Survey />
    </HomeLayout>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const mostRecentPostsData = await getTwoMostRecentPosts(preview);
  const mostRecentPosts = mostRecentPostsData.edges; // Make sure this matches the expected structure

  return {
    props: { mostRecentPosts, preview },
    revalidate: 10,
  };
};
