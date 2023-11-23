import Meta from '../meta';
import Footer from './Footer';
import Nav from './Nav';

export default function Layout({ children }) {
  return (
    <>
      <Meta />
      <div className='flex flex-col min-h-screen'>
        <div className='flex-1 bg-primary text-white'>
          <Nav />
          <main className='container'>{children}</main>
        </div>
        <Footer />
      </div>
    </>
  );
}
