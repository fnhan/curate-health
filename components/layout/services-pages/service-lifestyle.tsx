import Image from "next/image";
import Link from "next/link";

import { PortableText, PortableTextBlock } from "@portabletext/react";
import { ArrowRightIcon } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cleanSlug, cn } from "@/lib/utils";
import { SERVICE_LIFESTYLE_BY_SLUG_QUERYResult } from "@/sanity.types";


interface Treatment {
  _id: string;
  title: string;
  slug: string;
}

const Heading = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <h1 className={cn("text-xl md:text-5xl 2xl:text-6xl", className)}>{children}</h1>
  );
};


const SubHeading = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <h2 className={cn("text-2xl md:font-light md:text-3xl 2xl:text-4xl", className)}>
      {children}
    </h2>
  );
};

const LargeText = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <p className={cn("text-lg md:text-2xl 2xl:text-4xl 2xl:leading-[1.5em] font-light", className)}>
      {children}
    </p>
  );
};


export default function ServiceLifestyleContent({
  service,
}: {
  service: SERVICE_LIFESTYLE_BY_SLUG_QUERYResult;
}) {
  if (!service) {
    return null;
  }

  const {
    title,
    content,
    content_image,
    content_alt,
    slug,
    hero_secondary_title,
    hero_large_text,
    block_2_title,
    block_2_content,
    block_2_image,
    block_3_title,
    block_3_content,
    block_4_image,
    block_5_image,
    benefits,
    block_7_image,
    block_9_image,
    timeline,
    block_11_image,
    faq,
  } = service;

  const treatments = service.treatments as Treatment[];

  const teamMembers: Array<{
    name: string;
    role: PortableTextBlock;
    bio: PortableTextBlock;
    image?: {
      asset: {
        url: string;
      };
    }
  }> = [
      {
        name: "Dr. John Doe",
        role: {
          _type: "block",
          children: [{ _type: "span", text: "Doctor" }],
        },
        bio: {
          _type: "block",
          children: [{ _type: "span", text: "Dr. John Doe is a doctor with a passion for lifestyle medicine." }],
        },
      },
      {
        name: "Dr. John Doe 2",
        role: {
          _type: "block",
          children: [{ _type: "span", text: "Doctor" }],
        },
        bio: {
          _type: "block",
          children: [{ _type: "span", text: "Dr. John Doe is a doctor with a passion for lifestyle medicine." }],
        },
      },
      {
        name: "Dr. John Doe 3",
        role: {
          _type: "block",
          children: [{ _type: "span", text: "Doctor" }],
        },
        bio: {
          _type: "block",
          children: [{ _type: "span", text: "Dr. John Doe is a doctor with a passion for lifestyle medicine." }],
        },
      },
    ];
  return (
    <>
      <section className="bg-white py-16 text-primary md:py-24">
        <div className="container flex flex-col gap-12 md:grid md:grid-cols-2 md:items-center">
          <div className="flex flex-col gap-8">
            <div className="space-y-4 md:space-y-6 2xl:space-y-8">
              <Heading>{title}</Heading>
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
          <div className="col-span-2 border-l border-l-2 border-primary h-32"></div>
          <div className="col-span-2 pt-12">
            <h1 className="text-xl md:text-4xl 2xl:text-6xl">
              {hero_secondary_title}
            </h1>
            <LargeText className="max-w-2xl mt-12">
              {hero_large_text}
            </LargeText>
          </div>
        </div>
      </section>

      <section
        className="py-16 md:py-24 relative bg-cover bg-center bg-no-repeat text-primary"
        style={{
          backgroundImage: `url(${block_2_image?.asset?.url})`
        }}
      >
        <div className="container">
          <div className="flex flex-col gap-y-10 relative z-10 max-w-xl">
            <SubHeading>
              {block_2_title}
            </SubHeading>
            <div className="text-pretty font-light max-w-xl">
              <PortableText value={block_2_content!} />
            </div>
          </div>
        </div>
      </section >

      <section className="bg-white py-16 text-primary md:py-40">
        <div className="container flex justify-center flex-col items-center gap-12">
          <SubHeading>
            {block_3_title}
          </SubHeading>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8 w-full">
            {block_3_content?.map((condition) => {
              return (
                <div key={condition.title} className="border border-primary flex flex-col items-center py-3 group relative">
                  <h3 className="text-lg xl:text-xl text-center">
                    {condition.title}
                  </h3>
                  <div className="absolute top-full -left-[1px] -right-[1px] bg-white border border-primary border-t-0 z-10 opacity-0 invisible transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:visible">
                    <div className="text-pretty font-light w-full px-2 prose">
                      <PortableText value={condition.description!} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-platinum py-16 space-y-12 text-primary md:py-32">
        <div className="container flex flex-col justify-center items-center gap-y-10">
          <Heading className="text-center max-w-xl">
            The Pillars of Lifestyle Medicine
          </Heading>
          <div className="h-24 border-l border-primary">
            &nbsp;
          </div>
          <LargeText className="text-center italic max-w-3xl">
            Evidence-based strategies for preventing, treating, and even reversing chronic diseases through sustainable lifestyle changes.
          </LargeText>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex justify-end items-center px-6 md:p-0">
            <Image
              src={block_4_image!}
              alt=""
              width={545}
              height={545}
              className="size-96 object-contain"
            />
          </div>
          <div className="flex-1 p-12">
            <SubHeading>
              Balanced Nutrition
            </SubHeading>
            <p className="mt-12 max-w-md">
              Nourish your body with intention. At the heart of vibrant health is a relationship with food that is joyful, balanced, and deeply supportive. Our approach centers on whole, nutrient-rich foods—colourful fruits and vegetables, healthful proteins, whole grains, and healthful fats—chosen not through restriction, but through care.
            </p>
            <p className="mt-12 max-w-md">
              These mindful choices replenish energy, reduce inflammation, and help protect against chronic conditions such as cardiovascular disease and metabolic dysfunction. With personalized guidance, we help you reconnect with the innate wisdom of eating well—fueling vitality from within.
            </p>
          </div>
        </div>
      </section>

      <section
        className="bg-white py-24 text-primary md:py-40 flex justify-center items-center relative bg-cover bg-center bg-no-repeat overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none z-0 hidden md:block" style={{ transform: 'scaleX(-1) translate(0, -15%)', backgroundImage: `url(${block_5_image!})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', opacity: 1 }}></div>
        <div className="container flex flex-col md:flex-row items-center justify-center w-full relative z-20">
          <div className="flex-1 flex justify-end">
            <div className="max-w-xl">
              <SubHeading>
                What Makes Our Program Unique?
              </SubHeading>
              <ul className="list-disc ml-4 mt-10 pr-8 leading-7 text-pretty font-light">
                <li>
                  Overseen by a team of healthcare professionals, including doctors, therapists, and nutrition experts—so it’s both safe and effective.
                </li>
                <li>
                  Receive expert care from Canada&apos;s only clinic with a doctor triple-certified in Internal Medicine, Gastroenterology/Hepatology, and Lifestyle Medicine.
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
          </div>
          <div className="flex-1">
          </div>
        </div>
      </section>

      <section className="bg-white py-16 text-primary md:py-24">
        <div className="container flex flex-col gap-y-14">
          <SubHeading className="text-center">
            Additional Benefits
          </SubHeading>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 w-full mx-auto md:px-12">
            {benefits?.map((benefit) => {
              return (
                <div
                  key={benefit.title}
                  className="flex flex-col gap-y-4 w-full min-h-80 p-6 justify-end relative overflow-hidden group cursor-pointer transition-all duration-300"
                  style={{
                    backgroundImage: benefit.image ? `url(${benefit.image})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-50 transition-all duration-300 group-hover:bg-opacity-70"></div>
                  <div className="relative z-10">
                    <h3 className="text-lg xl:text-3xl text-white">
                      {benefit.title}
                    </h3>
                    <div className="text-white text-pretty font-light max-h-0 overflow-hidden transition-all duration-300 group-hover:max-h-96">
                      <PortableText value={benefit.description!} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-platinum text-primary py-16 md:py-24">
        <div className="container flex flex-col items-center gap-4 md:gap-8 md:py-8">
          <div className="size-20 md:size-32">
            <Image
              src={block_7_image!}
              alt={"Curate Lifestyle Quote"}
              width={0}
              height={0}
              sizes="100vw"
              className="object-cover w-full h-auto"
            />
          </div>
          <LargeText className="text-center italic max-w-2xl">
            Canada&apos;s only Lifestyle Medicine clinic with a triple-certified Gastroenterologist, Internal Medicine and Lifestyle Medicine Doctor — reversing disease from the inside out.
          </LargeText>
        </div>
      </section>

      <section className="bg-white text-primary py-16 md:py-24">
        <div className="container flex flex-col items-center gap-y-10">
          <div className="grid grid-cols-1 gap-4 py-20 md:grid-cols-2 lg:grid-cols-3 w-full">
            <SubHeading className="md:col-span-2 lg:col-span-3 pb-6">
              Meet Your Team
            </SubHeading>
            {teamMembers?.map((teamMember) => (
              <Card key={teamMember.name} className="flex flex-col rounded-none h-full">
                <div className="h-[300px]">
                  {/* <Image
                  className="h-full w-full object-cover"
                  src={teamMember.image?.asset?.url ?? ""}
                  alt={teamMember.name ?? ""}
                  width={400}
                  height={400}
                /> */}
                </div>
                <CardHeader className="flex-1">
                  <CardTitle className="font-light not-italic">
                    {teamMember.name}
                  </CardTitle>
                  <CardDescription>
                    <div className="prose text-sm [&_li]:my-0 [&_li]:p-0 [&_ul]:m-0 [&_ul]:list-none [&_ul]:p-0">
                      <PortableText value={teamMember.role!} />
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="item-1" className="border-none">
                      <AccordionTrigger>Learn More</AccordionTrigger>
                      <AccordionContent className="absolute top-[calc(100%-10px)] -left-[1px] -right-[1px] z-10 bg-white border border-t-0 border-gray-200 shadow-lg px-4 pb-4">
                        <div className="prose">
                          <PortableText value={teamMember.bio!} />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white text-primary">
        <div className="container flex flex-col md:flex-row gap-x-12 items-end">
          <div className="flex-1">
            <Image
              src={block_9_image!}
              alt={"How to Join"}
              width={0}
              height={0}
              sizes="100vw"
              className="object-cover w-full h-auto"
            />
          </div>
          <div className="flex flex-col gap-y-8 flex-1 pb-24">
            <Heading>
              How to Join
            </Heading>
            <div className="flex flex-col gap-y-12 mt-8 max-w-lg">
              <div className="flex flex-col gap-y-6">
                <h3 className="text-xl md:text-2xl 2xl:text-3xl">
                  1. Speak with Your Physician
                </h3>
                <p>
                  Ask your family doctor or any medical doctor on your care team for a referral to our Curate Lifestyle Program. Your doctor can use our [Referral Form] for convenience.
                </p>
              </div>
              <div className="flex flex-col gap-y-6">
                <h3 className="text-xl md:text-2xl 2xl:text-3xl">
                  2. Send the Referral
                </h3>
                <p>
                  Have the referral faxed directly to us at 416-900-3311.
                </p>
              </div>
              <div className="flex flex-col gap-y-6">
                <h3 className="text-xl md:text-2xl 2xl:text-3xl">
                  3. We&apos;ll Take it From There
                </h3>
                <p>
                  Once received, our team will review your referral and contact you to ask screening questions and to schedule your initial consultation if this program is the right fit for you!                </p>
              </div>
              <div className="flex flex-col gap-y-6">
                <p>
                  No referral yet? Let us know—our team can help guide you through options on joining the program without a doctor's referral.
                </p>

                <p>
                  Questions? We&apos;re here to support you. Feel free to reach out to our front desk for assistance at 416-900-3311 or hello@curatehealth.ca.
                </p>
              </div>
            </div>
          </div>
        </div>

      </section>

      <section className="bg-platinum py-16 text-primary md:py-24 lg:py-32">
        <div className="container flex flex-col items-center gap-y-20">
          <Heading className="font-light">
            Program Timeline
          </Heading>
          <div className="grid grid-cols-1 gap-x-4 gap-y-20 md:grid-cols-2 lg:grid-cols-3 w-full text-center lg:px-12">
            {timeline?.map((timeline_item) => {
              return (
                <div className="flex flex-col gap-y-1 items-center max-w-sm mx-auto" key={timeline_item.title}>
                  <div className="size-40 bg-white rounded-full mb-4 border border-[#878E76]"></div>
                  <h3 className="text-lg font-light italic text-pretty">
                    {timeline_item.title}
                  </h3>
                  <div className="text-pretty font-light text-base">
                    <PortableText value={timeline_item.description!} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 text-primary md:py-24">
        <div className="container mx-auto space-y-12 2xl:px-12">
          <SubHeading>
            Frequently Asked Questions
          </SubHeading>
          <Accordion type="multiple">
            {faq?.map((faq, index) => {
              return (
                <AccordionItem value={`item-${index}`} className="border-b-2 border-b-gray-500" key={faq.title}>
                  <AccordionTrigger className="py-6">
                    <h4 className="text-lg xl:text-xl text-left font-light italic">
                      {faq.title}
                    </h4>
                  </AccordionTrigger>
                  <AccordionContent className="prose">
                    <PortableText value={faq.description!} />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </section>
      {/* 
      <section className="bg-white py-16 text-primary md:py-32">
        <div className="container mx-auto space-y-12">
          <SubHeading className="text-center">
            Doctor Testimonials
          </SubHeading>
          <div className="grid grid-cols-3 gap-4 max-w-screen-xl mx-auto mt-12">
            <div className="flex flex-col items-center gap-y-6">
              <div className="size-64 bg-gray-200 rounded-full"></div>
              <p className="text-center max-w-72">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
              </p>
            </div>
            <div className="flex flex-col items-center gap-y-6">
              <div className="size-64 bg-gray-200 rounded-full"></div>
              <p className="text-center max-w-72">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
              </p>
            </div>
            <div className="flex flex-col items-center gap-y-6">
              <div className="size-64 bg-gray-200 rounded-full"></div>
              <p className="text-center max-w-72">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
              </p>
            </div>
          </div>
        </div>
      </section> */}

      <section
        className={`relative min-h-screen bg-cover bg-center bg-no-repeat py-8 md:h-[calc(100vh-100px)] md:py-0`}
        style={{
          backgroundImage: `url(${block_11_image})`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-xs md:max-w-xl 2xl:max-w-7xl">
            <div className="flex flex-col gap-6 bg-secondary p-6 text-white md:items-center md:justify-center md:gap-12 md:p-16">
              <div className="space-y-4 md:px-4">
                <LargeText className="text-light max-w-lg text-center mx-auto text-base md:text-lg lg:text-2xl">
                  Be Among the First to Experience Lifestyle Medicine at Curate Health
                </LargeText>
                <p className="max-w-[80ch] text-pretty text-sm font-light text-center md:text-base">
                  We’re launching June 14th 2025, with discounted spots for the first 12 participants. You’ll be contacted by our team for intake once enrollment opens.
                </p>
              </div>
              <Button
                asChild
                className="mx-auto w-full max-w-xs rounded-none border border-white bg-white text-primary hover:bg-transparent hover:text-white md:w-fit"
              >
                <a target="_blank" href="">
                  Join the Waitlist
                </a>
              </Button>
              <p className="text-center text-sm md:text-base">
                Want to refer a patient? Click Here
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
