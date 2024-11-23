'use client';

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
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { PRODUCTS_QUERYResult } from 'sanity.types';
import { dataset, projectId } from '../../../sanity/env';

const builder = imageUrlBuilder({ projectId, dataset });

export function ProductCarousel({
  products,
}: {
  products: PRODUCTS_QUERYResult;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const inverse = 100 - (current / count) * 100 + '%';

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
        className='container mx-auto relative p-3'>
        <CarouselContent>
          {products.map((product, idx: number) => (
            <CarouselItem key={idx} className='md:basis-1/2 lg:basis-1/3'>
              <Link href={`/products/${product.slug}`}>
                <Card className='transition ease-in-out hover:hover:-translate-y-3 w-full rounded-none flex flex-col h-full border-none shadow-none'>
                  <CardContent className='flex justify-center items-center 2xl:h-64 mb-4 p-0'>
                    <Link href={`/products/${product.slug}`}>
                      <Image
                        src={builder
                          .image(product.image!)
                          .quality(80)
                          .size(200, 200)
                          .auto('format')
                          .url()}
                        width={200}
                        height={200}
                        alt={product.altText ?? ''}
                        className=' mx-auto object-contain '
                      />
                    </Link>
                  </CardContent>
                  <CardHeader className='w-2/3 mx-auto p-0'>
                    <CardTitle className='text-center mb-3 font-light p-0 text-base md:text-2xl'>
                      <Link href={`/products/${product.slug}`}>
                        {product.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className='text-center text-sm pb-4 text-pretty'>
                      <Link href={`/products/${product.slug}`}>
                        {product.description}
                      </Link>
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className='-left-8 ml-2 bg-transparent border-none text-black hover:bg-secondary' />
        <CarouselNext className='-right-8 mr-2 bg-transparent border-none text-black hover:bg-secondary' />
      </Carousel>

      <div className='w-full relative bg-muted rounded-full h-1'>
        <div>
          <div
            className={`absolute bg-secondary h-1 
            }`}
            style={{
              width: 100 / count + '%',
              right: inverse,
              transition: 'all 0.5s ease-out',
            }}></div>
        </div>
      </div>
    </>
  );
}
