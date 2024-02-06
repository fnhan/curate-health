import imageUrlBuilder from '@sanity/image-url';
import Image from 'next/image';
import Link from 'next/link';
import { dataset, projectId } from '../../../sanity/env';

const builder = imageUrlBuilder({ projectId, dataset });

export default function ServicesList({ services }) {
  return (
    <div className='md:flex justify-between grid grid-cols-2 gap-y-6 gap-x-2'>
      {services.map((service) => (
        <div key={service.title}>
          <Link
            className='flex flex-col gap-7 group'
            href={`/services/${service.slug}`}>
            <Image
              src={builder
                .image(service.image)
                .width(175)
                .height(175)
                .quality(80)
                .url()}
              width={175}
              height={175}
              alt=''
              className='rounded-full w-[85px] h-[85px] md:w-[128px] md:h-[128px] 2xl:w-[175px] 2xl:h-[175px] object-cover mx-auto group-hover:-translate-y-3 transition-all duration-300'
            />
            <h6 className='font-denton text-center text-md border-b border-transparent md:text-base group-hover:underline duration-300 transition-all'>
              {service.title}
            </h6>
          </Link>
        </div>
      ))}
    </div>
  );
}
