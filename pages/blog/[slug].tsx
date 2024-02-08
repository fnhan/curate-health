import Post from 'components/layout/Blog-Page/Post';
import Layout from 'components/layout/layout';
import { GetStaticPaths } from 'next';
import { QueryParams, SanityDocument } from 'next-sanity';
import dynamic from 'next/dynamic';
import { getClient } from '../../sanity/lib/client';
import {
  FOOTER_QUERY,
  POSTS_SLUG_QUERY,
  POST_QUERY,
} from '../../sanity/lib/queries';
import { token } from '../../sanity/lib/token';

const PostPreview = dynamic(
  () => import('../../components/layout/Blog-Page/PostPreview')
);

type PageProps = {
  post: SanityDocument;
  params: QueryParams;
  footer: SanityDocument;
  draftMode: boolean;
  token: string;
};

export default function SinglePost(props: PageProps) {
  return (
    <Layout footer={props.footer} title={'Blog'}>
      {props.draftMode ? (
        <PostPreview post={props.post} params={props.params} />
      ) : (
        <Post post={props.post} />
      )}
      ;
    </Layout>
  );
}

export const getStaticProps = async ({ params = {}, draftMode = false }) => {
  const client = getClient(draftMode ? token : undefined);
  const post = await client.fetch<SanityDocument>(POST_QUERY, params);
  const footer = await client.fetch<SanityDocument>(FOOTER_QUERY);

  console.log('footer in /blog/[slug]', footer);

  return {
    props: {
      post,
      params,
      footer,
      draftMode,
      token: draftMode ? token : '',
    },
  };
};

// Prepare Next.js to know which routes already exist
export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await getClient().fetch(POSTS_SLUG_QUERY);

  return { paths, fallback: true };
};
