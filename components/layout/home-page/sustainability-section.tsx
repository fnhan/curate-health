import Image from "next/image";

import { PortableText } from "@portabletext/react";

import { SUSTAINABILITY_SECTION_QUERYResult } from "@/sanity.types";

export default function SustainabilitySection({
  sustainabilitySection,
}: {
  sustainabilitySection: SUSTAINABILITY_SECTION_QUERYResult;
}) {
  if (!sustainabilitySection) {
    return null;
  }

  const { bgImage, sustainText } = sustainabilitySection;

  const altText = bgImage?.alt;

  return (
    <section>
      <Image
        width={1080}
        height={1440}
        src={bgImage?.asset?.url!}
        alt={altText!}
        className="max-h-[435px] w-full object-cover md:max-h-[649px]"
      />
      <div className="relative 2xl:container 2xl:p-0">
        <div className="absolute bottom-0 left-0 my-10 flex w-[237px] flex-col gap-10 bg-white p-8 text-xs text-black md:my-0 md:w-[496px] md:p-20 md:text-base">
          <PortableText value={sustainText!} />
        </div>
      </div>
    </section>
  );
}
