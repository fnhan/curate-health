import Image from "next/image";
import { notFound } from "next/navigation";

import { MailIcon, MapPinIcon, PhoneIcon, PrinterIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addressLines, addressOneLine } from "@/lib/address";
import { externalLinkProps } from "@/lib/links";
import { buildPageMetadata } from "@/lib/page-metadata";
import { CONTACT_PAGE_QUERYResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import { CONTACT_PAGE_QUERY } from "@/sanity/lib/queries";

export default async function ContactPage() {
  const contactPage = await sanityFetch<CONTACT_PAGE_QUERYResult>({
    query: CONTACT_PAGE_QUERY,
  });

  if (!contactPage) {
    return notFound();
  }

  const { page } = contactPage;

  if (!page) {
    return null;
  }

  /**
   * The address comes from siteSettings, not from this page. CH-025.
   *
   * CONTACT_PAGE_QUERY fetched both copies and this component used the
   * contactPage one, so the address rendered here and the address in the
   * schema graph, the footer and llms.txt came from different documents that
   * had already drifted apart. The contactPage copy is gone.
   *
   * The second-location section went with it. That location closed in 2026 and
   * its fields have been absent from the data since 2026-08-18, so the whole
   * block was rendering nothing behind a gate that could never open.
   */
  const contactInfo = contactPage.contactInfo?.contactInfo;

  const {
    heroSection,
    branchName,
    mapURL,
    businessHours,
    parking,
    howToGetHere,
    contactForm,
  } = page;

  return (
    <>
      <section className="relative">
        {/* Image Container */}
        <div className="relative h-[572px] md:h-[720px]">
          <Image
            src={heroSection?.heroImage?.image ?? ""}
            alt={heroSection?.heroImage?.alt ?? ""}
            width={1920}
            height={1080}
            priority
            quality={100}
            sizes="100vw"
            className="absolute h-full w-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="absolute inset-0 flex items-center">
          <div className="container flex flex-col gap-8">
            <h1 className="text-3xl text-white md:text-5xl">
              {heroSection?.title}
            </h1>
            <div className="flex flex-col gap-4">
              {/* Location */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <MapPinIcon className="h-4 w-4" />
                  <p className="text-sm text-white/80 md:text-base">Location</p>
                </div>
                <div className="pl-8">
                  {/*
                    The listing, not directions. This used to start navigation,
                    because it read the contactPage mapLink which held the
                    directions URL. Now it matches the footer and opens the
                    Google listing, and the Get Directions button below is the
                    one that navigates. CH-025.
                  */}
                  <a
                    href={contactInfo?.mapLink ?? ""}
                    {...externalLinkProps(contactInfo?.mapLink ?? "")}
                    className="not-italic hover:underline md:text-3xl"
                  >
                    {addressOneLine(contactInfo?.address)}
                  </a>
                </div>
              </div>
              {/* Email */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <MailIcon className="h-4 w-4" />
                  <p className="text-sm text-white/80 md:text-base">Email</p>
                </div>
                <div className="pl-8">
                  <a
                    href={`mailto:${contactInfo?.email}`}
                    className="not-italic hover:underline md:text-3xl"
                  >
                    {contactInfo?.email}
                  </a>
                </div>
              </div>
              {/* Phone */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <PhoneIcon className="h-4 w-4" />
                  <p className="text-sm text-white/80 md:text-base">Phone</p>
                </div>
                <div className="pl-8">
                  <a
                    href={`tel:${contactInfo?.phone}`}
                    className="not-italic hover:underline md:text-3xl"
                  >
                    {contactInfo?.phone}
                  </a>
                </div>
              </div>
              {/* Fax */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <PrinterIcon className="h-4 w-4" />
                  <p className="text-sm text-white/80 md:text-base">Fax</p>
                </div>
                <div className="pl-8">
                  <a
                    href={`tel:${contactInfo?.phone}`}
                    className="not-italic hover:underline md:text-3xl"
                  >
                    {contactInfo?.phone}
                  </a>
                  <p className="text-xs text-white/80 md:text-base">
                    (Same as Phone)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-16 bg-white py-14 text-black md:py-28">
        <div className="container flex flex-col gap-16 md:grid md:grid-cols-2">
          <div className="flex flex-col gap-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-medium">{branchName}</h2>
              <address className="not-italic">
                {addressLines(contactInfo?.address).map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </div>
            <div className="flex flex-col gap-4">
              {/* Hours */}
              <div className="space-y-2">
                {businessHours?.daysOpen?.map((day) => {
                  // Check if day has an exception
                  const exception = businessHours.exceptions?.find(
                    (exc) => exc.day === day
                  );

                  // Use exception hours if they exist, otherwise use standard hours
                  const hours =
                    exception?.hours ??
                    (businessHours.standardHours === "custom"
                      ? businessHours.customStandardHours
                      : businessHours.standardHours);

                  return (
                    <div
                      key={day}
                      className="grid grid-cols-2 text-sm sm:text-base"
                    >
                      <span className="font-medium capitalize">{day}</span>
                      <span className="text-right">{hours || "Closed"}</span>
                      {exception?.message && <p>{exception.message}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
            <Button
              asChild
              className="rounded-none border border-primary transition-all duration-300 hover:bg-transparent hover:text-primary"
            >
              {/*
                directionsLink, not mapLink. mapLink opens the Google listing;
                this one carries a daddr and starts navigation, which is what
                this button says it does. They were one field until CH-025.
              */}
              <a
                href={contactInfo?.directionsLink ?? ""}
                {...externalLinkProps(contactInfo?.directionsLink ?? "")}
                className="flex items-center justify-center gap-2"
              >
                <MapPinIcon className="h-4 w-4" />
                <span>Get Directions</span>
              </a>
            </Button>
          </div>
          <div>
            <iframe
              src={mapURL ?? ""}
              className="h-80 w-full md:h-full"
              title="curate-health-google-maps"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen={false}
            ></iframe>
          </div>
        </div>

        {(parking || howToGetHere) && (
          <div className="container flex flex-col gap-16 md:grid md:grid-cols-2">
            {parking && (
              <div>
                <h2 className="mb-4 text-2xl font-medium">Parking</h2>
                <p className="whitespace-pre-line">{parking}</p>
              </div>
            )}
            {howToGetHere && (
              <div>
                <h2 className="mb-4 text-2xl font-medium">How to get here</h2>
                <p className="whitespace-pre-line">{howToGetHere}</p>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="relative bg-[#EBEBEB] py-14">
        <div className="container flex flex-col gap-16 py-24 md:grid md:grid-cols-2">
          <div className="text-light z-10 flex flex-col items-start gap-6 text-black">
            <h2 className="text-balance text-2xl font-light">
              Need assistance?
            </h2>
            <div className="max-w-xl space-y-4 text-pretty font-light">
              If you need help getting started with the Curate Lifestyle
              Program, our team is here to support you— please contact us or
              send us a message for guidance on the referral process and next
              steps.
            </div>
            <div className="w-full">
              <form
                action="https://formspree.io/f/xrblyjbl"
                method="POST"
                className="space-y-4 text-black"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="relative space-y-2">
                    {/* <Label
                      htmlFor="name"
                      className="absolute left-2 top-2 -translate-y-1/2 bg-[#EBEBEB] px-3 text-sm"
                    >
                      Name
                    </Label> */}
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Name"
                      className="w-full rounded-none border-black bg-[#EBEBEB] px-4 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                  <div className="space-y-2">
                    {/* <Label htmlFor="email">Email</Label> */}
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="Email address"
                      className="w-full rounded-none border-black bg-[#EBEBEB] px-4 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  {/* <Label htmlFor="subject">Subject</Label> */}
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    placeholder="Subject"
                    className="w-full rounded-none border-black bg-[#EBEBEB] px-4 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="space-y-2">
                  {/* <Label htmlFor="message">Message</Label> */}
                  <textarea
                    id="message"
                    name="message"
                    required
                    placeholder="Message"
                    className="flex min-h-[80px] w-full border border-black bg-[#EBEBEB] p-4 focus-visible:ring-0 focus-visible:ring-offset-0"
                    rows={4}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-none border border-black bg-[#EBEBEB] py-2 text-sm font-light text-black focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
          <Image
            sizes="(min-width: 768px) 50vw, 100vw"
            src={contactForm?.image ?? ""}
            alt={contactForm?.alt ?? ""}
            fill
            objectFit="contain"
            objectPosition="0 0"
            className="-scale-x-100"
          />
        </div>
      </section>
    </>
  );
}

export async function generateMetadata() {
  const contactPage = await sanityFetch<CONTACT_PAGE_QUERYResult>({
    query: CONTACT_PAGE_QUERY,
  });

  const { seo } = contactPage.page!;

  return buildPageMetadata(seo, { path: "/contact" });
}
