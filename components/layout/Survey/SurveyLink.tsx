import imageUrlBuilder from '@sanity/image-url';
import { Button } from 'components/ui/button';
import { ChevronRightIcon } from 'lucide-react';
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
          rounded-full p-5 flex items-center justify-center flex-col gap-3 h-[175px] md:h-[250px] lg:h-[400px] w-[175px] md:w-[250px] lg:w-[400px]'>
          <p className='text-[14px] md:text-[22px] lg:text-[36px]'>{content}</p>
          <p className='text-[14px] md:text-[22px] lg:text-[36px] italic font-bold text-primary hover:text-white'>{bold}</p>
          <div className='flex items-center gap-1'>
            <p className='text-[10px] md:text-[12px] lg:text[16px]'>{cta}</p>
            <ChevronRightIcon size={18} />
          </div>
        </Link>
      </div>
    </section>
  );
}
