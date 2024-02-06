import * as React from 'react';
import { useEffect, useState } from 'react';
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
} from 'components/ui/carousel';

import Image from 'next/image';
import ProductExample from 'public/images/product-example.png';
import Autoplay from 'embla-carousel-autoplay';

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

const calculateDotsNumber = (windowWidth) => {
  if (windowWidth >= 1400) {
    return Math.ceil(products.length / 3);
  } else if (windowWidth >= 768) {
    return Math.ceil(products.length / 2);
  } else {
    return products.length;
  }
};

const Dots = ({ imgIndex, setImgIndex }) => {
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Automatically set the image index to the first dot when the screen size changes
      setImgIndex(0);
    };

    // Initial window width
    setWindowWidth(window.innerWidth);

    // Event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [setImgIndex]); // Include setImgIndex in the dependency array

  // Determine the number of dots based on screen size
  let dotsNumber;

  if (windowWidth >= 1400) {
    dotsNumber = Math.ceil(products.length / 3);
  } else if (windowWidth >= 768) {
    dotsNumber = Math.ceil(products.length / 2);
  } else {
    dotsNumber = products.length;
  }

  return (
    <div className='mt-8 flex w-full justify-center gap-2'>
      {/* <Arrow
        direction={true}
        imgIndex={imgIndex}
        setImgIndex={setImgIndex}
        dotsNumber={dotsNumber}
        display={imgIndex === 0}
      ></Arrow> */}

      {Array.from({ length: dotsNumber }).map((_, idx) => {
        return (
          <button
            key={idx}
            onClick={() => setImgIndex((imgIndex + 1) % dotsNumber)}
            className={`h-3 w-3 rounded-full transition-colors ${
              idx === imgIndex % dotsNumber ? 'bg-primary' : 'bg-secondary'
            }`}
          />
        );
      })}

      {/* <Arrow
        direction={false}
        imgIndex={imgIndex}
        setImgIndex={setImgIndex}
        dotsNumber={dotsNumber}
        display={imgIndex === dotsNumber - 1}
      ></Arrow> */}
    </div>
  );
};

export function ProductCarousel() {
  const [imgIndex, setImgIndex] = useState(0);
  const [dotsNumber, setDotsNumber] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const newDotsNumber = calculateDotsNumber(window.innerWidth);
      setDotsNumber(newDotsNumber);
      setImgIndex(0); // Automatically set the image index to the first dot on resize
    };

    // Initial setup
    setDotsNumber(calculateDotsNumber(window.innerWidth));

    // Event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );

  return (
    <>
      <Carousel
        plugins={[plugin.current]}
        opts={{
          align: 'center',
        }}
        className='w-11/12 relative container'
      >
        <CarouselContent>
          {/* Array.from({ length: 5 }).map((_, index) */}
          {products.map((product, idx) => (
            <CarouselItem key={idx} className='md:basis-1/2 lg:basis-1/3'>
              {/* <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-3xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div> */}
              <Card className='w-full border-black rounded-none flex flex-col h-[350px] py-5'>
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
        <CarouselPrevious className='left-0 ml-4' />
        <CarouselNext className='right-0 mr-4' />
      </Carousel>
      {/* <Dots imgIndex={imgIndex} setImgIndex={setImgIndex} />; */}
      {/* <div className='flex justify-center mt-4'>
        {products.map((_, index) => (
          <span
            key={index}
            onClick={() => setImgIndex(index)}
            className={`w-4 h-4 mx-2 cursor-pointer rounded-full ${
              index === imgIndex % dotsNumber ? 'bg-primary' : 'bg-secondary'
            }`}
          ></span>
        ))}
      </div> */}
    </>
  );
}
