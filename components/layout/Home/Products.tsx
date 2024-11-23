import { Loading } from 'components/Loading';
import HoverLink from './HoverLink';
import { ProductCarousel } from './ProductCarousel';

export default function Products({ productsSection, products }) {
  const { sectionTitle, hoverLinkText, hoverLinkHref } = productsSection;

  if (!productsSection) {
    return (
      <div className='py-10 border-y'>
        <Loading />
      </div>
    );
  }

  return (
    <section id='products' className='bg-white flex flex-col gap-10'>
      <div className='container pt-9'>
        <h2 className=' text-[#283619] font-light text-muted-foreground  font-poppins md:text-4xl'>
          {sectionTitle}
        </h2>
      </div>
      <div className='container'>
        <ProductCarousel products={products} />
      </div>
      <HoverLink
        href={hoverLinkHref}
        text={hoverLinkText}
        textColor='text-black'
      />
    </section>
  );
}
