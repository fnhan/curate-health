import Hero from 'components/layout/Home/Hero';
import Footer from '../Footer';
import Meta from '../Meta';
import Nav from '../Nav';

const HomeLayout = ({ title, children }) => {
  return (
    <>
      <Meta title={title} />
      <div className='flex flex-col min-h-screen bg-hero-image bg-fixed bg-center bg-cover'>
        <Nav />
        <Hero />
      </div>
      <main className='flex-1 text-white'>{children}</main>
      <Footer />
    </>
  );
};

export default HomeLayout;
