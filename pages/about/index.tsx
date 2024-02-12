import Layout from '../../components/layout/layout';
import { getClient } from '../../sanity/lib/client';
import { FOOTER_QUERY, NAVIGATION_QUERY } from '../../sanity/lib/queries';
import { token } from '../../sanity/lib/token';

export default function About({ navigation, footer }) {
  return (
    <Layout navigation={navigation} footer={footer} title={'About'}>
      About
    </Layout>
  );
}

export const getStaticProps = async ({ preview = false }) => {
  const client = getClient(preview ? token : undefined);
  const navigation = await client.fetch(NAVIGATION_QUERY);
  const footer = await client.fetch(FOOTER_QUERY);

  return {
    props: {
      navigation,
      footer,
      draftMode: preview,
      token: preview ? token : '',
    },
  };
};
