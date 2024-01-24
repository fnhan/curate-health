import Posts from 'components/layout/Blog-Page/Posts';
import Layout from 'components/layout/layout';
import { SanityDocument } from 'next-sanity';
import dynamic from 'next/dynamic';
import { getClient } from '../../sanity/lib/client';
import { POSTS_QUERY } from '../../sanity/lib/queries';
import { token } from '../../sanity/lib/token';

const PostsPreview = dynamic(
  () => import('../../components/layout/Blog-Page/PostsPreview')
);

type PageProps = {
  posts: SanityDocument[];
  draftMode: boolean;
  token: string;
};

export default function Home(props: PageProps) {
  return (
    <Layout title={'Blog'}>
      {props.draftMode ? (
        <PostsPreview posts={props.posts} />
      ) : (
        <Posts posts={props.posts} />
      )}
    </Layout>
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
