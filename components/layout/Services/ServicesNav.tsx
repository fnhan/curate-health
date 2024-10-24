import { Loading } from 'components/Loading';
import Link from 'next/link';
import styles from '../../../styles/CarouselNav.module.css';

export function ServicesNav({ services, currentPageTitle }) {
  return (
    <div className='bg-secondary bg-opacity-50 backdrop-blur-3xl sticky top-[100px] z-50'>
      <div
        className={`container -ml-6 2xl:ml-4 whitespace-nowrap overflow-x-auto ${styles.customScrollbar}`}>
        <div className='flex'>
          <div className=' -mr-8'>
            <div className='p-1 group'>
              <Link href='/services'>
                <div className='flex bg-transparent border-none'>
                  <div
                    className={`p-6 text-black font-light font-Poppins text-[12px] 2xl:text-[14px]  ${currentPageTitle === 'Our Services' ? 'underline text-black' : ''}`}>
                    Our Services
                    <div
                      className={`${currentPageTitle !== 'Our Services' ? '-mt-1 bg-black h-[0.5px] md:h-[1.35px] w-0 group-hover:w-full transition-all duration-500' : ''}`}></div>
                  </div>
                  <div className='text-black font-light -ml-6 p-6 mx-3 2xl:inline'>
                    |
                  </div>
                </div>
              </Link>
            </div>
          </div>
          {services.map((service, index) => (
            <div key={index}>
              <div className='p-1 group'>
                <Link href={`/services/${service.slug}`}>
                  <div
                    className={`bg-transparent border-none ${currentPageTitle === service.title ? 'underline text-black' : ''}`}>
                    <div className='-ml-4 -mr-4 items-center font-light font-Poppins justify-center p-6 text-black text-[12px] 2xl:text-[14px] '>
                      {service.title}
                      <div
                        className={`${currentPageTitle !== service.title ? '-mt-1 bg-black h-[0.5px] md:h-[1.35px] w-0 group-hover:w-full transition-all duration-500' : ''}`}></div>
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
