import { Loading } from 'components/Loading';
import Link from 'next/link';
import { FooterMobileAccordion } from './Footer-Mobile-Accordion';

export type FooterProps = {
  footer: {
    contactInfo: {
      sectionTitle: string;
      details: Array<{
        label: string;
        value: string;
      }>;
    };
    servicesSection: Array<{
      title: string;
      slug: {
        current: string;
      };
    }>;
    sections: Array<{
      title: string;
      links: Array<{
        text: string;
        href: string;
      }>;
    }>;
    socialLinksSection: {
      title: string;
      links: Array<{
        platform: string;
        url: string;
      }>;
    };
    privacy: {
      links: Array<{
        title: string;
        href: string;
      }>;
    };
  };
};

export default function Footer({ footer }: FooterProps) {
  const { contactInfo, servicesSection, sections, socialLinksSection, privacy } = footer;
  console.log(privacy)

  return (
    <footer className='flex flex-col pt-14 pb-8 w-full'>
      <div className='container text-white flex flex-col gap-10'>
        {/* Contact Info */}
        <div className='text-sm md:text-base'>
          <h2>{contactInfo?.sectionTitle}</h2>
          {contactInfo?.details.map((detail, index) => (
            <div key={index}>
              <p>{detail.value}</p>
            </div>
          ))}
        </div>
        <div>
          <FooterMobileAccordion footer={footer} />
          <div className='hidden md:flex flex-col gap-2 md:flex-row md:justify-end md:gap-10 text-sm md:text-base'>
            {/* Services Section */}
            <div className='border-b border-white md:border-none pb-2'>
              <h3 className='md:font-denton pl-3 md:mb-3'>Services</h3>
              <div className='hidden md:flex flex-col gap-1 pl-3'>
                {servicesSection.map((service, index) => (
                  <Link
                    key={index}
                    className='hover:underline'
                    href={`/services/${service.slug}`}>
                    {service.title}
                  </Link>
                ))}
              </div>
            </div>
            {/* Footer Sections */}
            {sections.map((section, index) => (
              <div
                key={index}
                className='border-b border-white md:border-none pb-2'>
                <h3 className='md:font-denton pl-3 md:mb-3'>{section.title}</h3>
                <div className='hidden md:flex flex-col gap-1 pl-3'>
                  {section.links?.map((link, linkIndex) => (
                    <Link
                      key={linkIndex}
                      className='hover:underline'
                      href={link.href}>
                      {link.text}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            {/* Social Links Section */}
            <div>
              <h3 className='md:font-denton pl-3 md:mb-3'>
                {socialLinksSection.title}
              </h3>
              <div className='hidden md:flex flex-col gap-1 pl-3'>
                {socialLinksSection.links.map((link, linkIndex) => (
                  <a
                    key={linkIndex}
                    target='_blank'
                    className='hover:underline'
                    href={link.url}>
                    {link.platform}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className='flex flex-col md:flex-row justify-between gap-6'>
          <div className='text-xs'>
            &copy; {new Date().getFullYear()} Curate Health
          </div>
          <div className='flex justify-between md:justify-end md:gap-10 text-xs'>
            <Link className='hover:underline' href={'/terms-of-use'}>
              Terms of Use
            </Link>
            <Link href={'/privacy'} className='hover:underline'>
              Privacy + Cookies
            </Link>
            <Link href={'/accessibility'} className='hover:underline'>
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
