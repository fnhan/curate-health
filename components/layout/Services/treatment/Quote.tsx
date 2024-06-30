import { Button } from 'components/ui/button';
import { QuoteIcon } from 'lucide-react';

export default function Quote() {
  return (
    <div className="container py-44 text-black 2xl:flex flex-col 2xl:jusitfy-center">
        <Button
          className='bg-transparent border-secondary rotate-180 hover:bg-secondary'>
          <QuoteIcon size={120} 
            className="fill-current text-primary">            
          </QuoteIcon >
        </Button>
        <div className='pt-20 2xl:px-60 2xl:text-center italic text-[16px] font-light md:text-[22px] 2xl:text-[32px]'>
        The journey to recovery and enhanced physical health often stalls, 
        not due to a lack of effort, but because of a one-size-fits-all approach that 
        overlooks the individual's unique needs and the holistic nature of healing
        </div>
    </div>

  );
}