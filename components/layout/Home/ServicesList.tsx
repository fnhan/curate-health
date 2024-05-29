import imageUrlBuilder from '@sanity/image-url';
import { Button } from 'components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { dataset, projectId } from '../../../sanity/env';

const builder = imageUrlBuilder({ projectId, dataset });

export default function ServicesList({ services }) {
  return (
    <div>
      {services.map((service) => (
        <div key={service.title} className='relative '>
          <Link
            className='flex flex-col group'
            href={`/services/${service.slug}`}>
            <div className='relative flex w-85'>
              <Image
                loading='lazy'
                width={1440}
                height={2560}
                src={builder
                  .image(service.image)
                  .width(1080)
                  .height(1440)
                  .quality(80)
                  .url()}
                alt={service.title}
                className='object-cover w-full h-[78px] md:h-[108px] 2xl:h-[135px] grayscale transition duration-300 group-hover:grayscale-0 '
              />
              <div className='absolute -bottom-1 md:bottom-3 2xl:bottom-5 px-10 transform -translate-y-1/2 w-full flex items-center'>
                <div className='flex justify-between w-full items-center'>
                  <div className='md:text-3xl group-hover:underline'>{service.title}</div>
                  <Button
                    variant='outline'
                    className='bg-transparent rounded-full hover:bg-transparent hover:scale-105 transition-all duration-300 border-2 md:w-[90px]'>
                    <ArrowRight size={18} />
                  </Button>
                </div>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
