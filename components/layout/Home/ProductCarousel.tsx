import imageUrlBuilder from '@sanity/image-url';
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
import { SanityDocument } from 'next-sanity';
import Image from 'next/image';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { dataset, projectId } from '../../../sanity/env';

const builder = imageUrlBuilder({ projectId, dataset });

export function ProductCarousel({ products }: { products: SanityDocument[] }) {
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
        opts={{ align: 'start' }}
        className='container mx-auto relative'>
        <CarouselContent>
          {products.map((product: SanityDocument, idx: number) => (
            <CarouselItem key={idx} className='md:basis-1/2 lg:basis-1/3'>
              <Card className='w-full border-black rounded-none flex flex-col py-8 h-full'>
                <CardContent className='flex justify-center items-center h-64 mb-4'>
                  <Image
                    src={builder
                      .image(product.image)
                      .quality(80)
                      .size(250, 250)
                      .auto('format')
                      .url()}
                    width={250}
                    height={250}
                    alt={product.title}
                    className='mx-auto object-contain'
                  />
                </CardContent>
                <CardHeader className='w-2/3 mx-auto'>
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
