import { PortableText } from '@portabletext/react';
import imageUrlBuilder from '@sanity/image-url';
import { SanityDocument } from 'next-sanity';
import Image from 'next/image';
import { dataset, projectId } from '../../sanity/env';

const builder = imageUrlBuilder({ projectId, dataset });

export default function Product({ product }: { product: SanityDocument }) {
  // Temporary
  if (!product) {
    return <div>Loading or no post found...</div>;
  }

  const { title, image, description } = product;

  return (
    <div className='w-full pb-60 bg-white'>
      <main className='container mx-auto prose text-black'>
        <div className='flex flex-col-reverse md:flex-row'>
          <div className='1 px-8 pt-10'>
            {title ? <h1 className='text-black'>{title}</h1> : null}
            {description ? <p>{description}</p> : null}
          </div>

          <div
            className='flex flex-col items-center justify-center p-8 '
            style={{ background: '#F3F4F1' }}
          >
            {image ? (
              <Image
                className='float-center m-0 w-1/3 mr-4 rounded-lg pb-5'
                src={builder
                  .image(image)

                  .quality(80)
                  .url()}
                width={300}
                height={300}
                alt={image.alt || ''}
              />
            ) : null}
            {title ? <h3 className='italic text-black'>{title}</h3> : null}
            {description ? (
              <p className='text-black text-center'>{description}</p>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
