import HeroPost from 'components/layout/Blog-Page/hero-post';
import MoreStories from 'components/layout/Blog-Page/more-stories';
import Intro from 'components/layout/Home/Hero';
import Layout from 'components/layout/layout';
import { getAllPostsForHome } from 'lib/api';
import { GetStaticProps } from 'next';

export default function Blog({ allPosts: { edges } }) {
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
