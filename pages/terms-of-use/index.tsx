import Layout from 'components/layout/layout';
import { getClient } from '../../sanity/lib/client';
import { PortableText } from '@portabletext/react';
import { FOOTER_QUERY, NAVIGATION_QUERY, TERMS_OF_USE_QUERY } from '../../sanity/lib/queries';
import { token } from '../../sanity/lib/token';

export default function TermsOfUse({ navigation, footer, termsOfUse }) {
  return (
    <Layout navigation={navigation} footer={footer} title={'Terms Of Use'} description= {'Default description for term of use'}>
      <section className='bg-white py-10 md:py-20'>
        <div className='text-black container'>
          <h1 className='font-bold text-xl mb-6'>{termsOfUse.title}</h1>
          <div className='flex flex-col gap-4'>
            <PortableText value={termsOfUse.content} />
          </div>
        </div>
      </section>
    </Layout>
  );
}

export const getStaticProps = async ({ preview = false }) => {
  const client = getClient(preview ? token : undefined);
  const navigation = await client.fetch(NAVIGATION_QUERY);
  const footer = await client.fetch(FOOTER_QUERY);
  const termsOfUse = await client.fetch(TERMS_OF_USE_QUERY);

  return {
    props: {
      navigation,
      footer,
      termsOfUse,
      draftMode: preview,
      token: preview ? token : '',
    },
  };
};
