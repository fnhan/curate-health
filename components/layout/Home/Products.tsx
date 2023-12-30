import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from 'components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import ProductExample from 'public/images/product-example.png';
import { useState } from 'react';

export default function Products() {
  const [currentIndex, setCurrentIndex] = useState(0);

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
  ];

  const totalProducts = products.length;
  const currentProduct = products[currentIndex];

  const nextProduct = () => {
    setCurrentIndex((current) => (current + 1) % totalProducts);
  };

  const prevProduct = () => {
    setCurrentIndex((current) => (current - 1 + totalProducts) % totalProducts);
  };

  return (
    <section className='bg-white'>
      <div className='container pt-9'>
        <h2 className='mb-8 text-black md:text-xl'>Products</h2>
      </div>
      <div className='relative w-[285px] h-[450px] mx-auto'>
        {' '}
        <AnimatePresence>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }} // Enter from right
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }} // Exit to left
            transition={{ duration: 0.5 }}
            className='absolute inset-0'>
            <Card className='bg-secondary text-white rounded-none flex flex-col justify-between py-10'>
              <CardContent className='flex-1 flex justify-center items-center pb-0'>
                <Image
                  className='w-[210px] mx-auto'
                  src={currentProduct.image}
                  width={236}
                  height={314}
                  alt={currentProduct.title}
                />
              </CardContent>
              <CardHeader className='pb-0'>
                <CardTitle className='text-center font-denton mb-3'>
                  {currentProduct.title}
                </CardTitle>
                <CardDescription className='text-center text-white text-xs'>
                  {currentProduct.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </AnimatePresence>
        <div className='absolute top-1/2 -translate-y-1/2 left-0'>
          <button onClick={prevProduct}>
            <ChevronLeft className='w-5 text-white' />
          </button>
        </div>
        <div className='absolute top-1/2 -translate-y-1/2 right-0'>
          <button onClick={nextProduct}>
            <ChevronRight className='w-5 text-white' />
          </button>
        </div>
      </div>

      <Link className='w-full' href={'/about'}>
        <div className='container border-t duration-300 transition-all hover:bg-secondary text-black hover:text-white py-5 text-right block font-denton'>
          <div className='flex items-center gap-2 hover:gap-4 transition-all duration-300 justify-end'>
            <span className=''>More Products</span>
            <ChevronRight className='w-5' />
          </div>
        </div>
      </Link>
    </section>
  );
}
