import { PortableText } from '@portabletext/react';
import imageUrlBuilder from '@sanity/image-url';
import Image from 'next/image';
import { dataset, projectId } from '../../../sanity/env';

const builder = imageUrlBuilder({ projectId, dataset });

export default function Clinic({ clinicSection }) {
  const { clinicImage, content } = clinicSection;

  return (
    <section className='relative'>
      <Image
        width={1080}
        height={1440}
        src={builder
          .image(clinicImage)
          .width(1080)
          .height(1440)
          .quality(80)
          .url()}
        alt='clinic'
        className='w-full object-cover max-h-[435px] md:max-h-[649px]'
      />
      <div className='relative container'>
        <div className='absolute bottom-0 right-0 text-xs w-[237px] bg-white text-black flex flex-col gap-10 p-8 md:p-20 my-10 md:my-0 md:w-[496px] md:text-base'>
          <PortableText value={content} />
        </div>
      </div>
    </section>
  );
}
