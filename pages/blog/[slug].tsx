import { Loading } from 'components/Loading';
import Post from 'components/layout/Blog-Page/Post';
import Layout from 'components/layout/layout';
import { GetStaticPaths } from 'next';
import { QueryParams, SanityDocument } from 'next-sanity';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { getClient } from '../../sanity/lib/client';
import {
  FOOTER_QUERY,
  METADATA_BY_SLUG_QUERY,
  NAVIGATION_QUERY,
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
  navigation?: SanityDocument;
  footer?: SanityDocument;
  draftMode: boolean;
  token: string;
  description: string;
  meta?: SanityDocument;
};

export default function SinglePost(props: PageProps) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className='min-h-screen flex justify-center'>
        <Loading />
      </div>
    );
  }

  const { post, params, navigation, footer, draftMode } = props;
  return (
    <Layout
      navigation={navigation}
      footer={footer}
      title={'Blog'}
      description={props.description}
    >
      {draftMode ? (
        <PostPreview post={post} params={params} />
      ) : (
        <Post post={post} />
      )}
      ;
    </Layout>
  );
}

export const getStaticProps = async ({ params = {}, draftMode = false }) => {
  const client = getClient(draftMode ? token : undefined);
  const post = await client.fetch<SanityDocument>(POST_QUERY, params);
  const navigation = await client.fetch<SanityDocument>(NAVIGATION_QUERY);
  const footer = await client.fetch<SanityDocument>(FOOTER_QUERY);
  const meta = (
    await client.fetch<SanityDocument>(METADATA_BY_SLUG_QUERY, {
      slug: params,
    })
  ).meta;

  return {
    props: {
      post,
      params,
      navigation,
      footer,
      draftMode,
      meta,
      token: draftMode ? token : '',
    },
  };
};

// Prepare Next.js to know which routes already exist
export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await getClient().fetch(POSTS_SLUG_QUERY);

  return { paths, fallback: true };
};
