"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Sheet, SheetContent, SheetTrigger } from "components/ui/sheet";
import { Menu, Search as SearchIcon } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { treatmentPath } from "@/lib/service-urls";
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
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [sidebarSearchOpen, setSidebarSearchOpen] = useState(false);
  const sidebarSearchInputRef = useRef<HTMLInputElement | null>(null);
  const sidebarSearchRootRef = useRef<HTMLDivElement | null>(null);

  if (pathname === "/coming-soon" || pathname === "/login") {
    return null;
  }

  if (!siteSettings) return null;

  const { brandName, navLinks, services, aboutPages, siteLogo } = siteSettings!;

  useEffect(() => {
    if (!sidebarSearchOpen) return;

    function onPointerDown(e: PointerEvent) {
      const root = sidebarSearchRootRef.current;
      if (!root) return;
      if (e.target instanceof Node && !root.contains(e.target)) {
        setSidebarSearchOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSidebarSearchOpen(false);
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [sidebarSearchOpen]);

  return (
    <nav className="sticky top-0 z-50 border-b bg-primary/25 text-white backdrop-blur-3xl">
      <div className="flex items-center justify-between px-4 sm:container">
        <div className="flex flex-1 items-center">
          <div className="flex py-10">
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
                <div className="scrollbar-thumb-rounded-full min-h-0 flex-1 overflow-y-auto overscroll-y-contain pr-1 scrollbar-thin scrollbar-track-secondary scrollbar-thumb-primary">
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
                                            href={treatmentPath(
                                              service.slug,
                                              treatment.slug
                                            )}
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
                    {/* Programs */}
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem
                        value="programs"
                        className="border-none text-2xl"
                      >
                        <AccordionTrigger
                          className="mr-20 p-0 font-normal"
                          aria-label="programs"
                          aria-controls="programs-items"
                          id="programs-menu"
                        >
                          Programs
                        </AccordionTrigger>
                        <AccordionContent
                          id="programs-items"
                          className="ml-4 flex flex-col gap-2 pt-6"
                        >
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
                          ].map((program, index) => (
                            <Link
                              key={index}
                              className="text-base hover:underline"
                              href={program.href}
                              onClick={() => setOpen(false)}
                            >
                              {program.title}
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
                    {/* Additional Links */}
                    {navLinks?.map((link, index) => (
                      <div key={index} className="flex flex-col gap-2">
                        <Link
                          className="text-2xl hover:underline"
                          href={link.href!}
                          onClick={() => setOpen(false)}
                        >
                          {link.title}
                        </Link>

                        {link.href === "/contact" ||
                        link.title?.toLowerCase() === "contact" ? (
                          <div ref={sidebarSearchRootRef}>
                            <form
                              action="/search"
                              method="get"
                              onSubmit={() => setOpen(false)}
                              className={
                                sidebarSearchOpen ? "mt-3 pr-4" : "mt-3"
                              }
                            >
                              <div
                                className={[
                                  "flex h-9 items-center overflow-hidden rounded-none border text-white",
                                  "ease-[cubic-bezier(0.22,1,0.36,1)] transition-[width,background-color,border-color,box-shadow] duration-300",
                                  sidebarSearchOpen
                                    ? "w-full border-white/20 bg-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.10)]"
                                    : "w-8 border-transparent bg-transparent",
                                ].join(" ")}
                              >
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  aria-label={
                                    sidebarSearchOpen
                                      ? "Close search"
                                      : "Open search"
                                  }
                                  className={[
                                    "h-9 shrink-0 rounded-none p-0 text-white/90 hover:bg-transparent hover:text-white focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:ring-offset-0 focus-visible:ring-offset-transparent",
                                    sidebarSearchOpen ? "w-8" : "w-6",
                                  ].join(" ")}
                                  onClick={() => {
                                    setSidebarSearchOpen((v) => !v);
                                    if (!sidebarSearchOpen) {
                                      window.requestAnimationFrame(() =>
                                        sidebarSearchInputRef.current?.focus()
                                      );
                                    }
                                  }}
                                >
                                  <SearchIcon className="h-6 w-6" />
                                </Button>

                                <div
                                  className={[
                                    "min-w-0 flex-1 transition-[opacity,transform] duration-200 ease-out",
                                    sidebarSearchOpen
                                      ? "translate-x-0 opacity-100"
                                      : "pointer-events-none -translate-x-1 opacity-0",
                                  ].join(" ")}
                                >
                                  <Input
                                    ref={sidebarSearchInputRef}
                                    name="q"
                                    placeholder="Search"
                                    aria-label="Search the site"
                                    disabled={!sidebarSearchOpen}
                                    className="h-9 w-full rounded-none border-0 bg-transparent px-0 pr-3 text-white placeholder:text-white/70 focus-visible:ring-0 focus-visible:ring-offset-0"
                                  />
                                </div>
                              </div>
                            </form>
                          </div>
                        ) : null}
                      </div>
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
          <PrimaryCTAButton primaryCTAButton={primaryCTAButton} />
        </div>
      </div>
    </nav>
  );
}
