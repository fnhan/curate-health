import Layout from '../../components/layout/layout';
import { getClient } from '../../sanity/lib/client';
import { FOOTER_QUERY } from '../../sanity/lib/queries';
import { token } from '../../sanity/lib/token';

export default function Products({ footer }) {
  return (
    <Layout footer={footer} title={'Products'}>
      Products
    </Layout>
  );
}

export const getStaticProps = async ({ preview = false }) => {
  const client = getClient(preview ? token : undefined);
  const footer = await client.fetch(FOOTER_QUERY);

  return {
    props: {
      footer,
      draftMode: preview,
      token: preview ? token : '',
    },
  };
};
