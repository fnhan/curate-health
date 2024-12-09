import Image from "next/image";

import { Button } from "@/components/ui/button";

type CTAButton = {
  buttonText: string | null;
  buttonLink: string | null;
};

type CTAImage = {
  image: string | null;
  alt: string | null;
};

interface CTASectionProps {
  ctaSection: {
    ctaSectionImage: CTAImage | null;
    ctaSectionTitle: string | null;
    ctaSectionParagraph: string | null;
    ctaButton: CTAButton | null;
  };
}

export default function CTASection({ ctaSection }: CTASectionProps) {
  if (!ctaSection) return null;

  const { ctaSectionImage, ctaSectionTitle, ctaSectionParagraph, ctaButton } =
    ctaSection;

  return (
    <section className="relative h-full md:h-[calc(100vh-100px)]">
      <Image
        loading="lazy"
        src={ctaSectionImage?.image || ""}
        alt={ctaSectionImage?.alt || ""}
        width={1440}
        height={1040}
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 mx-auto flex max-w-xs flex-col items-center justify-center md:max-w-xl 2xl:max-w-7xl">
        <div className="flex flex-col gap-8 bg-secondary p-8 text-white md:items-center md:justify-center md:gap-12 md:p-16">
          <div className="space-y-4 px-4">
            <h6 className="text-balance text-lg capitalize md:text-center md:text-3xl 2xl:text-4xl">
              {ctaSectionTitle}
            </h6>
            <p className="max-w-[80ch] text-pretty text-sm font-light md:text-center md:text-base">
              {ctaSectionParagraph}
            </p>
          </div>
          <Button
            asChild
            className="mx-auto w-fit rounded-none border border-white bg-white text-primary hover:bg-transparent hover:text-white"
          >
            <a target="_blank" href={ctaButton?.buttonLink!}>
              {ctaButton?.buttonText}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
