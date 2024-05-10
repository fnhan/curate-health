import imageUrlBuilder from '@sanity/image-url';
import Image from 'next/image';
import Link from 'next/link';
import { dataset, projectId } from '../../../sanity/env';

const builder = imageUrlBuilder({ projectId, dataset });

export default function ServicesList({ services }) {
  return (
    <div className='justify-left'>
      {services.map((service) => (
        <div key={service.title} className="relative"> {/* Added relative positioning */}
          <Link
            className='flex flex-col gap-7 group'
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
                className='object-cover w-full h-[78px] md:h-[108px] 2xl:h-[135px] grayscale transition duration-300 group-hover:grayscale-0'
              />
              <h3 className='absolute bottom-4 md:bottom-9 left-20 transform  -translate-y-1/2 text-center text-lg md:text-[29px] border-b border-transparent md:text-base group-hover:underline duration-300 '>
                {service.title}
              </h3>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
