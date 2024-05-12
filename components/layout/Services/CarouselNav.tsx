// import { Card, CardContent } from 'components/ui/card';
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from 'components/ui/carousel';
import Link from 'next/link';

export function CarouselNav({ services, currentPageTitle }) {
  return (
    <div className='relative ml-10'>
      <div className='flex'>
        {/* Render "Our Service" as the first item */}
        <div className='pr-3 pl-10'>
          <div className='p-1 group'>
            <Link href='/services/our-services'>
              <div className='bg-transparent border-none'>
                <div className={`items-center justify-center p-6 text-black text-[12px] 2xl:text-[14px] ${currentPageTitle === "Our Services" ? 'underline text-black' : ''}`}>
                  Our Services&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|
                </div>
              </div>
            </Link>
          </div>
        </div>
        
        {/* Render other services */}
        {services.map((service, index) => (
          <div key={index}>
            <div className='p-1 group'>
              <Link href={`/services/${service.slug}`}>
                <div className={`bg-transparent border-none ${currentPageTitle === service.title ? 'underline text-black' : ''}`}>
                  <div className='items-center justify-center p-6 text-black text-[12px] 2xl:text-[14px]'>
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
