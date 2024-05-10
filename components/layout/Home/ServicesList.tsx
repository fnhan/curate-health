import imageUrlBuilder from '@sanity/image-url';
import Image from 'next/image';
import Link from 'next/link';
import { dataset, projectId } from '../../../sanity/env';

const builder = imageUrlBuilder({ projectId, dataset });

export default function ServicesList({ services }) {
  return (
    <div className='justify-left'>
      {services.map((service) => (
        <div key={service.title} >
          <Link
            className='flex flex-col gap-7 group'
            href={`/services/${service.slug}`}>
            <div className='relative'>
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
                className='object-cover w-full h-[65px] md:h-[108px] 2xl:h-[135px] grayscale transition duration-300 group-hover:grayscale-0'
              />
              <div className='absolute inset-0 bg-gray-900 opacity-0 group-hover:opacity-50 transition-opacity'></div>
            </div>
            <h3 className='text-center text-md border-b border-transparent md:text-base group-hover:underline duration-300 transition-all'>
                {service.title}
              </h3>
          </Link>
        </div>
      ))}
    </div>
  );
}
