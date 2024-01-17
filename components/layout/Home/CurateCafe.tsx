import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import CurateCafeBg from 'public/images/curate-cafe2.png';
import HoverLink from './HoverLink';

export default function CurateCafe() {
  return (
    <>
      <section className='relative bg-white'>
        <Image
          src={CurateCafeBg}
          width={1440}
          height={970}
          alt='Curate Cafe'
          layout='responsive'
          className='max-h-[1000px] object-cover'
        />
        <div className='container absolute top-0 left-0 right-0 bottom-0 flex flex-col justify-between pt-9 pb-24 md:pt-14 2xl:pt-18'>
          <h2 className='text-black md:text-xl 2xl:text-3xl'>
            Curate Health Bar
          </h2>
          <p className='font-denton text-black md:text-xl max-w-[200px] md:max-w-[300px] 2xl:max-w-[544px] 2xl:text-4xl italic'>
            Discover a unique approach to health and wellness, tailored to meet
            your individual needs.
          </p>
        </div>
        <div className='absolute bottom-0 left-0 right-0 z-10'>
          <HoverLink
            href='/cafe'
            text='Visit the cafe'
            textColor='text-black'
          />
        </div>
      </section>
    </>
  );
}
