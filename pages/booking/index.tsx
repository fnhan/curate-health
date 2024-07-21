import { SanityDocument } from 'next-sanity';
import Layout from '../../components/layout/layout';
import { getClient } from '../../sanity/lib/client';
import {
  FOOTER_QUERY,
  METADATA_BY_SLUG_QUERY,
  NAVIGATION_QUERY,
} from '../../sanity/lib/queries';
import { token } from '../../sanity/lib/token';

type PageProps = {
  meta: SanityDocument;
};

export default function Booking(props: PageProps, { navigation, footer }) {
  return (
    <Layout
      navigation={navigation}
      footer={footer}
      title={props.meta.title || 'Booking'}
      description={props.meta.description || ''}
    >
      Booking
    </Layout>
  );
}

export const getStaticProps = async (params, { preview = false }) => {
  const client = getClient(preview ? token : undefined);
  const navigation = await client.fetch(NAVIGATION_QUERY);
  const footer = await client.fetch(FOOTER_QUERY);
  const meta = (
    await client.fetch<SanityDocument>(METADATA_BY_SLUG_QUERY, {
      slug: params.slug,
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
