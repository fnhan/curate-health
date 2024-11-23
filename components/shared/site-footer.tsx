import Link from "next/link";

import { Loading } from "components/Loading";

// import { FooterMobileAccordion } from './Footer-Mobile-Accordion';

export default function Footer({ footer }) {
  const {
    contactInfo,
    servicesSection,
    sections,
    socialLinksSection,
    privacy,
  } = footer;

  return (
    <footer className="flex w-full flex-col pb-8 pt-14">
      <div className="container flex flex-col gap-10 text-white">
        {/* Contact Info */}
        <div className="text-sm md:text-base">
          <h2>{contactInfo?.sectionTitle}</h2>
          {contactInfo?.details.map((detail, index) => (
            <div key={index}>
              <p>{detail.value}</p>
            </div>
          ))}
        </div>
        <div>
          {/* <FooterMobileAccordion footer={footer} /> */}
          <div className="hidden flex-col gap-2 text-sm md:flex md:flex-row md:justify-end md:gap-10 md:text-base">
            {/* Services Section */}
            <div className="border-b border-white pb-2 md:border-none">
              <h3 className="pl-3 md:mb-3">Services</h3>
              <div className="hidden flex-col gap-1 pl-3 md:flex">
                {servicesSection.map((service, index) => (
                  <Link
                    key={index}
                    className="hover:underline"
                    href={`/services/${service.slug}`}
                  >
                    {service.title}
                  </Link>
                ))}
              </div>
            </div>
            {/* Footer Sections */}
            {sections.map((section, index) => (
              <div
                key={index}
                className="border-b border-white pb-2 md:border-none"
              >
                <h3 className="pl-3 md:mb-3">{section.title}</h3>
                <div className="hidden flex-col gap-1 pl-3 md:flex">
                  {section.links?.map((link, linkIndex) => (
                    <Link
                      key={linkIndex}
                      className="hover:underline"
                      href={link.href}
                    >
                      {link.text}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            {/* Social Links Section */}
            <div>
              <h3 className="pl-3 md:mb-3">{socialLinksSection.title}</h3>
              <div className="hidden flex-col gap-1 pl-3 md:flex">
                {socialLinksSection.links.map((link, linkIndex) => (
                  <a
                    key={linkIndex}
                    target="_blank"
                    className="hover:underline"
                    href={link.url}
                  >
                    {link.platform}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-6 md:flex-row">
          <div className="text-xs">
            &copy; {new Date().getFullYear()} Curate Health
          </div>
          <div className="flex justify-between text-xs md:justify-end md:gap-10">
            <Link className="hover:underline" href={"/terms-of-use"}>
              Terms of Use
            </Link>
            <Link href={"/privacy"} className="hover:underline">
              Privacy + Cookies
            </Link>
            <Link href={"/accessibility"} className="hover:underline">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
