"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Search } from "lucide-react";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "components/ui/sheet";
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

import { Button } from "@/components/ui/button";

import HeaderSearch from "./header-search";
import PrimaryCTAButton from "./primary-cta-button";

export default function SiteNav({
  siteSettings,
  primaryCTAButton,
}: {
  siteSettings: SITE_SETTINGS_QUERYResult;
  primaryCTAButton: PRIMARY_CTA_BUTTON_QUERYResult;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  if (pathname === "/coming-soon" || pathname === "/login") {
    return null;
  }

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
                <Menu className="transition-all duration-300 hover:text-secondary" />
              </SheetTrigger>
              <SheetContent
                side="left"
                className="flex max-w-[300px] flex-col overflow-hidden border-none pt-[142px] text-white sm:pl-[86px] md:max-w-[416px]"
              >
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pr-1 scrollbar-thin scrollbar-track-secondary scrollbar-thumb-primary scrollbar-thumb-rounded-full">
                  <div
                    className="flex flex-col gap-6 pb-6 text-left"
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
                      <AccordionTrigger className="mr-20 p-0 font-normal">
                        Services
                      </AccordionTrigger>
                      <AccordionContent className="ml-4 flex flex-col gap-2 pt-6">
                        {services?.map((service, index) => {
                          return service.treatments &&
                            service.treatments.length > 0 ? (
                            <div key={index}>
                              <Accordion
                                type="single"
                                collapsible
                                className="w-full"
                              >
                                <AccordionItem
                                  value={`service-${index}`}
                                  className="border-none"
                                >
                                  <AccordionTrigger className="mr-20 p-0 pr-4 text-base font-normal">
                                    {service.title}
                                  </AccordionTrigger>
                                  <AccordionContent className="ml-4 flex flex-col gap-2 pt-4">
                                    {service.treatments.map(
                                      (treatment, treatmentIndex) => (
                                        <Link
                                          key={treatmentIndex}
                                          className="text-sm hover:underline"
                                          href={`/services/${service.slug}/${treatment.slug}`}
                                          onClick={() => setOpen(false)}
                                        >
                                          {treatment.title}
                                        </Link>
                                      )
                                    )}
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            </div>
                          ) : null;
                        })}
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
                        className="mr-20 p-0 font-normal"
                        aria-label="about-pages"
                        aria-controls="about-items"
                        id="about-menu"
                      >
                        About
                      </AccordionTrigger>
                      <AccordionContent className="ml-4 flex flex-col gap-2 pt-6">
                        {aboutPages
                          ?.filter(Boolean) // Remove null/undefined values
                          .map((page, index) => (
                            <Link
                              key={index}
                              className="text-base hover:underline"
                              href={`/about/${page?.slug}`}
                              onClick={() => setOpen(false)}
                            >
                              {page?.title}
                            </Link>
                          ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  {/* Programs */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem
                      value="about-pages"
                      className="border-none text-2xl"
                    >
                      <AccordionTrigger
                        className="mr-20 p-0 font-normal"
                        aria-label="about-pages"
                        aria-controls="about-items"
                        id="about-menu"
                      >
                        Programs
                      </AccordionTrigger>
                      <AccordionContent className="ml-4 flex flex-col gap-2 pt-6">
                        {[
                          {
                            title: "Essential Series",
                            href: "/our-programs#essential-series",
                          },
                          {
                            title: "Curate Lifestyle",
                            href: "/services/curate-lifestyle",
                          },
                          {
                            title: "Master Health Blueprint",
                            href: "/our-programs#master-health-blueprint",
                          },
                        ].map((page, index) => (
                          <Link
                            key={index}
                            className="text-base hover:underline"
                            href={page.href}
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
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <div className="flex flex-1 justify-center">
          <div className="flex items-center gap-4">
            <Link href={"/"} onClick={() => setOpen(false)}>
              <Image
                src={siteLogo?.asset?.url!}
                width={48}
                height={48}
                alt={`${brandName} Logo`}
                className="size-[30px] transition-all duration-300 hover:opacity-75 sm:size-12"
              />
            </Link>
          </div>
        </div>
        {/* Primary CTA Button */}
        <div className="flex flex-1 items-center justify-end gap-3">
          <HeaderSearch className="hidden w-[320px] lg:block" />
          <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-none border border-white/20 text-white hover:bg-white/10 lg:hidden"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="top"
              overlayClassName="bg-black/30"
              closeButtonClassName="left-auto right-4 top-4 rounded-none border border-slate-200 bg-white hover:bg-slate-50"
              className="left-4 right-4 top-4 rounded-none border border-slate-200 bg-white p-6 text-slate-900 shadow-none"
            >
              <SheetHeader className="mb-4 space-y-0 text-left">
                <SheetTitle className="text-xl font-semibold text-slate-900">
                  Search
                </SheetTitle>
              </SheetHeader>
              <HeaderSearch
                variant="modal"
                placeholder="Search"
                resultsPlacement="inline"
                className="w-full"
              />
            </SheetContent>
          </Sheet>
          <PrimaryCTAButton primaryCTAButton={primaryCTAButton} />
        </div>
      </div>
    </nav>
  );
}
