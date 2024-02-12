import Layout from 'components/layout/layout';
import { getClient } from '../../sanity/lib/client';
import { FOOTER_QUERY, NAVIGATION_QUERY } from '../../sanity/lib/queries';
import { token } from '../../sanity/lib/token';

export default function Accessibility({ navigation, footer }) {
  return (
    <Layout navigation={navigation} footer={footer} title={'Accessibility'}>
      <section className='bg-white py-10 md:py-20'>
        <div className='text-black container'>
          <h1 className='font-denton font-bold text-xl mb-6'>
            Accessibility Statement
          </h1>
          <div className='flex flex-col gap-4'>
            <div>
              <h2 className='font-bold font-denton text-lg'>
                Commitment to Accessibility
              </h2>
              <p>
                Curate Health is committed to making our website accessible to
                everyone, including people with disabilities.
              </p>
            </div>
            <div>
              <h2 className='font-bold font-denton text-lg'>
                Conformance Status
              </h2>
              <p>
                We strive to conform to WCAG 2.1 Level AA standards and update
                our site regularly to improve accessibility.
              </p>
            </div>
            <div>
              <h2 className='font-bold font-denton text-lg'>Feedback</h2>
              <p>
                We welcome your feedback on the accessibility of Curate Health.
                Please let us know if you encounter any barriers at{' '}
                <a className='underline' href='mailto:care@curatehealth.com'>
                  care@curatehealth.com
                </a>
              </p>
            </div>
            <div>
              <h2 className='font-bold font-denton text-lg'>Assistance</h2>
              <p>
                If you need any assistance accessing information or services,
                please contact us, and we will be happy to assist you.
              </p>
            </div>
            <div>
              <h2 className='font-bold font-denton text-lg'>
                Accessibility Features
              </h2>
              <p>
                Our website includes features like keyboard navigation, &
                text-to-speech functionality, etc.
              </p>
            </div>
            <div>
              <h2 className='font-bold font-denton text-lg'>
                Limitations and Alternatives
              </h2>
              <p>
                Despite our best efforts, some parts of the site may not be
                fully accessible. If you require information in a different
                format, please contact us.
              </p>
            </div>
            <div>
              <h2 className='font-bold font-denton text-lg'>
                Changes to Our Privacy Policy
              </h2>
              <p>
                We may update this policy from time to time. We will notify you
                of any changes by posting the new policy on this page.
              </p>
            </div>
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

  return {
    props: {
      navigation,
      footer,
      draftMode: preview,
      token: preview ? token : '',
    },
  };
};
