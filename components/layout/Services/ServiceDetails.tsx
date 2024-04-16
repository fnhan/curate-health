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
    <section className='relative text-black bg-white md:h-[960px]' id={service.id}>
      <div className='w-full flex flex-col md:flex-row'>
        <div className='md:w-1/2 ml-20 flex flex-col justify-center'>
          <h2 className='text-stone-800 text-[40px] font-medium font-[Poppins] text-2xl tracking-widest'>{service.title}</h2>
          <br/>
          <div className='text-base font-normal font-Poppins leading-[30px] tracking-tight'>
            <PortableText value={service.content} />
          </div>
          <br/>
          <br/>
          <div className="text-stone-800 text-2xl font-light italic font-['Poppins'] leading-loose">Exercise Therapy</div>
          <div className="text-stone-800 text-2xl font-light italic font-['Poppins'] leading-loose">Nutritional Counseling</div>
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
            className='object-cover object-center mt-10 w-[0px] h-[0px] md:h-[515px] md:w-[290px] lg:w-[512px] lg:h-[675px] float-right'/>
        </div>
      </div>
    </section>
  );
}
