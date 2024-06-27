import Link from 'next/link';
import styles from '../../../../styles/CarouselNav.module.css'

export function CarouselNav() {
  return (
    <div className={`container whitespace-nowrap overflow-x-auto ${styles.customScrollbar}`}>
      <div className='flex'>
        <div className=' -mr-8'>
          <div className='p-1 group'>
            <Link href='/services/our-services'>
              <div className='flex bg-transparent border-none'>
                <div className={`p-6 text-black font-light font-Poppins text-[12px] 2xl:text-[14px] group-hover:underline `}>
                  Our Services
                </div>
                <div className='text-black font-light -ml-6 p-6 mx-3 lg:inline'>|</div>
              </div>
            </Link>
          </div>
        </div>
        


      </div>
    </div>
  );
}
