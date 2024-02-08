import Layout from 'components/layout/layout';
import { getClient } from '../../sanity/lib/client';
import { FOOTER_QUERY } from '../../sanity/lib/queries';
import { token } from '../../sanity/lib/token';

export default function Privacy({ footer }) {
  return (
    <Layout footer={footer} title={'Privacy & Cookies'}>
      <section className='bg-white py-10 md:py-20'>
        <div className='text-black container'>
          <h1 className='font-denton font-bold text-xl mb-6'>
            Privacy & Cookies Policy
          </h1>
          <div className='flex flex-col gap-4'>
            <div>
              <h2 className='font-bold font-denton text-lg'>Introduction</h2>
              <p>
                At Curate Health, we respect your privacy and are committed to
                protecting your personal data. This policy outlines our
                practices regarding data collection, use, and sharing.
              </p>
            </div>
            <div>
              <h2 className='font-bold font-denton text-lg'>
                Information We Collect
              </h2>
              <p>
                We collect personal data that you provide to us, such as name,
                address, and email. We also collect non-personal data through
                cookies and similar technologies.
              </p>
            </div>
            <div>
              <h2 className='font-bold font-denton text-lg'>
                How We Use Your Data
              </h2>
              <p>
                We use your data to provide and improve our services,
                communicate with you, and comply with legal obligations.
              </p>
            </div>
            <div>
              <h2 className='font-bold font-denton text-lg'>Cookies</h2>
              <p>
                We use cookies to enhance your browsing experience, analyze site
                traffic, and for marketing purposes. You can control cookies
                through your browser settings.
              </p>
            </div>
            <div>
              <h2 className='font-bold font-denton text-lg'>Data Sharing</h2>
              <p>
                We do not sell your data. We may share your data with service
                providers who assist us in our business operations and with
                authorities as required by law.
              </p>
            </div>
            <div>
              <h2 className='font-bold font-denton text-lg'>Your Rights</h2>
              <p>
                You have rights over your personal data, including access,
                correction, and deletion. Contact us to exercise these rights.
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

            <div>
              <h2 className='font-bold font-denton text-lg'>Contact Us</h2>
              <p>
                If you have any questions about this policy, please contact us
                at{' '}
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
  const footer = await client.fetch(FOOTER_QUERY);

  return {
    props: {
      footer,
      draftMode: preview,
      token: preview ? token : '',
    },
  };
};
