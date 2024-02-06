import { Loading } from 'components/Loading';
import Blog from 'components/layout/Home/Blog';
import Clinic from 'components/layout/Home/Clinic';
import CurateCafe from 'components/layout/Home/CurateCafe';
import Hero from 'components/layout/Home/Hero';
import Highlight from 'components/layout/Home/Highlight';
import Newsletter from 'components/layout/Home/Newsletter';
import Products from 'components/layout/Home/Products';
import Services from 'components/layout/Home/Services';
import Survey from 'components/layout/Home/Survey';
import Sustainability from 'components/layout/Home/Sustainability';
import Layout from 'components/layout/layout';
import { SanityDocument } from 'next-sanity';
import { useLiveQuery } from 'next-sanity/preview';
import { homePageQuery } from '../../../sanity/lib/queries';

type HomePageData = {
  heroSection: {
    bgImage: {
      asset: {
        _id: string;
        url: string;
      };
    };
    heroText: any;
  };
  highlightSection: {
    title1: string;
    title2: string;
    highlightImage: {
      asset: {
        _id: string;
        url: string;
      };
      alt: string;
    };
  };
  posts: SanityDocument[];
};

export default function HomePagePreview() {
  const [data, isLoading] = useLiveQuery<HomePageData>(null, homePageQuery);

  if (isLoading) {
    return <Loading />;
  }

  if (!data) {
    return <div>Data could not be fetched.</div>;
  }

  return (
    <Layout title='Home'>
      <Hero heroSection={data.heroSection} />
      <Highlight highlightSection={data.highlightSection} />
      <Clinic />
      <Services />
      <Products />
      <CurateCafe />
      <Blog posts={data.posts} />
      <Sustainability />
      <Survey />
      <Newsletter />
    </Layout>
  );
}
