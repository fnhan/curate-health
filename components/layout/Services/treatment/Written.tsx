import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import imageUrlBuilder from '@sanity/image-url';
import { dataset, projectId } from '../../../../sanity/env';

export default function Written({treatment}) {
  const builder = imageUrlBuilder({ projectId, dataset });
  return (
    <div className='relative'>
      <Image
        loading='lazy'
        width={1080}
        height={1440}
        src={builder
          .image(treatment.writtenImage)
          .width(1440)
          .height(760)
          .quality(80)
          .url()}
        alt='written content'
        className='object-cover w-full h-[660px] md:h-[827px] 2xl:h-[1040px]'
      />
      <div className="absolute w-11/12 h-4/6 md:w-9/12 2xl:w-8/12 2xl:h-2/4 top-1/2 2xl:left-1/2 flex flex-col justify-center 2xl:-translate-x-1/2 -translate-y-1/2 bg-secondary px-4 2xl:text-center 2xl:px-16 2xl:leading-11 text-white">
        <div className="container  text-[16px] md:text-[32px] 2xl:text-[40px]">
          <PortableText value={treatment.writtenTitle} />
        </div>
        <div className="container text-[11px] md:text-[16px] mt-4 leading-6 md:leading-7">
          <PortableText value={treatment.writtenContent} />
        </div>
        <div className="container italic text-[10px] md:text-[16px] 2xl:text-[24px] mt-4 md:mt-16">
          <PortableText value={treatment.writtenBracketContent} />

        </div>
      </div>
    </div>
  );
}