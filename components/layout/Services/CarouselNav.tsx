
import Link from 'next/link';
import styles from '../../../styles/CarouselNav.module.css'

export function CarouselNav({ services, currentPageTitle }) {
  return (
    <div className={`container whitespace-nowrap overflow-x-auto ${styles.customScrollbar}`}>
      <div className='flex'>
        <div className=' -mr-8'>
          <div className='p-1 group'>
            <Link href='/services/our-services'>
              <div className='bg-transparent border-none'>
                <div className={`p-6 text-black font-light font-Poppins text-[12px] 2xl:text-[14px] group-hover:underline ${currentPageTitle === "Our Services" ? 'underline text-black' : ''}`}>
                  Our Services
                  <span className='ml-8 mx-3 lg:inline'>|</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
        

        {services.map((service, index) => (
          <div key={index}>
            <div className='p-1 group'>
              <Link href={`/services/${service.slug}`}>
                <div className={`bg-transparent border-none ${currentPageTitle === service.title ? 'underline text-black' : ''}`}>
                  <div className='items-center font-light font-Poppins justify-center p-6 text-black text-[12px] 2xl:text-[14px] hover:underline'>
                    {service.title}
                  </div>
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
