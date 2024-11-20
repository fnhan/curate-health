import HeroSection from 'components/layout/home-page/hero-section';
import Layout from 'components/shared/layout';
import { HOME_PAGE_QUERYResult } from '../sanity.types';
import { HOME_PAGE_QUERY } from '../sanity/lib/queries';
import { sanityFetch } from '../sanity/lib/server-client';

export default async function Home() {
  const homePage = await sanityFetch<HOME_PAGE_QUERYResult>({
    query: HOME_PAGE_QUERY,
  });

  const { layout, heroSection, primaryCTAButton } = homePage;

  console.log('primaryCTAButton', primaryCTAButton);

  return (
    <Layout layout={layout}>
      <HeroSection
        heroSection={heroSection}
        primaryCTAButton={primaryCTAButton}
      />
    </Layout>
  );
}
