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
import { HOME_PAGE_QUERY } from '../../../sanity/lib/queries';

type HomePageData = {
  heroSection: {
    bgImage: {
      asset: {
        _id: string;
        url: string;
      };
    };
    heroText: string;
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
  clinicSection: {
    clinicImage: {
      asset: {
        _id: string;
        url: string;
      };
      alt: string;
    };
    content: string;
  };
  cafeSection: {
    cafeImage: {
      asset: {
        _id: string;
        url: string;
      };
      alt: string;
    };
    title: string;
    content: string;
  };
  services: SanityDocument[];
  productsSection: SanityDocument[];
  products: SanityDocument[];
  posts: SanityDocument[];
  footer: SanityDocument;
};

export default function HomePagePreview() {
  const [data, isLoading] = useLiveQuery<HomePageData>(null, HOME_PAGE_QUERY);

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
    <Layout title='Home' footer={data.footer}>
      <Hero heroSection={data.heroSection} />
      <Highlight highlightSection={data.highlightSection} />
      <Clinic clinicSection={data.clinicSection} />
      <Services services={data.services} />
      <Products
        productsSection={data.productsSection}
        products={data.products}
      />
      <CurateCafe />
      <Blog posts={data.posts} />
      <Sustainability />
      <Survey />
      <Newsletter />
    </Layout>
  );
}
