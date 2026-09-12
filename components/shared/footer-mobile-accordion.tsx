import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "components/ui/accordion";

import { SocialIcon } from "@/components/shared/social-icon";
import { externalLinkProps } from "@/lib/links";
import { SITE_SETTINGS_QUERYResult } from "@/sanity.types";

export function FooterMobileAccordion({
  siteSettings,
}: {
  siteSettings: SITE_SETTINGS_QUERYResult;
}) {
  if (!siteSettings) return null;

  const { services, footerNavLinks, socialMedia, aboutPages } = siteSettings;

  return (
    <Accordion type="single" collapsible className="w-full lg:hidden">
      {/* Services Section */}
      {services && (
        <AccordionItem value="services">
          <AccordionTrigger className="font-semibold">
            Services
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-1 text-base">
              {services.map(
                (service, index) =>
                  service.isActive && (
                    <Link
                      key={index}
                      className="hover:underline"
                      href={`/services/${service.slug}`}
                    >
                      {service.title}
                    </Link>
                  )
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}
      {/* About Pages Section */}
      {aboutPages && (
        <AccordionItem value="about-pages">
          <AccordionTrigger className="font-semibold">About</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-1 text-base">
              {aboutPages
                ?.filter(Boolean) // Remove null/undefined values
                .map((page, index) => (
                  <Link
                    key={index}
                    className="hover:underline"
                    href={`/about/${page?.slug}`}
                  >
                    {page?.title}
                  </Link>
                ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Other Sections */}
      {footerNavLinks?.map((section, index) => (
        <AccordionItem key={index} value={`section-${index}`}>
          <AccordionTrigger className="font-semibold">
            {section.groupTitle}
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-1 text-base">
              {section.links?.map((link, linkIndex) => (
                <Link
                  key={linkIndex}
                  className="hover:underline"
                  href={link.slug?.current!}
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}

      {/* Social Links Section */}
      {socialMedia && (
        <AccordionItem value="social-links">
          <AccordionTrigger className="font-semibold">Connect</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-2 text-base">
              {/*
                isActive was not being checked here, only in the desktop
                footer, so switching a profile off in the Studio hid it on
                desktop and left it showing on phones. Most visitors are on a
                phone.
              */}
              {socialMedia
                ?.filter((link) => link.isActive)
                .map((link, index) => (
                  <a
                    key={index}
                    className="flex items-center gap-2 hover:underline"
                    href={link.url!}
                    {...externalLinkProps(link.url!)}
                  >
                    <SocialIcon platform={link.platform} size={16} />
                    <span>{link.label || link.platform}</span>
                  </a>
                ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
}
