import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from 'components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import ProductExample from 'public/images/product-example.png';
import * as React from 'react';
import { useEffect, useState } from 'react';

const products = [
  {
    title: 'Custom Foot Orthotics',
    description: 'Treat or prevent abnormal motion, or rolling of the foot',
    image: ProductExample,
  },
  {
    title: 'Compression Stockings',
    description: 'Improve blood flow in the veins of your legs',
    image: ProductExample,
  },
  {
    title: 'Tens Machines',
    description:
      'Reduce the pain signals going to the spinal cord and brain, which amy help relieve pain and relax muscles',
    image: ProductExample,
  },
  {
    title: 'Custom Foot Orthotics',
    description: 'Treat or prevent abnormal motion, or rolling of the foot',
    image: ProductExample,
  },
  {
    title: 'Compression Stockings',
    description: 'Improve blood flow in the veins of your legs',
    image: ProductExample,
  },
  {
    title: 'Tens Machines',
    description:
      'Reduce the pain signals going to the spinal cord and brain, which amy help relieve pain and relax muscles',
    image: ProductExample,
  },
];

export function ProductCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (api) {
        setCount(api.scrollSnapList().length);
      }
    };

    if (api) {
      setCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap() + 1);

      api.on('select', () => {
        setCurrent(api.selectedScrollSnap() + 1);
      });

      window.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [api]);

  return (
    <>
      <Carousel
        setApi={setApi}
        plugins={[
          Autoplay({
            delay: 3000,
          }),
        ]}
        opts={{
          align: 'start',
        }}
        className='container mx-auto relative'>
        <CarouselContent>
          {products.map((product, idx) => (
            <CarouselItem key={idx} className='md:basis-1/2 lg:basis-1/3'>
              <Card className='w-full border-black rounded-none flex flex-col h-[368px] py-5'>
                <CardContent className='flex justify-center items-center pb-0'>
                  <Image
                    className='mx-auto pt-6'
                    src={product.image}
                    width={236}
                    height={314}
                    alt={product.title}
                  />
                </CardContent>
                <CardHeader className='flex-1 pb-0 w-2/3 mx-auto'>
                  <CardTitle className='text-center font-denton mb-3 font-light'>
                    {product.title}
                  </CardTitle>
                  <CardDescription className='text-center text-xs'>
                    {product.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className='-left-8 ml-4' />
        <CarouselNext className='-right-8 mr-4' />
      </Carousel>
      <div className='mt-8 text-center text-sm text-muted-foreground'>
        {current} / {count}
      </div>
    </>
  );
}
