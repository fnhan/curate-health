import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'components/ui/accordion';
import { Sheet, SheetContent, SheetTrigger } from 'components/ui/sheet';
import { Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import logo from 'public/images/logo_white.png';

export default function Nav({ navigation }) {
  const { serviceLinks, navItems } = navigation;

  return (
    <nav className='text-white bg-primary/25 backdrop-blur-3xl sticky top-0 z-50 border-b'>
      <div className='container flex items-center justify-between'>
        <div className='flex-1 flex items-center'>
          <div className='flex py-10' aria-label='menu toggle'>
            <Sheet>
              <SheetTrigger>
                <Menu 
                className='hover:text-black duration-300 transition-all' 
                aria-label='navigation menu'  
                aria-controls='nav-items'
                id='nav-toggle' 
                />
              </SheetTrigger>
              <SheetContent
                side='left'
                className='text-white border-none pt-[142px] sm:pl-[86px] max-w-[300px] md:max-w-[416px]'>
                <div className='flex flex-col gap-6 text-left' id='nav-items' aria-labelledby='nav-toggle'>
                  {navItems.map((item, index) => {
                    if (item.isServiceLinks) {
                      return (
                        <Accordion type='single' collapsible className='w-full'>
                          <AccordionItem
                            value='item-1'
                            className='border-none text-2xl'>
                            <AccordionTrigger className='font-normal p-0'>
                              Services
                            </AccordionTrigger>
                            <AccordionContent className='flex flex-col gap-2 pt-6 ml-4'>
                              {serviceLinks.map((service, index) => (
                                <Link
                                  id='nav-item-link'
                                  key={index}
                                  className='hover:underline text-base'
                                  href={`/services/${service.slug}`}>
                                  {service.title}
                                </Link>
                              ))}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      );
                    }

                    return (
                      <Link
                        key={index}
                        className='hover:underline text-2xl'
                        href={item.href}>
                        {item.linkText}
                      </Link>
                    );
                  })}
                </div>
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
            Book Appointment
          </Link>
        </div>
      </div>
    </nav>
  );
}
