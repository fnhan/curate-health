import Image from "next/image";

import { PortableText } from "@portabletext/react";
import { CLINIC_SECTION_QUERYResult } from "sanity.types";

export default function ClinicSection({
  clinicSection,
}: {
  clinicSection: CLINIC_SECTION_QUERYResult;
}) {
  if (!clinicSection) return null;

  const { clinicImage, content } = clinicSection;

  return (
    <section>
      <div className="relative">
        <div className="aspect-[16/12] min-h-[500px] w-full sm:aspect-[16/10] md:aspect-[16/8]">
          <Image
            fill
            src={clinicImage?.asset?.url!}
            alt={clinicImage?.alt ?? ""}
            className="object-cover object-top"
            sizes="100vw"
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <div className="container">
            <div className="relative float-right max-w-xs bg-white p-8 text-xs text-black md:max-w-md md:p-20 md:text-base lg:max-w-lg">
              <PortableText value={content!} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
