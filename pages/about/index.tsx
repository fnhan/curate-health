import { SanityDocument } from 'next-sanity';
import Layout from '../../components/layout/layout';
import { getClient } from '../../sanity/lib/client';
import {
  FOOTER_QUERY,
  METADATA_BY_SLUG_QUERY,
  MetaData_Slug,
  NAVIGATION_QUERY,
} from '../../sanity/lib/queries';
import { token } from '../../sanity/lib/token';

import { GetStaticPaths } from 'next';

type meta = {};

export default function About({ meta, navigation, footer }) {
  return (
    <Layout
      navigation={navigation}
      footer={footer}
      title={meta?.title || 'About'}
      description={meta?.description || 'About us'}
    >
      About
    </Layout>
  );
}

export const getStaticProps = async ({ params, preview = false }) => {
  const client = getClient(preview ? token : undefined);
  const navigation = await client.fetch(NAVIGATION_QUERY);
  const footer = await client.fetch(FOOTER_QUERY);

  const meta = (
    await client.fetch<SanityDocument>(METADATA_BY_SLUG_QUERY, {
      slug: '/about',
    })
  ).meta;

  return {
    props: {
      navigation,
      footer,
      meta,
      draftMode: preview,
      token: preview ? token : '',
    },
  };
};

// export const getStaticPaths: GetStaticPaths = async () => {
//   const paths = await getClient().fetch(MetaData_Slug);
//   return { paths, fallback: true };
// };
