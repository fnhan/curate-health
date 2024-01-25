import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import highlightCircleText from 'public/images/CircleText.png';
import highlightImage from 'public/images/HighlightImage.png';
import HoverLink from './HoverLink';

export default function Highlight() {
  const { scrollYProgress } = useScroll();
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 540]);

  return (
    <section className='w-full bg-primary'>
      <div className='container py-12 md:py-40 flex flex-col gap-20 text-left'>
        <div className='max-w-prose md:sticky md:top-28 z-20 md:pt-2'>
          <h3 className='max-w-[250px] md:text-2xl md:max-w-[350px] 2xl:max-w-[555px] font-light 2xl:text-[40px] 2xl:leading-10'>
            Discover a unique approach to health and wellness, tailored to meet
            your individual needs
          </h3>
        </div>
        <div className='flex justify-center'>
          <div className='relative inline-block'>
            <Image
              width={536}
              height={536}
              alt=''
              src={highlightImage}
              className='w-[250px] md:w-[375px] 2xl:w-[536px]'
            />
            <motion.div
              className='absolute -top-5 -right-10 md:-right-20 2xl:-right-32'
              style={{ rotate }}>
              <Image
                src={highlightCircleText}
                width={287}
                height={287}
                alt=''
                className='w-[107px] md:w-[165px] 2xl:w-[287px]'
              />
            </motion.div>
          </div>
        </div>
        <div className='flex justify-end'>
          <h3 className='max-w-[250px] md:text-2xl md:max-w-[350px] 2xl:max-w-[555px] font-light 2xl:text-[40px] 2xl:leading-10'>
            Explore our comprehensive services and embark on a journey to a
            healthier you.
          </h3>
        </div>
      </div>
      <HoverLink href='/about' text='More About Us' />
    </section>
  );
}
