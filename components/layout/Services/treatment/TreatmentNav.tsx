import Link from 'next/link';
import styles from '../../../../styles/CarouselNav.module.css';

export function TreatmentNav({ treatments, currentPageTitle, serviceTitle, serviceSlug}) {
  return (
    <div className='bg-secondary bg-opacity-50 backdrop-blur-3xl sticky top-[100px] z-50'>
      <div
        className={`container -ml-6 2xl:ml-4 whitespace-nowrap overflow-x-auto ${styles.customScrollbar}`}>
        <div className='flex'>
          <div className=' -mr-8'>
            <div className='p-1 group'>
              <Link href={`/services/${serviceSlug}`}>
                <div className='flex bg-transparent border-none'>
                  <div
                    className={`p-6 text-black font-light font-Poppins text-[12px] 2xl:text-[14px]`}>
                    {serviceTitle}
                    <div className="-mt-1 bg-black h-[0.5px] md:h-[1.35px] w-0 group-hover:w-full transition-all duration-500"></div>
                  </div>
                  <div className='text-black font-light -ml-6 p-6 mx-3 2xl:inline'>
                    |
                  </div>
                </div>
              </Link>
            </div>
          </div>
          {treatments
          .filter(treatment => treatment.service.title === serviceTitle)
          .map((treatment, index) => (
            <div key={index}>
              <div className='p-1 group'>
                <Link href={`/services/${serviceSlug}/${treatment.treatmentSlug}`}>
                  <div
                    className={`bg-transparent border-none ${currentPageTitle === treatment.title ? 'underline text-black' : ''}`}>
                    <div className='-ml-4 -mr-4 items-center font-light font-Poppins justify-center p-6 text-black text-[12px] 2xl:text-[14px]'>
                      {treatment.title}
                      <div className={`${currentPageTitle !== treatment.title ? '-mt-1 bg-black h-[0.5px] md:h-[1.35px] w-0 group-hover:w-full transition-all duration-500' : ''}`}></div>
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
