import HoverLink from './HoverLink';
import { ProductCarousel } from './ProductCarousel';

export default function Products() {
  return (
    <section className='bg-white flex flex-col gap-10'>
      <div className='container pt-9'>
        <h2 className=' text-black md:text-xl'>Products</h2>
      </div>
      <div className='container'>
        <ProductCarousel />
      </div>
      <HoverLink
        href='/products'
        text='View All Products'
        textColor='text-black'
      />
    </section>
  );
}
