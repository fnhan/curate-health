import Footer from './Footer';
import Meta from './Meta';
import Nav from './Nav';

export default function Layout({ title, children }) {
  return (
    <>
      <Meta title={title} />
      <Nav />
      <main className='flex-1 text-white antialiased'>{children}</main>
      <Footer />
    </>
  );
}
