import Footer from './Footer';
import Meta from './Meta';
import Nav from './Nav';

export default function Layout({ title, children, navigation, footer }) {
  return (
    <>
      <Meta title={title} />
      <Nav navigation={navigation} />
      <main className='flex-1 text-white antialiased'>{children}</main>
      <Footer footer={footer} />
    </>
  );
}
