import { SanityDocument } from 'next-sanity';
import Layout from '../../components/layout/layout';
import { getClient } from '../../sanity/lib/client';
import {
  FOOTER_QUERY,
  METADATA_BY_SLUG_QUERY,
  NAVIGATION_QUERY,
} from '../../sanity/lib/queries';
import { token } from '../../sanity/lib/token';

type meta = {};

export default function Booking({ meta, navigation, footer }) {
  return (
    <Layout
      navigation={navigation}
      footer={footer}
      title={meta.title || 'Booking'}
      description={meta.description || ''}
    >
      Booking
    </Layout>
  );
}

export const getStaticProps = async ({ preview = false }) => {
  const client = getClient(preview ? token : undefined);
  const navigation = await client.fetch(NAVIGATION_QUERY);
  const footer = await client.fetch(FOOTER_QUERY);
  const meta = (
    await client.fetch<SanityDocument>(METADATA_BY_SLUG_QUERY, {
      slug: '/booking',
    })
  ).meta;

  return {
    props: {
      navigation,
      footer,
      draftMode: preview,
      meta,
      token: preview ? token : '',
    },
  };
};
