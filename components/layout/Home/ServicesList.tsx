import { useState } from 'react';
import imageUrlBuilder from '@sanity/image-url';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { dataset, projectId } from '../../../sanity/env';

const builder = imageUrlBuilder({ projectId, dataset });

export default function ServicesList({ services }) {
  const [hoveredService, setHoveredService] = useState(null);

  return (
    <div className='flex flex-col h-[400px] md:h-[680px] 2xl:h-[720px] justify-start gap-10 md:gap-20 pt-8 md:py-20 pb-12 '>
      <div className="md:flex">
        {/* Left Side: Text */}
        <div className="md:w-1/2 container flex flex-col">
        <h2 className='2xl:container mt-8 mb-8 md:mt-16 md:mb-24 text-3xl md:text-5xl'>Our Services</h2>
          {services.map((service) => (
            <div
              key={service.title}
              className="cursor-pointer py-3"
              onMouseEnter={() => setHoveredService(service)}
              onMouseLeave={() => setHoveredService(null)}
            >
            <Link href={`/services/${service.slug}`}>
              <div className="group">
                <div className="2xl:container font-light text-[14px] md:text-[20px] 2xl:text-[30px] flex items-center space-x-2">
                  <span className="group-hover:underline">{service.title}</span>
                  <ArrowRight className="group-hover:underline" />
                </div>
              </div>
            </Link>
            </div>
          ))}
        </div>

        {/* Right Side: Image */}
        <div className="md:w-1/2 md:mt-16 flex justify-end items-center">
          {hoveredService && (
            <Image
              loading="lazy"
              width={1440}
              height={2560}
              src={builder
                .image(hoveredService.image)
                .width(1080)
                .height(1440)
                .quality(80)
                .url()}
              alt={hoveredService.title}
              className="object-cover transition duration-300 h-[0px] w-[0px] md:h-[420px] 2xl:h-[470px] md:w-full"
            />
          )}
        </div>
      </div>
    </div>

  );
}
