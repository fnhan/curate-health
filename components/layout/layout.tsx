import Footer from './Footer';
import Meta from './Meta';
import Nav from './Nav';

export default function Layout({ title, children }) {
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
}
