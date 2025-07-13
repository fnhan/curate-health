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
    <h1 className={cn("text-xl md:text-4xl 2xl:text-6xl", className)}>{children}</h1>
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
    block_7_image,
    block_9_image,
    block_11_image,
    faq,
  } = service;

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
  ];

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
          <div className="flex flex-col gap-y-10 relative z-10 max-w-2xl">
            <SubHeading>
              {block_2_title}
            </SubHeading>
            <div className="text-pretty font-light">
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
          <div className="grid grid-cols-3 gap-y-6 gap-x-8 w-full">
            {block_3_content?.map((condition) => {
              return (
                <div key={condition.title} className="border border-primary flex items-center py-3 justify-center text-center">
                  <h3 className="text-lg xl:text-xl">
                    {condition.title}
                  </h3>
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
        <div className="flex flex-row gap-6">
          <div className="flex-1 flex justify-end items-center">
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
        <div className="absolute inset-0 pointer-events-none z-0" style={{ transform: 'scaleX(-1) translate(0, -15%)', backgroundImage: `url(${block_5_image!})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', opacity: 1 }}></div>
        <div className="container flex flex-row items-center justify-center w-full relative z-20">
          <div className="flex-1 flex justify-end">
            <div className="max-w-xl">
              <SubHeading>
                What Makes Our Program Unique?
              </SubHeading>
              <ul className="list-disc list-inside mt-12 pr-8">
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
          <div className="grid grid-cols-3 gap-1 w-full mx-auto px-12">
            {additionalBenefits.map((benefit) => {
              return (
                <div key={benefit.title} className="flex bg-gray-600 w-full min-h-80 p-6 items-end">
                  <h3 className="text-lg xl:text-3xl text-white">
                    {benefit.title}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-platinum text-primary py-16 md:py-24">
        <div className="container flex flex-col items-center gap-4 md:gap-8 md:py-8">
          <Image
            src={block_7_image!}
            alt={"Curate Lifestyle Quote"}
            width={160}
            height={134}
            className="size-16 object-contain md:size-20 2xl:size-40"
          />
          <LargeText className="text-center italic max-w-2xl">
            Canada’s only Lifestyle Medicine clinic with a triple-certified Gastroenterologist, Internal Medicine and Lifestyle Medicine Doctor — reversing disease from the inside out.
          </LargeText>
        </div>
      </section>

      <section className="bg-white text-primary py-16 md:py-24">
        <div className="container flex flex-col items-center gap-y-10">
          <div className="grid grid-cols-1 gap-4 py-20 md:grid-cols-2 lg:grid-cols-3">
            <SubHeading className="md:col-span-2 lg:col-span-3 pb-6">
              Meet Your Team
            </SubHeading>
            {teamMembers?.map((teamMember) => (
              <Card key={teamMember.name} className="flex flex-col rounded-none">
                <div className="h-[300px]">
                  {/* <Image
                  className="h-full w-full object-cover"
                  src={teamMember.image?.asset?.url ?? ""}
                  alt={teamMember.name ?? ""}
                  width={400}
                  height={400}
                /> */}
                  <div className="size-96 bg-gray-200"></div>
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
                <CardContent>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="item-1" className="border-none">
                      <AccordionTrigger>Learn More</AccordionTrigger>
                      <AccordionContent>
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
        <div className="container flex flex-row gap-x-12 items-end">
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
                  3. We’ll Take it From There
                </h3>
                <p>
                  Once received, our team will review your referral and contact you to ask screening questions and to schedule your initial consultation if this program is the right fit for you!                </p>
              </div>
              <div className="flex flex-col gap-y-6">
                <p>
                  No referral yet? Let us know—our team can help guide you through options on joining the program without a doctor's referral.
                </p>

                <p>
                  Questions? We’re here to support you. Feel free to reach out to our front desk for assistance at 416-900-3311 or hello@curatehealth.ca.
                </p>
              </div>
            </div>
          </div>
        </div>

      </section>

      <section className="bg-platinum py-16 text-primary md:py-24">
        <div className="container flex flex-col items-center gap-y-10">
          <Heading>
            Program Timeline
          </Heading>
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
                <AccordionItem value={`item-${index}`} className="border-b-2 border-b-gray-500">
                  <AccordionTrigger className="py-6">
                    <h4 className="text-lg 2xl:text-xl font-light italic">
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
      </section>

      <section
        className={`relative h-full md:h-[calc(100vh-100px)] bg-cover bg-center bg-no-repeat`}
        style={{
          backgroundImage: `url(${block_11_image})`
        }}
      >
        <div className="absolute inset-0 mx-auto flex max-w-xs flex-col items-center justify-center md:max-w-xl 2xl:max-w-7xl">
          <div className="flex flex-col gap-8 bg-secondary p-8 text-white md:items-center md:justify-center md:gap-12 md:p-16">
            <div className="space-y-4 px-4">
              <LargeText className="text-light max-w-lg text-center mx-auto">
                Be Among the First to Experience Lifestyle Medicine at Curate Health
              </LargeText>
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
