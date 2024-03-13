import { Button } from 'components/ui/button';
import Link from 'next/link';

export default function TakeSurvey() {
  return (
    <Link href=''>
      <Button className='outline outline-1 bg-transparent text-white hover:bg-primary rounded-none duration-300 transition-all w-[200px] text-[10px] md:text-[14px]'>
        Take the Survey
      </Button>
    </Link>
  );
}