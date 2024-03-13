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
    <section className='text-white' id={service.id}>
      <div className='container text-2xl tracking-widest flex justify-center md:justify-start mb-2'>
        <h2 className=''>{service.title}</h2>
      </div>
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
        className='w-full object-cover object-center max-h-[280px] md:max-h-[625px] mb-12'
      />
      <div className='container'>
        <PortableText value={service.content} />
      </div>
    </section>
  );
}
