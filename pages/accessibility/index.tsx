import Layout from 'components/layout/layout';
import { getClient } from '../../sanity/lib/client';
import {
  FOOTER_QUERY,
  NAVIGATION_QUERY,
  ACCESSIBILITY_QUERY,
} from '../../sanity/lib/queries';
import { token } from '../../sanity/lib/token';

export default function TermsOfUse({ navigation, footer, accessibility }) {
  return (
    <Layout
      navigation={navigation}
      footer={footer}
      title={'Accessibility'}
      description={''}
    >
      <section className='bg-white py-10 md:py-20'>
        <div className='text-black container'>
          <h1 className='font-denton font-bold text-xl mb-6'>
            Accessibility Statement
          </h1>
          <div className='flex flex-col gap-4'>
            {accessibility.map((term, index) => (
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
  const accessibility = await client.fetch(ACCESSIBILITY_QUERY);

  return {
    props: {
      navigation,
      footer,
      accessibility,
      draftMode: preview,
      token: preview ? token : '',
    },
  };
};
