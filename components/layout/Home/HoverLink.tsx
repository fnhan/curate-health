import { ChevronRight } from 'lucide-react';

export default function HoverLink(props) {
  return (
    <div className='container border-t duration-300 transition-all hover:bg-secondary py-5 text-right block font-denton-condensed italic'>
      <div className='flex items-center gap-2 hover:gap-20 transition-all duration-300 justify-end'>
        <span>{props.text}</span>
        <ChevronRight className='w-5' />
      </div>
    </div>
  )
}