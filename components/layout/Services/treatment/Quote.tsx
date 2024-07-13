import { PortableText } from '@portabletext/react';
import { QuoteIcon } from 'lucide-react';

export default function Quote({treatment}) {
  return (
    <div className='bg-secondary opacity-100'>
      <div className='container py-44 text-black 2xl:flex flex-col 2xl:jusitfy-center'>
        <QuoteIcon
          size={120}
          className='fill-current text-primary rotate-180 mx-auto first-letter scale-[1.33]'
        />
        <div className='pt-20 2xl:px-60 2xl:text-center italic text-[16px] font-light md:text-[22px] 2xl:text-[32px]'>
          <PortableText value={treatment.quoteContent} />
        </div>
      </div>
    </div>
  );
}
