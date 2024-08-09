import { PortableText } from '@portabletext/react';
import imageUrlBuilder from '@sanity/image-url';
import { SanityDocument } from 'next-sanity';
import Image from 'next/image';
import { dataset, projectId } from '../../sanity/env';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'components/ui/accordion';
import { Console } from 'console';

const builder = imageUrlBuilder({ projectId, dataset });

function PortableTextAccordion(content) {
  return (
    <Accordion type='multiple'>
      {content.map((obj, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <div className='font-light text-[#283619] text-xl leading-loose'>
            <AccordionTrigger>{obj.title}</AccordionTrigger>
          </div>
          <AccordionContent>
            <div className='font-light text-[#283619] text-xl leading-loose'>
              <PortableText value={obj.description} />
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export default function Product({ product }: { product: SanityDocument }) {
  // Temporary
  if (!product) {
    return <div>Loading or no post found...</div>;
  }

  const { title, image, description, banner, indepthblockinfo, accordioninfo } =
    product;

  return (
    <div className='w-full pb-60 bg-white'>
      {banner ? (
        <Image
          loading='lazy'
          width={1080}
          height={1440}
          src={builder.image(banner).width(1080).height(1440).quality(80).url()}
          alt={banner.alt}
          className='w-full object-cover object-center max-h-[280px] md:max-h-[625px]'
        />
      ) : null}

      <div className='sm:w-full md:container text-black poppins'>
        <div className='flex sm:justify-center lg:justify-between flex-col-reverse md:flex-row'>
          <div className='1 sm:w-full md:w-1/2 px-8 pt-28'>
            {title ? (
              <h1 className='font-light text-5xl  text-[#283619] mb-8'>
                {title}
              </h1>
            ) : null}
            {accordioninfo ? (
              <div>{PortableTextAccordion(accordioninfo)}</div>
            ) : null}
          </div>

          <div
            className='flex flex-col items-center justify-center p-8 sm:w-full md:w-1/2 sm:h-full lg:h-4/6'
            style={{ background: '#F3F4F1' }}
          >
            {image ? (
              <Image
                className='float-center m-0 w-1/3 mr-4 rounded-lg pb-5'
                src={builder.image(image).quality(80).url()}
                width={300}
                height={300}
                alt={image.alt || ''}
              />
            ) : null}
            {title ? (
              <h1 className='italic text-[#0B0014] font-light text-4xl poppins mb-8'>
                {title}
              </h1>
            ) : null}
            {description ? (
              <p className='text-[#0B0014] text-center font-normal leading-loose poppins text-xl'>
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
