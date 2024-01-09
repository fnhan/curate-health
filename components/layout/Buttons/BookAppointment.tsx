import { Button } from 'components/ui/button';
import Link from 'next/link';

export default function BookAppointment() {
  return (
    <Link href={'/booking'}>
      <Button className='bg-white text-primary hover:text-white hover:bg-primary rounded-none duration-300 transition-all'>
        Book Appointment
      </Button>
    </Link>
  );
}
