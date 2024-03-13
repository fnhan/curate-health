import Layout from '../../components/layout/layout';
import Image from 'next/image';
import { getClient } from '../../sanity/lib/client';
import { FOOTER_QUERY, NAVIGATION_QUERY } from '../../sanity/lib/queries';
import { token } from '../../sanity/lib/token';
import ContactUs from 'components/layout/Contact/ContactUs';
// import { dataset, projectId } from '../../../sanity/env';
// import imageUrlBuilder from '@sanity/image-url';

// const builder = imageUrlBuilder({ projectId, dataset });

export default function Contact({ navigation, footer }) {
  return (
    <Layout navigation={navigation} footer={footer} title={'Contact'}>
      <ContactUs/>
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
