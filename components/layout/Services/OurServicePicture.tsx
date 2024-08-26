import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import imageUrlBuilder from '@sanity/image-url';
import { Loading } from 'components/Loading';
import { dataset, projectId } from '../../../sanity/env';

const builder = imageUrlBuilder({ projectId, dataset });

export default function OurServicePicture({ourServices}) {
  if (!ourServices) {
    return <Loading />;
  }

  return (
    <div className='relative'>
      <Image
        loading='lazy'
        width={1080}
        height={1440}
        src={builder
          .image(ourServices.image)
          .width(1440)
          .height(760)
          .quality(80)
          .url()}
        alt='Our Services'
        className='object-cover w-full h-[400px] md:h-[550px] opacity-60'
      />
      <div className='container absolute top-2/3  transform -translate-y-1/2 md:w-2/3'>
        <h1 className='container font-Poppins text-[24px] 2xl:text-[60px] md:text-[40px]'>{ourServices.title}</h1>       
        <div className='container font-Poppins font-light text-[10px] md:text-[12px] 2xl:text-[14px] leading-[24px] mt-8'>
        <PortableText value={ourServices.content} />
        </div >
      </div>
    </div>
  );
}