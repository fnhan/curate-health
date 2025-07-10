import Image from "next/image";
import Link from "next/link";

import { PortableText } from "@portabletext/react";
import { ArrowRightIcon } from "lucide-react";

import { cleanSlug } from "@/lib/utils";
import { SERVICE_BY_SLUG_QUERYResult } from "@/sanity.types";

interface Treatment {
  _id: string;
  title: string;
  slug: string;
}

export default function ServiceLifestyleContent({
  service,
}: {
  service: SERVICE_BY_SLUG_QUERYResult;
}) {
  if (!service) {
    return null;
  }

  const { title, content, content_image, content_alt, slug } = service;
  const treatments = service.treatments as Treatment[];

  return (
    <>
      <section className="bg-white py-16 text-primary md:py-24">
        <div className="container flex flex-col gap-12 md:grid md:grid-cols-2 md:items-center">
          <div className="flex flex-col gap-8">
            <div className="space-y-4 md:space-y-6 2xl:space-y-8">
              <h1 className="text-xl md:text-4xl 2xl:text-6xl">{title}</h1>
              <div className="max-w-[80ch] text-pretty font-light">
                <PortableText value={content!} />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {treatments.map((treatment) => {
                return (
                  <Link
                    className="flex w-fit items-center gap-2 italic hover:underline"
                    key={treatment._id}
                    // * Clean slug is used when sanity preview mode is enabled
                    href={`/services/${cleanSlug(slug!)}/${cleanSlug(treatment.slug!)}`}
                  >
                    {treatment.title}
                    <ArrowRightIcon size={16} />
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <Image
              className="size-[256px] rounded-full object-cover md:size-[320px] 2xl:size-[545px]"
              width={545}
              height={545}
              src={content_image!}
              alt={content_alt!}
            />
          </div>
          <div className="col-span-2 border-l border-l-2 border-primary h-24"></div>
          <div className="col-span-2">
            <h2 className="text-xl md:text-4xl 2xl:text-6xl">Lifestyle Medicine</h2>
            <p className="text-lg md:text-2xl 2xl:text-4xl font-light mt-12 max-w-2xl leading-relaxed">
              A thoughtful, scientifically proven path toward long-term vitality, where small, sustainable shifts yield profound results.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 text-primary md:py-24">
        What is a Lifestyle Medicine
      </section>

      <section className="bg-white py-16 text-primary md:py-24">
        Conditions We Address
      </section>

      <section className="bg-white py-16 text-primary md:py-24">
        The Pillars of Lifestyle Medicine
      </section>

      <section className="bg-white py-16 text-primary md:py-24">
        What Makes Our Program Unique?
      </section>

      <section className="bg-white py-16 text-primary md:py-24">
        Additional Benefits
      </section>

      <section className="bg-white py-16 text-primary md:py-24">
        Canada’s only Lifestyle Medicine clinic with a triple-certified Gastroenterologist, Internal Medicine and Lifestyle Medicine Doctor — reversing disease from the inside out.
      </section>

      <section className="bg-white py-16 text-primary md:py-24">
        Meet Your Team
      </section>

      <section className="bg-white py-16 text-primary md:py-24">
        How to Join
      </section>

      <section className="bg-white py-16 text-primary md:py-24">
        Program Timeline
      </section>

      <section className="bg-white py-16 text-primary md:py-24">
        Frequently Asked Questions
      </section>

      <section className="bg-white py-16 text-primary md:py-24">
        Doctor Testimonials
      </section>

      <section className="bg-white py-16 text-primary md:py-24">
        Be Among the First to Experience Lifestyle Medicine at Curate Health
      </section>
    </>
  );
}
