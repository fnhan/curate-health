import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'components/ui/accordion';
import Link from 'next/link';
import { FooterProps } from './Footer';

export function FooterMobileAccordion({ footer }: FooterProps) {
  const { servicesSection, sections, socialLinksSection } = footer;

  return (
    <Accordion type='single' collapsible className='w-full md:hidden'>
      {/* Services Section */}
      {servicesSection && (
        <AccordionItem value='services'>
          <AccordionTrigger>Services</AccordionTrigger>
          <AccordionContent>
            <div className='flex flex-col gap-1'>
              {servicesSection.map((service, index) => (
                <Link
                  key={index}
                  className='hover:underline'
                  href={`/services/${service.slug}`}>
                  {service.title}
                </Link>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Other Sections */}
      {sections.map((section, index) => (
        <AccordionItem key={index} value={`section-${index}`}>
          <AccordionTrigger>{section.title}</AccordionTrigger>
          <AccordionContent>
            <div className='flex flex-col gap-1'>
              {section.links?.map((link, linkIndex) => (
                <Link
                  key={linkIndex}
                  className='hover:underline'
                  href={link.href}>
                  {link.text}
                </Link>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}

      {/* Social Links Section */}
      <AccordionItem value='social-links'>
        <AccordionTrigger>{socialLinksSection.title}</AccordionTrigger>
        <AccordionContent>
          <div className='flex flex-col gap-1'>
            {socialLinksSection.links.map((link, index) => (
              <a
                key={index}
                className='hover:underline'
                href={link.url}
                target='_blank'
                rel='noopener noreferrer'>
                {link.platform}
              </a>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
