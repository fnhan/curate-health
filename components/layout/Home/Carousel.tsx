import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'components/ui/card';
import { motion, useMotionValue } from 'framer-motion';
import Image from 'next/image';
import ProductExample from 'public/images/product-example.png';
import React, { useEffect, useState } from 'react';

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

const ONE_SECOND = 1000;
const AUTO_DELAY = ONE_SECOND * 10;
const DRAG_BUFFER = 50;

const SPRING_OPTIONS = {
  type: 'spring',
  mass: 3,
  stiffness: 400,
  damping: 50,
};

export const SwipeCarousel = () => {
  const [imgIndex, setImgIndex] = useState(0);
  const [dotsNumber, setDotsNumber] = useState(0);

  const dragX = useMotionValue(0);

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

  useEffect(() => {
    const intervalRef = setInterval(() => {
      const x = dragX.get();

      if (x === 0) {
        setImgIndex((pv) => {
          if (pv === dotsNumber - 1) {
            clearInterval(intervalRef);
            return pv;
          }
          return pv + 1;
        });
      }
    }, AUTO_DELAY);

    return () => clearInterval(intervalRef);
  }, [dragX, dotsNumber]);

const onDragEnd = () => {
  const x = dragX.get();

  if (x <= -DRAG_BUFFER && imgIndex < products.length - 1) {
    setImgIndex((pv) => pv + 1);
  } else if (x >= DRAG_BUFFER && imgIndex > 0) {
    setImgIndex((pv) => pv - 1);
  } else if (x <= -DRAG_BUFFER && imgIndex === products.length - 1) {
    // If at the last image, loop back to the first image
    setImgIndex(0);
  }
};

  return (
    <div className='container relative overflow-hidden'>
      <motion.div
        drag='x'
        dragConstraints={{
          left: 0,
          right: 0,
        }}
        style={{
          x: dragX,
        }}
        animate={{
          translateX: `-${imgIndex * 100}%`,
        }}
        transition={SPRING_OPTIONS}
        onDragEnd={onDragEnd}
        className='flex cursor-grab active:cursor-grabbing'>
        <Cards imgIndex={imgIndex} />
      </motion.div>
      <Dots imgIndex={imgIndex} setImgIndex={setImgIndex} />;
    </div>
  );
};

const calculateDotsNumber = (windowWidth) => {
  if (windowWidth >= 1400) {
    return Math.ceil(products.length / 3);
  } else if (windowWidth >= 768) {
    return Math.ceil(products.length / 2);
  } else {
    return products.length;
  }
};

const Cards = ({ imgIndex }) => {
  return (
    <>
      {products.map((product, idx) => {
        return (
          <motion.div
            key={idx}
            // animate={{
            //   scale: imgIndex === idx ? 0.95 : 0.85,
            // }}
            transition={SPRING_OPTIONS}
            className='w-full shrink-0 md:w-1/2 2xl:w-1/3'>
            <Card className='w-full bg-secondary text-white rounded-none flex flex-col h-[350px] py-5'>
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
                <CardTitle className='text-center font-denton mb-3'>
                  {product.title}
                </CardTitle>
                <CardDescription className='text-center text-white text-xs'>
                  {product.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        );
      })}
    </>
  );
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
    </div>
  );
};