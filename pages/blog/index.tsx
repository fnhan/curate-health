import HeroPost from 'components/hero-post';
import Intro from 'components/intro';
import Layout from 'components/layout/layout';
import MoreStories from 'components/more-stories';
import { getAllPostsForHome } from 'lib/api';
import { CMS_NAME } from 'lib/constants';
import { GetStaticProps } from 'next';
import Head from 'next/head';

export default function Index({ allPosts: { edges } }) {
  const heroPost = edges[0]?.node;
  const morePosts = edges.slice(1);

  return (
    <Layout title={'Blog'}>
      <div>
        <Intro />
        {heroPost && (
          <HeroPost
            title={heroPost.title}
            coverImage={heroPost.featuredImage}
            date={heroPost.date}
            author={heroPost.author}
            slug={heroPost.slug}
            excerpt={heroPost.excerpt}
          />
        )}
        {morePosts.length > 0 && <MoreStories posts={morePosts} />}
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {
  const allPosts = await getAllPostsForHome(preview);

  return {
    props: { allPosts, preview },
    revalidate: 10,
  };
};
