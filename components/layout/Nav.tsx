import React from 'react';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from 'components/ui/navigation-menu';
import Link from 'next/link';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from 'components/ui/sheet';
import { Menu } from 'lucide-react';

const NavItem = ({ href, label }) => (
  <Link href={href} legacyBehavior passHref>
    <a
      className={`${navigationMenuTriggerStyle()} bg-transparent hover:bg-transparent hover:text-white/75 transition-all duration-300`}>
      {label}
    </a>
  </Link>
);

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
    <nav className='bg-primary'>
      {/* Desktop Menu */}
      <div className='hidden md:block container border-b'>
        <NavigationMenu>
          <NavigationMenuList>
            {navItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                <NavItem href={item.href} label={item.label} />
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Mobile Menu */}
      <div className='md:hidden container flex justify-end py-6'>
        <Sheet>
          <SheetTrigger>
            <Menu />
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle className='mb-2 border-b'>Menu</SheetTitle>
              <div className='flex flex-col gap-6'>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    legacyBehavior
                    passHref>
                    <a>{item.label}</a>
                  </Link>
                ))}
              </div>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Nav;
