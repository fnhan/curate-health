import Image from "next/image";
import { notFound } from "next/navigation";

import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CONTACT_PAGE_QUERYResult } from "@/sanity.types";
import { CONTACT_PAGE_QUERY } from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/server-client";

export default async function ContactPage() {
  const contactPage = await sanityFetch<CONTACT_PAGE_QUERYResult>({
    query: CONTACT_PAGE_QUERY,
  });

  if (!contactPage) {
    return notFound();
  }

  const { contactInfo, page } = contactPage;

  if (!page) {
    return null;
  }

  const { heroSection, mapURL, businessHours } = page;

  return (
    <>
      <section className="relative">
        {/* Image Container */}
        <div className="relative h-[572px] md:h-[720px]">
          <Image
            src={heroSection?.heroImage?.image ?? ""}
            alt={heroSection?.heroImage?.alt ?? ""}
            width={1440}
            height={1080}
            className="absolute h-full w-full object-cover"
            priority
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
                  <a
                    href={contactInfo?.contactInfo?.mapLink ?? ""}
                    target="_blank"
                    className="not-italic hover:underline md:text-3xl"
                  >
                    {contactInfo?.contactInfo?.address?.street}{" "}
                    {contactInfo?.contactInfo?.address?.city}
                    {contactInfo?.contactInfo?.address?.state}
                    {contactInfo?.contactInfo?.address?.zip}
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
                    target="_blank"
                    href={`mailto:${contactInfo?.contactInfo?.email}`}
                    className="not-italic hover:underline md:text-3xl"
                  >
                    {contactInfo?.contactInfo?.email}
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
                    target="_blank"
                    href={`tel:${contactInfo?.contactInfo?.phone}`}
                    className="not-italic hover:underline md:text-3xl"
                  >
                    {contactInfo?.contactInfo?.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-white py-14 text-black md:py-28">
        <div className="container flex flex-col gap-16 md:grid md:grid-cols-2">
          <div className="flex flex-col gap-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-medium">{contactInfo?.brandName}</h2>
              <address className="not-italic">
                {contactInfo?.contactInfo?.address?.street}
                {contactInfo?.contactInfo?.address?.city}
                {contactInfo?.contactInfo?.address?.state}
                {contactInfo?.contactInfo?.address?.zip}
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
                    </div>
                  );
                })}
              </div>
            </div>
            <Button
              asChild
              className="rounded-none border border-primary transition-all duration-300 hover:bg-transparent hover:text-primary"
            >
              <a
                href={contactInfo?.contactInfo?.mapLink ?? ""}
                target="_blank"
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
      </section>
    </>
  );
}
