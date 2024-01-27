import ErrorPage from 'next/error';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Container from '../../components/layout/Blog-Page/container';
import Header from '../../components/layout/Blog-Page/header';
import MoreStories from '../../components/layout/Blog-Page/more-stories';
import PostBody from '../../components/layout/Blog-Page/post-body';
import PostHeader from '../../components/layout/Blog-Page/post-header';
import PostTitle from '../../components/layout/Blog-Page/post-title';
import SectionSeparator from '../../components/layout/Blog-Page/section-separator';
import Tags from '../../components/layout/Blog-Page/tags';
import Layout from '../../components/layout/layout';

export default function Post({ post, posts, preview }) {
  const router = useRouter();
  const morePosts = posts?.edges;

  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <Layout title={`${post?.title}`}>
      <Container>
        <Header />
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <article>
              <Head>
                <meta
                  property='og:image'
                  content={post.featuredImage?.node.sourceUrl}
                />
              </Head>
              <PostHeader
                title={post.title}
                coverImage={post.featuredImage}
                date={post.date}
                author={post.author}
                categories={post.categories}
              />
              <PostBody content={post.content} />
              <footer>
                {post.tags.edges.length > 0 && <Tags tags={post.tags} />}
              </footer>
            </article>

            <SectionSeparator />
            {morePosts.length > 0 && <MoreStories posts={morePosts} />}
          </>
        )}
      </Container>
    </Layout>
  );
}
