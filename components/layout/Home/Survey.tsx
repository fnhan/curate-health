import imageUrlBuilder from '@sanity/image-url';
import { Loading } from 'components/Loading';
import { ChevronRightIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { dataset, projectId } from '../../../sanity/env';

const builder = imageUrlBuilder({ projectId, dataset });

export default function Survey({ surveySection }) {
  const { bgImage, href, title, content, cta } = surveySection;

  return (
    <section className='relative bg-platinum h-[435px] md:h-[649px]'>
      <Image
        src={builder
          .image(bgImage)
          .quality(80)
          .size(1440, 1080)
          .auto('format')
          .url()}
        width={1440}
        height={1080}
        alt={bgImage.alt}
        className='w-full h-full object-cover'
      />

      <div className='absolute inset-0 flex items-center justify-center p-4'>
        <Link
          href={href}
          className='bg-white hover:bg-white/50 transition-all duration-300 text-black text-center rounded-full p-5 flex items-center justify-center flex-col gap-3 h-72 w-72'>
          <h4 className='text-lg md:text-xl font-semibold capitalize'>
            {title}
          </h4>
          <p className='text-sm md:text-base'>{content}</p>
          <div className='flex items-center gap-1'>
            <p className='font-denton underline'>{cta}</p>
            <ChevronRightIcon size={18} />
          </div>
        </Link>
      </div>
    </section>
  );
}
