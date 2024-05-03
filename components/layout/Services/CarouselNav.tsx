import { Card, CardContent } from 'components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from 'components/ui/carousel';
import Link from 'next/link';

export function CarouselNav({ services }) {
  return (
    <Carousel className='container relative'>
      <CarouselContent className='-ml-1'>
        {/* Render "Our Service" as the first item */}
        <CarouselItem className='pl-1 md:basis-1/2 lg:basis-1/3 border-r last:border-r-0'>
          <div className='p-1 group'>
            <Link href='/services/our-services'>
              <Card className='bg-transparent border-none'>
                <CardContent className='flex items-center justify-center p-6 text-white group-hover:underline'>
                  Our Services
                </CardContent>
              </Card>
            </Link>
          </div>
        </CarouselItem>
        
        {/* Render other services */}
        {services.map((service, index) => (
          <CarouselItem
            key={index}
            className='pl-1 md:basis-1/2 lg:basis-1/3 border-r last:border-r-0'>
            <div className='p-1 group'>
              <Link href={`/services/${service.slug}`}>
                <Card className='bg-transparent border-none'>
                  <CardContent className='flex items-center justify-center p-6 text-white group-hover:underline'>
                    {service.title}
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious className='left-0 ml-4' />
      <CarouselNext className='right-0 mr-4' />
    </Carousel>
  );
}