import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

type HoverLinkProps = {
  href: string;
  text: string;
  textColor?: string;
};

export default function HoverLink({
  href,
  text,
  textColor = 'text-white',
}: HoverLinkProps) {
  return (
    <Link className='w-full' href={href}>
      <div className='container border-t duration-300 transition-all group hover:bg-secondary py-5 text-right block italic'>
        <div className='flex items-center gap-2 hover:gap-20 transition-all duration-300 justify-end'>
          <span className={`${textColor} group-hover:text-white`}>{text}</span>
          <ChevronRight className={`w-5 ${textColor} group-hover:text-white`} />
        </div>
      </div>
    </Link>
  );
}
