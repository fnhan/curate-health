import Image from "next/image";
import { useEffect } from "react";

import imageUrlBuilder from "@sanity/image-url";
import { Mail, MapPin, MessageSquareShare, Phone } from "lucide-react";

import { dataset, projectId } from "../../../sanity/env";

const builder = imageUrlBuilder({ projectId, dataset });

export default function ContactInfo({ contactInfo, feedbackLink }) {
  const {
    streetAddress,
    postalAddress,
    emailAddress,
    phoneNumber,
    contactInfoImage,
    hrefDirections,
  } = contactInfo;

  const { youformId, linkText } = feedbackLink;

  useEffect(() => {
    // Load the YouForm script dynamically if it's not already loaded
    const script = document.createElement("script");
    script.src = "https://embed.youform.com/js/youform.js"; // Add the correct YouForm script URL here
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const phNumDestructured = phoneNumber.toString().replace(/[^+\d]+/g, "");

  return (
    <>
      <section className="relative h-[524px] bg-white md:h-[960px]">
        <Image
          priority={true}
          width={1440}
          height={936}
          alt={`${contactInfoImage.alt}`}
          src={builder.image(contactInfoImage).width(1440).height(936).url()}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center pt-12">
          <div className="container flex flex-col gap-2 pb-12 pt-8 md:gap-4 md:py-16">
            <div className="flex justify-start">
              <h1 className="mb-6 text-[28px] md:text-[50px] lg:text-[72px]">
                Contact Information
              </h1>
            </div>
            <address>
              {/* Location Section */}
              <div className="flex gap-3">
                <MapPin className="h-[18px] w-[18px] md:h-[24px] md:w-[24px]" />
                <h2 className="pt-0.5 text-[10px] not-italic md:text-[14px] lg:-mt-0.5 lg:pt-0 lg:text-[18px]">
                  Location
                </h2>
              </div>
              <div className="pb-0">
                <a
                  className="block cursor-pointer pl-8 pr-10 text-[14px] not-italic md:inline md:pl-9 md:pr-0 md:text-[28px] lg:text-[32px]"
                  target="_blank"
                  href={hrefDirections}
                >
                  {streetAddress}
                </a>
              </div>
              <div className="pb-4 indent-8 md:indent-9">
                <a
                  className="text-[14px] not-italic md:text-[28px] lg:text-[32px]"
                  target="_blank"
                  href={hrefDirections}
                >
                  {postalAddress}
                </a>
              </div>

              {/* Email Section */}
              <div className="flex gap-3">
                <Mail className="h-[18px] w-[18px] md:h-[24px] md:w-[24px]" />
                <h3 className="pt-0.5 text-[10px] not-italic md:text-[14px] lg:-mt-0.5 lg:pt-0 lg:text-[18px]">
                  Email
                </h3>
              </div>
              <div className="pb-4 indent-8 md:indent-9">
                <a
                  className="text-[14px] not-italic md:text-[28px] lg:text-[32px]"
                  target="_blank"
                  href={"mailto:" + emailAddress}
                >
                  {emailAddress}
                </a>
              </div>

              {/* Phone Section */}
              <div className="flex gap-3">
                <Phone className="h-[18px] w-[18px] md:h-[24px] md:w-[24px]" />
                <h4 className="pt-0.5 text-[10px] not-italic md:text-[14px] lg:-mt-0.5 lg:pt-0 lg:text-[18px]">
                  Phone
                </h4>
              </div>
              <div className="pb-4 indent-8 md:indent-9">
                <a
                  className="text-[14px] not-italic md:text-[28px] lg:text-[32px]"
                  target="_blank"
                  href={"tel:" + phNumDestructured}
                >
                  {phoneNumber}
                </a>
              </div>

              {/* Feedback Section */}
              <div className="flex gap-3">
                <MessageSquareShare className="h-[18px] w-[18px] md:h-[24px] md:w-[24px]" />
                <h4 className="pt-0.5 text-[10px] not-italic md:text-[14px] lg:-mt-0.5 lg:pt-0 lg:text-[18px]">
                  Feedback
                </h4>
              </div>
              <div className="pb-4">
                <a
                  className="block cursor-pointer pl-8 pr-10 text-[14px] not-italic md:inline md:pl-9 md:pr-0 md:text-[28px] lg:text-[32px]"
                  data-youform-open={youformId}
                  data-youform-position="center"
                >
                  {linkText}
                </a>
              </div>
            </address>
          </div>
        </div>
      </section>
    </>
  );
}
