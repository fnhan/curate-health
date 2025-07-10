import Image from "next/image";
import Link from "next/link";

import { PortableText } from "@portabletext/react";
import { ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
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

  const conditions = [
    {
      title: "Cardiovascular Health",
    },
    {
      title: "Mental & Cognitive Health",
    },
    {
      title: "Population Specific Benefits",
    },
    {
      title: "Cardiovascular Health",
    },
    {
      title: "Mental & Cognitive Health",
    },
    {
      title: "Population Specific Benefits",
    },
    {
      title: "Cardiovascular Health",
    },
    {
      title: "Mental & Cognitive Health",
    },
    {
      title: "Population Specific Benefits",
    },
    {
      title: "Cardiovascular Health",
    },
    {
      title: "Mental & Cognitive Health",
    },
    {
      title: "Population Specific Benefits",
    },
  ];

  const additionalBenefits = [
    {
      title: "Sustain Energy Naturally",
    },
    {
      title: "Sleep Deeply, Wake Rested",
    },
    {
      title: "Sharpen Focus & Balance Mood",
    },
    {
      title: "Sustain Energy Naturally",
    },
    {
      title: "Sleep Deeply, Wake Rested",
    },
    {
      title: "Sharpen Focus & Balance Mood",
    },
    {
      title: "Sharpen Focus & Balance Mood",
    },
    {
      title: "Sharpen Focus & Balance Mood",
    },
  ];
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

      <section className="py-16 md:py-24">
        [BG Image]
        <div className="container">
          <h2 className="text-xl md:text-4xl 2xl:text-5xl">What is a Lifestyle Medicine</h2>
          <p className="text-lg  max-w-2xl leading-relaxed mt-12">
            Lifestyle Medicine is the art and science of healing through the choices we make each day. Rooted in decades of rigorous research, it recognizes that the foundation of lasting health lies in how we nourish, move, rest, connect, and find meaning in our lives.
          </p>
          <p className="text-lg  max-w-2xl leading-relaxed mt-12">
            At Curate Health, we take a thoughtful, whole-person approach—using personalized, evidence-based strategies in nutrition, movement, sleep, stress care, social connection and avoidance of    harmful substances to gently restore balance and vitality. Through personalized guidance, clinical expertise, and a deeply supportive environment, we help you reconnect with your body’s innate ability to heal and thrive.
          </p>
        </div>
      </section >

      <section className="bg-white py-16 text-primary md:py-24">
        <div className="container flex justify-center flex-col items-center gap-12">
          <h2 className="text-xl md:text-4xl 2xl:text-5xl">
            Conditions We Address
          </h2>
          <div className="grid grid-cols-3 gap-y-6 gap-x-8 w-full">
            {conditions.map((condition) => {
              return (
                <div className="border border-primary flex items-center py-3 justify-center text-center">
                  <h3 className="text-lg xl:text-xl">
                    {condition.title}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-platinum py-16 space-y-12 text-primary md:py-24">
        <div className="flex flex-col justify-center items-center gap-y-10">
          <h2 className="text-xl md:text-4xl 2xl:text-5xl">
            The Pillars of Lifestyle Medicine
          </h2>
          <div className="h-24 border-l border-primary">
            &nbsp;
          </div>
          <p className="text-lg max-w-2xl leading-relaxed text-center">
            Evidence-based strategies for preventing, treating, and even reversing chronic diseases through sustainable lifestyle changes.
          </p>
        </div>
        <div className="flex flex-row gap-6">
          <div className="flex-1 flex justify-end items-center">
            <div className="size-96 bg-gray-200">
            </div>
          </div>
          <div className="flex-1 p-12">
            <h3 className="text-xl md:text-2xl 2xl:text-3xl">Balanced Nutrition</h3>
            <p className="mt-12">
              Nourish your body with intention. At the heart of vibrant health is a relationship with food that is joyful, balanced, and deeply supportive. Our approach centers on whole, nutrient-rich foods—colourful fruits and vegetables, healthful proteins, whole grains, and healthful fats—chosen not through restriction, but through care.
            </p>
            <p className="mt-12">
              These mindful choices replenish energy, reduce inflammation, and help protect against chronic conditions such as cardiovascular disease and metabolic dysfunction. With personalized guidance, we help you reconnect with the innate wisdom of eating well—fueling vitality from within.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 text-primary md:py-24 flex justify-center items-center">
        <div className="flex flex-row w-full max-w-5xl">
          <div className="flex-1">
            <h2 className="text-xl md:text-4xl 2xl:text-5xl">
              What Makes Our Program Unique?
            </h2>
            <ul className="list-disc list-inside mt-12">
              <li>
                Overseen by a team of healthcare professionals, including doctors, therapists, and nutrition experts—so it’s both safe and effective.
              </li>
              <li>
                Receive expert care from Canada’s only clinic with a doctor triple-certified in Internal Medicine, Gastroenterology/Hepatology, and Lifestyle Medicine.
              </li>
              <li>
                Covered by OHIP and most health benefit programs
              </li>
              <li>
                Flexible to participate in-person or online, although we do encourage in-person
              </li>
              <li>
                Participate in small intimate group sessions (6-15 people) to learn, ask our doctors questions, and interact with program peers.
              </li>
              <li>
                Canada's only interdisciplinary approach to Lifestyle Medicine, with a core MD/ND team.
              </li>
            </ul>
          </div>

          <div className="flex-1">
            <div className="size-96 bg-gray-200">
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 text-primary md:py-24">
        <div className="container flex flex-col gap-y-12">
          <h2 className="text-xl md:text-4xl 2xl:text-5xl text-center">
            Additional Benefits
          </h2>
          <div className="grid grid-cols-3 gap-1 w-full max-w-2xl mx-auto">
            {additionalBenefits.map((benefit) => {
              return (
                <div className="flex bg-gray-200 w-full min-h-80 p-6 items-end">
                  <h3 className="text-lg xl:text-xl">
                    {benefit.title}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-platinum">
        <div className="container flex flex-col items-center gap-7 py-14 md:gap-16 md:py-16 2xl:gap-20 2xl:py-24">
          {/* <Image
            src={"/images/curate-lifestyle/curate-lifestyle-quote.png"}
            alt={"Curate Lifestyle Quote"}
            width={160}
            height={134}
            className="size-16 object-contain md:size-20 2xl:size-40"
          /> */}
          [Quote Image]
          <p className="max-w-[80ch] text-balance text-center text-xl font-light italic text-primary md:text-3xl 2xl:max-w-5xl 2xl:text-4xl">
            Canada’s only Lifestyle Medicine clinic with a triple-certified Gastroenterologist, Internal Medicine and Lifestyle Medicine Doctor — reversing disease from the inside out.
          </p>
        </div>
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
      </section>
      <section className={`relative h-full md:h-[calc(100vh-100px)]`}>
        [CTA Image]
        {/* <Image
          loading="lazy"
          src={ctaSection?.ctaSectionImage?.image || ""}
          alt={ctaSection?.ctaSectionImage?.alt || ""}
          width={1440}
          height={1040}
          className="h-full w-full object-cover"
        /> */}
        <div className="absolute inset-0 mx-auto flex max-w-xs flex-col items-center justify-center md:max-w-xl 2xl:max-w-7xl">
          <div className="flex flex-col gap-8 bg-secondary p-8 text-white md:items-center md:justify-center md:gap-12 md:p-16">
            <div className="space-y-4 px-4">
              <h6 className="text-balance text-lg capitalize md:text-center md:text-3xl 2xl:text-4xl">
                Be Among the First to Experience Lifestyle Medicine at Curate Health
              </h6>
              <p className="max-w-[80ch] text-pretty text-sm font-light md:text-center md:text-base">
                We’re launching June 14th 2025, with discounted spots for the first 12 participants. You’ll be contacted by our team for intake once enrollment opens.
              </p>
            </div>
            <Button
              asChild
              className="mx-auto w-fit rounded-none border border-white bg-white text-primary hover:bg-transparent hover:text-white"
            >
              <a target="_blank" href="">
                Join the Waitlist
              </a>
            </Button>
            <p>
              Want to refer a patient? Click Here
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
