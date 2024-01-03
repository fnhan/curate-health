import Footer from './Footer';
import Meta from './Meta';
import Nav from './Nav';

const Layout = ({ title, children }) => {
  return (
    <>
      <Meta title={title} />
      <div className='flex flex-col min-h-screen'>
        <Nav />
        <main className='flex-1'>{children}</main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
