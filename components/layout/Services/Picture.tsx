import { PortableText } from '@portabletext/react';
import imageUrlBuilder from '@sanity/image-url';
import { Loading } from 'components/Loading';
import Image from 'next/image';
import { dataset, projectId } from '../../../sanity/env';

const builder = imageUrlBuilder({ projectId, dataset });

export default function Picture({ service }) {
  if (!service) {
    return <Loading />;
  }

  return (
        <div className=''>
          <Image
            loading='lazy'
            width={1080}
            height={1440}
            src={builder
              .image(service.above_image)
              .width(1440)
              .height(760)
              .quality(80)
              .url()}
            alt={service.title}
            className='object-cover w-full h-[200px] md:h-[300px] 2xl:h-[400px]'/>
        </div>
  
  );
}
