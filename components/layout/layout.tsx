import Footer from './Footer';
import Meta from './Meta';
import Nav from './Nav';

export default function Layout({
  title,
  children,
  navigation,
  footer,
  description,
}) {
  return (
    <div className='flex flex-col min-h-screen'>
      <Meta title={title} description={description || 'description'} />
      <Nav navigation={navigation} />
      <main className='flex-1 text-white antialiased flex flex-col'>
        {children}
      </main>
      <Footer footer={footer} />
    </div>
  );
}
