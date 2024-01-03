import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'components/ui/accordion';
import Link from 'next/link';

export function FooterMobileAccordion() {
  return (
    <Accordion type='single' collapsible className='w-full md:hidden'>
      <AccordionItem value='item-1'>
        <AccordionTrigger>Services</AccordionTrigger>
        <AccordionContent>
          <div className='flex flex-col gap-1'>
            <Link
              className='hover:underline'
              href={'/services/physical-health'}>
              Physical Health
            </Link>
            <Link className='hover:underline' href={'/services/mental-health'}>
              Mental Health
            </Link>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value='item-2'>
        <AccordionTrigger>About Us</AccordionTrigger>
        <AccordionContent>
          <div className='flex flex-col gap-1'>
            <Link className='hover:underline' href={'/about/team'}>
              The Team
            </Link>
            <Link className='hover:underline' href={'/about/sustainability'}>
              Sustainability
            </Link>
            <Link className='hover:underline' href={'/about/insights'}>
              Insights
            </Link>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value='item-3'>
        <AccordionTrigger>Blog</AccordionTrigger>
        <AccordionContent>
          <div className='flex flex-col gap-1'>
            <Link className='hover:underline' href={'/blog/inner-health'}>
              Inner Health
            </Link>
            <Link className='hover:underline' href={'/blog/outer-health'}>
              Outer Health
            </Link>
            <Link className='hover:underline' href={'/blog/wellbeing'}>
              Wellbeing
            </Link>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value='item-4'>
        <AccordionTrigger>Inquire</AccordionTrigger>
        <AccordionContent>
          <div className='flex flex-col gap-1'>
            <Link className='hover:underline' href={'/contact'}>
              Contact
            </Link>
            <Link className='hover:underline' href={'/contact/partner'}>
              Partner
            </Link>
            <Link className='hover:underline' href={'/contact/partner'}>
              Press
            </Link>
            <Link className='hover:underline' href={'/contact/join'}>
              Join
            </Link>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value='item-5'>
        <AccordionTrigger>Connect</AccordionTrigger>
        <AccordionContent>
          <div className='flex flex-col gap-1'>
            <a className='hover:underline' href={''}>
              Instagram
            </a>
            <a className='hover:underline' href={''}>
              X
            </a>
            <a className='hover:underline' href={''}>
              LinkedIn
            </a>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
