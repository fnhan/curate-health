import Image from "next/image";

import { PortableText } from "@portabletext/react";
import imageUrlBuilder from "@sanity/image-url";
import { CLINIC_SECTION_QUERYResult } from "sanity.types";

import { dataset, projectId } from "../../../sanity/env";

const builder = imageUrlBuilder({ projectId, dataset });

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
        src={builder
          .image(clinicImage)
          .width(1080)
          .height(1440)
          .quality(80)
          .url()}
        alt={clinicImage?.alt ?? ""}
        className="max-h-[435px] w-full object-cover md:max-h-[649px]"
      />
      <div className="container relative">
        <div className="absolute bottom-0 right-0 my-10 flex w-[237px] flex-col gap-10 bg-white p-8 text-xs text-black md:my-0 md:w-[496px] md:p-20 md:text-base">
          <PortableText value={content!} />
        </div>
      </div>
    </section>
  );
}
