import { Button } from 'components/ui/button';
import Link from 'next/link';

export default function BookAppointment() {
  return (
    <Link href={'/booking'}>
      <Button className='bg-transparent text-xl text-white border border-white hover:text-white hover:bg-white hover:text-black rounded-none duration-300 transition-all px-8 py-8'>
        Book Appointment
      </Button>
    </Link>
  );
}
