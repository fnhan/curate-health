import Image from "next/image";
import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "components/ui/accordion";
import { Sheet, SheetContent, SheetTrigger } from "components/ui/sheet";
import { Menu } from "lucide-react";
import logo from "public/images/logo_white.png";

export default function Nav({ navigation }) {
  const { aboutLinks, serviceLinks, navItems } = navigation;

  return (
    <nav className="sticky top-0 z-50 border-b bg-primary/25 text-white backdrop-blur-3xl">
      <div className="container flex items-center justify-between">
        <div className="flex flex-1 items-center">
          <div className="flex py-10" aria-label="menu toggle">
            <Sheet>
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
                  {navItems.map((item, index) => {
                    if (item.isServiceLinks) {
                      return (
                        <Accordion
                          key={`service-links-${index}`}
                          type="single"
                          collapsible
                          className="w-full"
                        >
                          <AccordionItem
                            value="service-links"
                            className="border-none text-2xl"
                          >
                            <AccordionTrigger
                              className="p-0 font-normal"
                              aria-label="services"
                              aria-controls="service-items"
                              id="service-menu"
                            >
                              Services
                            </AccordionTrigger>
                            <AccordionContent className="ml-4 flex flex-col gap-2 pt-6">
                              {serviceLinks.map((service, serviceIndex) => (
                                <Link
                                  key={`service-link-${serviceIndex}`}
                                  className="text-base hover:underline"
                                  href={`/services/${service.slug}`}
                                >
                                  {service.title}
                                </Link>
                              ))}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      );
                    }
                    if (item.isAboutLinks) {
                      return (
                        <Accordion
                          key={`about-links-${index}`}
                          type="single"
                          collapsible
                          className="w-full"
                        >
                          <AccordionItem
                            value="about-links"
                            className="border-none text-2xl"
                          >
                            <AccordionTrigger
                              className="p-0 font-normal"
                              aria-label="about pages"
                              aria-controls="about-items"
                              id="about-menu"
                            >
                              About
                            </AccordionTrigger>
                            <AccordionContent className="ml-4 flex flex-col gap-2 pt-6">
                              {aboutLinks.map((aboutLink, aboutIndex) => (
                                <Link
                                  key={`about-link-${aboutIndex}`}
                                  className="text-base hover:underline"
                                  href={aboutLink.href}
                                >
                                  {aboutLink.title}
                                </Link>
                              ))}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      );
                    }

                    return (
                      <Link
                        key={`nav-item-${index}`}
                        className="text-2xl hover:underline"
                        href={item.href}
                      >
                        {item.linkText}
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <div className="flex flex-1 justify-center">
          <Link href={"/"}>
            <Image
              src={logo}
              width={48}
              height={48}
              alt="Curate Health Logo"
              className="h-10 w-10 md:h-12 md:w-12"
            />
          </Link>
        </div>
        <div className="flex flex-1 justify-end">
          <Link
            className="text-center text-[10px] hover:underline md:text-base"
            href={"/booking"}
          >
            Book Appointment
          </Link>
        </div>
      </div>
    </nav>
  );
}
