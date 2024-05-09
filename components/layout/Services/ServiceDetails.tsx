import { PortableText } from '@portabletext/react';
import imageUrlBuilder from '@sanity/image-url';
import { Loading } from 'components/Loading';
import Image from 'next/image';
import { dataset, projectId } from '../../../sanity/env';

const builder = imageUrlBuilder({ projectId, dataset });

export default function ServiceDetails({ service }) {
  if (!service) {
    return <Loading />;
  }

  return (
    <section className='relative text-black bg-white md:h-[560px] 2xl:h-[860px]' id={service.id}>
      <div className='w-full flex flex-col md:flex-row'>
        <div className='mt-20 mr-10 md:w-1/2 md:mt-20 ml-20 flex flex-col justify-center'>
          <h2 className='text-stone-800 text-[20px] md:text-[40px] 2xl:text-[60px] font-[Poppins] tracking-widest'>{service.title}</h2>
          <br/>
          <div className='text-[11px] mb-10 md:text-[16px] md:leading-[30px] font-normal font-Poppins leading-[20px] md:mb-20 tracking-tight'>
            <PortableText value={service.content} />
          </div>
          <div className="text-stone-800 text-[12px] md:text-[18px] 2xl:text-[24px] font-light italic font-['Poppins'] leading-[10px]">Exercise Therapy</div>
          <div className="text-stone-800 text-[12px] md:text-[18px] 2xl:text-[24px] font-light italic font-['Poppins'] leading-[80px]">Nutritional Counseling</div>
        </div>
        <div className='md:w-1/2 flex justify-end'>
          <Image
            loading='lazy'
            width={1080}
            height={1440}
            src={builder
              .image(service.image)
              .width(1080)
              .height(1440)
              .quality(80)
              .url()}
            alt={service.title}
            className='rounded-full w-[0px] h-[0px] mt-20 md:w-[280px] md:h-[280px] 2xl:w-[500px] 2xl:h-[500px] object-cover mx-auto group-hover:-translate-y-3 '/>
        </div>
      </div>
    </section>
  );
}
