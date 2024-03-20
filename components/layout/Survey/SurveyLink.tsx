import imageUrlBuilder from '@sanity/image-url';
import { Button } from 'components/ui/button';
import Image from 'next/image';
import { dataset, projectId } from '../../../sanity/env';

const builder = imageUrlBuilder({ projectId, dataset });

export default function SurveyLink({ surveyLink }) {
  const { bgImage, cta, href } = surveyLink;
  return (
    <section className='relative bg-platinum h-[56px] md:h-[112px]'>
      <Image
        width={1440}
        height={112}
        alt={`${bgImage.alt}`}
        src={builder.image(bgImage).width(1440).height(112).url()}
        className='w-full h-full object-cover'
      />
      <div className='absolute inset-0 flex items-center justify-start pl-20'>
        <a href={href}>
          <Button className='outline outline-1 bg-transparent text-white hover:bg-primary rounded-none duration-300 transition-all w-[200px] text-[10px] md:text-[14px]'>
            {cta}
          </Button>
        </a>
      </div>
    </section>
  );
}
