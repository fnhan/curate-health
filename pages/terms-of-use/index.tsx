import Layout from 'components/layout/layout';
import { getClient } from '../../sanity/lib/client';
import { FOOTER_QUERY, NAVIGATION_QUERY } from '../../sanity/lib/queries';
import { token } from '../../sanity/lib/token';

export default function TermsOfUse({ navigation, footer }) {
  return (
    <Layout navigation={navigation} footer={footer} title={'Terms Of Use'}>
      <section className='bg-white py-10 md:py-20'>
        <div className='text-black container'>
          <h1 className='font-denton font-bold text-xl mb-6'>Terms Of Use</h1>
          <div className='flex flex-col gap-4'>
            <div>
              <h2 className='font-bold font-denton text-lg'>Introduction</h2>
              <p>
                Welcome to Curate Health. By accessing our website, you agree to
                these terms of use. Please read them carefully.
              </p>
            </div>
            <div>
              <h2 className='font-bold font-denton text-lg'>Use of Website</h2>
              <p>
                Curate Health grants you a non-exclusive, non-transferable,
                limited right to access, use and display the site and the
                materials provided hereon, provided that you comply fully with
                these Terms of Use.
              </p>
            </div>
            <div>
              <h2 className='font-bold font-denton text-lg'>
                Intellectual Property Rights
              </h2>
              <p>
                The content on the website, including text, graphics, code, and
                software is the property of Curate Health and is protected by
                copyright and intellectual property laws.
              </p>
            </div>
            <div>
              <h2 className='font-bold font-denton text-lg'>
                User Obligations
              </h2>
              <p>
                You agree to use the website only for lawful purposes and in a
                way that does not infringe the rights of, restrict, or inhibit
                anyone else's use and enjoyment of the website.
              </p>
            </div>
            <div>
              <h2 className='font-bold font-denton text-lg'>Disclaimers</h2>
              <p>
                Curate Health provides the website on an "as is" and "as
                available" basis without any representations or warranties of
                any kind.
              </p>
            </div>
            <div>
              <h2 className='font-bold font-denton text-lg'>
                Limitation of Liability
              </h2>
              <p>
                Curate Health will not be liable for any damages arising from
                the use or inability to use the website.
              </p>
            </div>
            <div>
              <h2 className='font-bold font-denton text-lg'>Governing Law</h2>
              <p>
                These terms shall be governed by [Applicable Law] and any
                disputes will be subject to the exclusive jurisdiction of the
                [Location] courts.
              </p>
            </div>
            <div>
              <h2 className='font-bold font-denton text-lg'>
                Changes to Terms
              </h2>
              <p>
                Curate Health reserves the right, at its sole discretion, to
                change, modify, add or remove any portion of these terms, at any
                time.
              </p>
            </div>
            <div>
              <h2 className='font-bold font-denton text-lg'>Contact Us</h2>
              <p>
                For any questions or comments regarding these terms, please
                contact us at{' '}
                <a className='underline' href='mailto:care@curatehealth.com'>
                  care@curatehealth.com
                </a>
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
