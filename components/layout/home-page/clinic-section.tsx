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
    <section className="relative">
      <Image
        width={1080}
        height={1440}
        src={clinicImage?.asset?.url!}
        alt={clinicImage?.alt ?? ""}
        className={`max-h-[calc(100vh-100px)] min-h-[231px] w-full object-cover`}
      />
      <div className="container relative">
        <div className="absolute bottom-0 right-0 my-10 flex w-[237px] flex-col gap-10 bg-white p-8 text-xs text-black md:my-0 md:w-[496px] md:p-20 md:text-base">
          <PortableText value={content!} />
        </div>
      </div>
    </section>
  );
}
