import { Loading } from 'components/Loading';
import Blog from 'components/layout/Home/Blog';
import Clinic from 'components/layout/Home/Clinic';
import CurateCafe from 'components/layout/Home/CurateCafe';
import Hero from 'components/layout/Home/Hero';
import Highlight from 'components/layout/Home/Highlight';
import Newsletter from 'components/layout/Home/Newsletter';
import Products from 'components/layout/Home/Products';
import Services from 'components/layout/Home/Services';
import Sustainability from 'components/layout/Home/Sustainability';
import SurveyLink from 'components/layout/Survey/SurveyLink';
import Layout from 'components/layout/layout';
import { useLiveQuery } from 'next-sanity/preview';
import { HOME_PAGE_QUERYResult } from 'sanity.types';
import { HOME_PAGE_QUERY } from '../../../sanity/lib/queries';

export default function HomePagePreview() {
  const [data, isLoading] = useLiveQuery<HOME_PAGE_QUERYResult>(
    {} as HOME_PAGE_QUERYResult,
    HOME_PAGE_QUERY
  );

  if (isLoading) {
    return (
      <div className='flex flex-col min-h-screen justify-center items-center'>
        <Loading />;
      </div>
    );
  }

  if (!data) {
    return <div>Data could not be fetched.</div>;
  }

  return (
    <Layout
      title='Home'
      navigation={data.navigation}
      footer={data.footer}
      description={data.heroSection?.heroText}>
      <Hero heroSection={data.heroSection} />
      <Highlight highlightSection={data.highlightSection} />
      <Clinic clinicSection={data.clinicSection} />
      <Services services={data.services} />
      <Products
        productsSection={data.productsSection}
        products={data.products}
      />
      <CurateCafe cafeSection={data.cafeSection} />
      {/* TODO: Add blog posts section */}
      {/* <Blog posts={data.posts} /> */}
      <Sustainability sustainabilitySection={data.sustainabilitySection} />
      <SurveyLink surveyLink={data.surveyLink} />
      <Newsletter />
    </Layout>
  );
}
