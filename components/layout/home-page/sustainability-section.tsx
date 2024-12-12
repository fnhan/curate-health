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

  return (
    <section>
      <div className="relative">
        <div className="aspect-[16/12] min-h-[500px] w-full sm:aspect-[16/10] md:aspect-[16/8]">
          <Image
            fill
            src={bgImage?.asset?.url!}
            alt={bgImage?.alt ?? ""}
            className="object-cover"
            sizes="100vw"
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <div className="container">
            <div className="relative float-left max-w-xs bg-white p-8 text-xs text-black md:max-w-md md:p-20 md:text-base lg:max-w-lg">
              <PortableText value={sustainText!} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
