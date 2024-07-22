import Layout from 'components/layout/layout';
import { getClient } from '../../sanity/lib/client';
import { SanityDocument } from 'next-sanity';
import {
  FOOTER_QUERY,
  METADATA_BY_SLUG_QUERY,
  NAVIGATION_QUERY,
  TERMS_OF_USE_QUERY,
} from '../../sanity/lib/queries';
import { token } from '../../sanity/lib/token';

type meta = {};

export default function TermsOfUse({ meta, navigation, footer, termsOfUse }) {
  return (
    <Layout
      navigation={navigation}
      footer={footer}
      title={'Terms Of Use'}
      description={meta?.description || 'Terms of use'}
    >
      <section className='bg-white py-10 md:py-20'>
        <div className='text-black container'>
          <h1 className='font-bold text-xl mb-6'>Terms Of Use</h1>
          <div className='flex flex-col gap-4'>
            {termsOfUse.map((term, index) => (
              <div key={index}>
                <h2 className='font-bold font-denton text-lg'>{term.title}</h2>
                <p>{term.content}</p>
              </div>
            ))}
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
  const meta = (
    await client.fetch<SanityDocument>(METADATA_BY_SLUG_QUERY, {
      slug: '/term-of-use',
    })
  ).meta;

  return {
    props: {
      navigation,
      footer,
      termsOfUse,
      draftMode: preview,
      meta,
      token: preview ? token : '',
    },
  };
};
