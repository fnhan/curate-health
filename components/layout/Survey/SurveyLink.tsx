import imageUrlBuilder from '@sanity/image-url';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { dataset, projectId } from '../../../sanity/env';

const builder = imageUrlBuilder({ projectId, dataset });

export default function SurveyLink({ surveyLink }) {
  const { bgImage, cta, href, content, bold } = surveyLink;
  return (
    <section className='relative bg-platinum h-[200px] md:h-[350px] lg:h-[594px]'>
      <Image
        width={1440}
        height={594}
        alt={`${bgImage.alt}`}
        src={builder.image(bgImage).width(1440).height(594).url()}
        className='w-full h-full object-cover'
      />
      <div className='absolute inset-0 flex items-center justify-center p-4'>
        <Link
          href={href}
          className='border-4 border-white bg-platinum hover:bg-primary transition-all duration-300 text-primary hover:text-white text-center
          rounded-full p-5 flex items-center justify-center flex-col gap-3 h-[175px] md:h-[275px] lg:h-[400px] w-[175px] md:w-[275px] lg:w-[400px]'>
          <p className='text-[14px] md:text-[22px] lg:text-[36px] pt-4'>{content}
          <span className='text-[14px] md:text-[22px] lg:text-[36px] italic font-bold'>{bold}</span></p>
          <div className='flex items-center'>
            <p className='text-[10px] md:text-[14px] lg:text-[16px]'>{cta}</p>
            <ArrowRight className='w-3 h-3 md:w-5 md:h-5 lg:w-6 lg:h-6 ml-1 md:ml-2' />
          </div>
        </Link>
      </div>
    </section>
  );
}
