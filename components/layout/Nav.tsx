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
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
  { href: '/booking', label: 'Appointment Booking' },
];

const Nav = () => {
  return (
    <nav className='text-white'>
      <div className='container flex items-center justify-between'>
        <div className='flex-1 flex items-center'>
          <div className='flex py-10' aria-label='menu toggle'>
            <Sheet>
              <SheetTrigger>
                <Menu className='hover:text-black duration-300 transition-all' />
              </SheetTrigger>
              <SheetContent
                side='left'
                className='bg-primary text-white border-none pt-[142px] sm:pl-[86px] max-w-[300px] md:max-w-[416px]'>
                <SheetHeader>
                  <SheetTitle className='mb-2 text-white'>
                    Curate Health
                  </SheetTitle>
                  <div className='flex flex-col gap-6'>
                    {navItems.map((item) => (
                      <Link
                        className='hover:underline'
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
        <div className='hidden flex-1 sm:flex justify-center'>
          <Link href={'/'}>
            <Image src={logo} width={48} height={48} alt='Curate Health Logo' />
          </Link>
        </div>
        <div className='flex-1 flex justify-end'>
          <Link className='hover:underline font-denton' href={'/booking'}>
            Make An Appointment
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
