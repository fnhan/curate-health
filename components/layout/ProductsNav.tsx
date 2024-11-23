import { Loading } from 'components/Loading';
import Link from 'next/link';
import styles from 'styles/CarouselNav.module.css';

export function ProductsNav({ products, currentPageTitle }) {
  return (
    <div className='bg-secondary bg-opacity-50 backdrop-blur-3xl sticky top-[100px] z-50'>
      <div
        className={`container -ml-6 2xl:ml-4 whitespace-nowrap overflow-x-auto ${styles.customScrollbar}`}
      >
        <div className='flex'>
          <div className=' -mr-8'>
            <div className='p-1 group'>
              <div>
                <div className='flex bg-transparent border-none'>
                  <div
                    className={`p-6 text-black font-light font-Poppins text-[12px] 2xl:text-[14px]  ${
                      currentPageTitle === 'Our Services'
                        ? 'underline text-black'
                        : ''
                    }`}
                  >
                    Our Products
                    <div
                      className={`${
                        currentPageTitle !== 'Our Services'
                          ? '-mt-1 bg-black h-[1.35px] w-0'
                          : ''
                      }`}
                    ></div>
                  </div>
                  <div className='text-black font-light -ml-6 p-6 mx-3 lg:inline'>
                    |
                  </div>
                </div>
              </div>
            </div>
          </div>
          {products.map((product, index) => (
            <div key={index}>
              <div className='p-1 group'>
                <Link href={`/products/${product.slug}`}>
                  <div
                    className={`bg-transparent border-none ${
                      currentPageTitle === product.title
                        ? 'underline text-black'
                        : ''
                    }`}
                  >
                    <div className='-ml-4 -mr-4 items-center font-light font-Poppins justify-center p-6 text-black text-[12px] 2xl:text-[14px] '>
                      {product.title}
                      <div
                        className={`${
                          currentPageTitle !== product.title
                            ? '-mt-1 bg-black h-[1.35px] w-0 group-hover:w-full transition-all duration-500'
                            : ''
                        }`}
                      ></div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
