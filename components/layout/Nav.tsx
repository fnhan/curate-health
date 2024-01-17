import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from 'components/ui/sheet';
import { Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import logo from 'public/images/logo_white.png';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/services', label: 'Services' },
  { href: '/products', label: 'Products' },
  { href: '/cafe', label: 'Curate Cafe' },
  { href: '/blog', label: 'Blog' },
  { href: '/booking', label: 'Appointment Booking' },
  { href: '/contact', label: 'Contact' },
];

export default function Nav() {
  return (
    <nav className='text-white bg-primary/25'>
      <div className='container flex items-center justify-between'>
        <div className='flex-1 flex items-center'>
          <div className='flex py-10' aria-label='menu toggle'>
            <Sheet>
              <SheetTrigger>
                <Menu className='hover:text-black duration-300 transition-all' />
              </SheetTrigger>
              <SheetContent
                side='left'
                className='text-white border-none pt-[142px] sm:pl-[86px] max-w-[300px] md:max-w-[416px]'>
                <SheetHeader>
                  <div className='flex flex-col gap-6 text-left'>
                    {navItems.map((item) => (
                      <Link
                        className='hover:underline text-2xl'
                        key={item.href}
                        href={item.href}>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <div className='flex flex-1 justify-center'>
          <Link href={'/'}>
            <Image
              src={logo}
              width={48}
              height={48}
              alt='Curate Health Logo'
              className='w-10 h-10 md:w-12 md:h-12'
            />
          </Link>
        </div>
        <div className='flex-1 flex justify-end'>
          <Link
            className='hover:underline font-denton-condesnsed text-[10px] md:text-base text-center'
            href={'/booking'}>
            Make An Appointment
          </Link>
        </div>
      </div>
    </nav>
  );
}
