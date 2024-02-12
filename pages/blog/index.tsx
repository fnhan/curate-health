import Posts from 'components/layout/Blog-Page/Posts';
import Layout from 'components/layout/layout';
import { SanityDocument } from 'next-sanity';
import dynamic from 'next/dynamic';
import { getClient } from '../../sanity/lib/client';
import {
  FOOTER_QUERY,
  NAVIGATION_QUERY,
  POSTS_QUERY,
} from '../../sanity/lib/queries';
import { token } from '../../sanity/lib/token';

const PostsPreview = dynamic(
  () => import('../../components/layout/Blog-Page/PostsPreview')
);

type PageProps = {
  posts: SanityDocument[];
  footer: SanityDocument;
  navigation: SanityDocument;
  draftMode: boolean;
  token: string;
};

export default function BlogPage(props: PageProps) {
  return (
    <Layout navigation={props.navigation} footer={props.footer} title={'Blog'}>
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
  const navigation = await client.fetch<SanityDocument>(NAVIGATION_QUERY);
  const footer = await client.fetch(FOOTER_QUERY);

  return {
    props: {
      posts,
      navigation,
      footer,
      draftMode,
      token: draftMode ? token : '',
    },
  };
};
