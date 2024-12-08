"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MailIcon, MapPinIcon, MoveUpRightIcon, PhoneIcon } from "lucide-react";

import { SITE_SETTINGS_QUERYResult } from "@/sanity.types";

import { FooterMobileAccordion } from "./footer-mobile-accordion";

export default function SiteFooter({
  siteSettings,
}: {
  siteSettings: SITE_SETTINGS_QUERYResult;
}) {
  const pathname = usePathname();

  if (pathname === "/coming-soon") {
    return null;
  }

  if (!siteSettings) return null;

  const {
    brandName,
    socialMedia,
    legalLinks,
    contactInfo,
    footerNavLinks,
    services,
    aboutPages,
  } = siteSettings!;

  return (
    <footer className="flex w-full flex-col pb-8 pt-14 text-sm md:text-base">
      <div className="container flex flex-col gap-10 text-white">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          {/* Contact Info */}
          <address className="space-y-2 text-sm not-italic md:text-base">
            <h6 className="w-fit font-semibold hover:underline">
              <Link href="/contact">Contact</Link>
            </h6>
            <a
              className="flex items-start gap-2 hover:underline"
              href={contactInfo?.mapLink!}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MapPinIcon size={20} className="mt-1" />
              <div>
                {contactInfo?.address?.street},
                <br />
                {contactInfo?.address?.city}, {contactInfo?.address?.state}
                {", "}
                {contactInfo?.address?.zip}, {contactInfo?.address?.country}
              </div>
            </a>
            <div className="space-y-2">
              <a
                className="flex w-fit items-center gap-2 hover:underline"
                href={`mailto:${contactInfo?.email}`}
              >
                <MailIcon size={20} />
                <span>{contactInfo?.email}</span>
              </a>
              <a
                className="flex w-fit items-center gap-2 hover:underline"
                href={`tel:${contactInfo?.phone}`}
              >
                <PhoneIcon size={20} />
                <span>{contactInfo?.phone}</span>
              </a>
            </div>
          </address>
          <div>
            <FooterMobileAccordion siteSettings={siteSettings} />
            <div className="hidden flex-col gap-2 lg:flex lg:flex-row lg:justify-end lg:gap-10">
              {/* Services Section */}
              <div className="border-b border-white pb-2 lg:border-none">
                <h6 className="pl-3 font-semibold md:mb-3">Services</h6>
                <div className="hidden flex-col gap-1 pl-3 md:flex">
                  {services?.map((service, index) => (
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
              {/* About Pages Section */}
              <div className="border-b border-white pb-2 lg:border-none">
                <h6 className="pl-3 font-semibold md:mb-3">About</h6>
                <div className="hidden flex-col gap-1 pl-3 md:flex">
                  {aboutPages?.map((page, index) => (
                    <Link
                      key={index}
                      className="hover:underline"
                      href={`/about/${page.slug}`}
                    >
                      {page.title}
                    </Link>
                  ))}
                </div>
              </div>
              {/* Grouped Links Sections */}
              {footerNavLinks?.map((group, index) => (
                <div
                  key={index}
                  className="border-b border-white pb-2 md:border-none"
                >
                  <h6 className="pl-3 font-semibold md:mb-3">
                    {group.groupTitle}
                  </h6>
                  <div className="hidden flex-col gap-1 pl-3 md:flex">
                    {group.links?.map((link, linkIndex) => (
                      <Link
                        key={linkIndex}
                        className="hover:underline"
                        href={link.slug?.current!}
                      >
                        {link.title}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              {/* Social Links Section */}
              <div>
                <h6 className="pl-3 font-semibold md:mb-3">Connect</h6>
                <div className="hidden flex-col gap-1 pl-3 md:flex">
                  {socialMedia
                    ?.filter((link) => link.isActive)
                    .map((link, linkIndex) => (
                      <a
                        key={linkIndex}
                        target="_blank"
                        className="flex items-center gap-2 hover:underline"
                        href={link.url!}
                      >
                        <span>{link.platform}</span>
                        <MoveUpRightIcon size={16} />
                      </a>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col-reverse justify-between gap-6 pt-6 text-sm md:flex-row lg:border-t lg:border-white">
          <div className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} {brandName}
          </div>
          <div className="flex flex-col justify-center gap-2 text-center sm:flex-row sm:justify-between md:justify-end md:gap-10 md:text-left">
            {legalLinks?.map((link, index) => (
              <Link key={index} className="hover:underline" href={link.slug!}>
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
