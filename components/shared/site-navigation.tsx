"use client";

import Link from "next/link";
import { useState } from "react";

import { Sheet, SheetContent, SheetTrigger } from "components/ui/sheet";
import { Menu } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  PRIMARY_CTA_BUTTON_QUERYResult,
  SITE_SETTINGS_QUERYResult,
} from "@/sanity.types";

import PrimaryCTAButton from "./primary-cta-button";

export default function SiteNav({
  siteSettings,
  primaryCTAButton,
}: {
  siteSettings: SITE_SETTINGS_QUERYResult;
  primaryCTAButton: PRIMARY_CTA_BUTTON_QUERYResult;
}) {
  const [open, setOpen] = useState(false);

  if (!siteSettings) return null;

  const { brandName, navLinks, services, aboutPages, siteLogo } = siteSettings!;

  return (
    <nav className="sticky top-0 z-50 border-b bg-primary/25 text-white backdrop-blur-3xl">
      <div className="flex items-center justify-between px-4 sm:container">
        <div className="flex flex-1 items-center">
          <div className="flex py-10" aria-label="menu toggle">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                aria-label="navigation menu"
                aria-controls="nav-items"
                id="nav-menu"
              >
                <Menu className="transition-all duration-300 hover:text-black" />
              </SheetTrigger>
              <SheetContent
                side="left"
                className="max-w-[300px] border-none pt-[142px] text-white sm:pl-[86px] md:max-w-[416px]"
              >
                <div
                  className="flex flex-col gap-6 text-left"
                  id="nav-items"
                  aria-labelledby="nav-items nav-menu"
                >
                  <Link
                    className="text-2xl hover:underline"
                    href={"/"}
                    onClick={() => setOpen(false)}
                  >
                    Home
                  </Link>
                  {/* Services */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem
                      value="services"
                      className="border-none text-2xl"
                    >
                      <AccordionTrigger className="p-0 font-normal">
                        Services
                      </AccordionTrigger>
                      <AccordionContent className="ml-4 flex flex-col gap-2 pt-6">
                        {services?.map((service, index) => (
                          <Link
                            key={index}
                            className="text-base hover:underline"
                            href={`/services/${service.slug}`}
                          >
                            {service.title}
                          </Link>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  {/* About Pages */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem
                      value="about-pages"
                      className="border-none text-2xl"
                    >
                      <AccordionTrigger
                        className="p-0 font-normal"
                        aria-label="about-pages"
                        aria-controls="about-items"
                        id="about-menu"
                      >
                        About
                      </AccordionTrigger>
                      <AccordionContent className="ml-4 flex flex-col gap-2 pt-6">
                        {aboutPages?.map((page, index) => (
                          <Link
                            key={index}
                            className="text-base hover:underline"
                            href={`/about/${page.slug}`}
                            onClick={() => setOpen(false)}
                          >
                            {page.title}
                          </Link>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  {/* Additional Links */}
                  {navLinks?.map((link, index) => (
                    <Link
                      key={index}
                      className="text-2xl hover:underline"
                      href={link.href!}
                      onClick={() => setOpen(false)}
                    >
                      {link.title}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <div className="flex flex-1 justify-center">
          {/* <Link href={"/"} onClick={() => setOpen(false)}>
            <Image
              src={siteLogo?.asset?.url!}
              width={48}
              height={48}
              alt={`${brandName} Logo`}
              className="size-[30px] transition-all duration-300 hover:opacity-75 sm:size-12"
            />
          </Link> */}
        </div>
        {/* Primary CTA Button */}
        <div className="flex flex-1 justify-end">
          <PrimaryCTAButton primaryCTAButton={primaryCTAButton} />
        </div>
      </div>
    </nav>
  );
}
