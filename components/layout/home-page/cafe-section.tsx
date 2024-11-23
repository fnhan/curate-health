import { PortableText } from '@portabletext/react';
import imageUrlBuilder from '@sanity/image-url';
import HoverLink from 'components/shared/hover-link';
import Image from 'next/image';
import { CAFE_QUERYResult } from 'sanity.types';
import { dataset, projectId } from '../../../sanity/env';

const builder = imageUrlBuilder({ projectId, dataset });

export default function CafeSection({
  cafeSection,
}: {
  cafeSection: CAFE_QUERYResult;
}) {
  if (!cafeSection) return null;

  const { cafeImage, title, content, hoverLinkText, hoverLinkHref } =
    cafeSection;

  return (
    <>
      <section className='relative bg-white'>
        <Image
          width={1440}
          height={970}
          src={builder
            .image(cafeImage!)
            .width(1080)
            .height(970)
            .quality(100)
            .url()}
          alt='Curate Cafe'
          className='max-h-[1000px] object-cover w-full'
        />
        <div className='container absolute top-0 left-0 right-0 bottom-0 flex flex-col justify-between pt-9 pb-24 md:pt-14 2xl:pt-18'>
          <h2 className='text-black md:text-xl 2xl:text-3xl'>
            <PortableText value={title!} />
          </h2>
          <div className='text-black md:text-xl max-w-[200px] md:max-w-[300px] 2xl:max-w-[544px] 2xl:text-4xl italic'>
            <PortableText value={content!} />
          </div>
        </div>
        <div className='absolute bottom-0 left-0 right-0 z-10'>
          <HoverLink
            href={hoverLinkHref!}
            text={hoverLinkText!}
            textColor='text-black'
          />
        </div>
      </section>
    </>
  );
}
