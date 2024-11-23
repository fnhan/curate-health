import Image from "next/image";

import { PortableText } from "@portabletext/react";
import imageUrlBuilder from "@sanity/image-url";

import { dataset, projectId } from "../../../../sanity/env";

export default function Written({ treatment }) {
  const builder = imageUrlBuilder({ projectId, dataset });
  return (
    <div className="relative">
      <Image
        loading="lazy"
        width={1080}
        height={1440}
        src={builder
          .image(treatment.writtenImage)
          .width(1440)
          .height(760)
          .quality(80)
          .url()}
        alt="written content"
        className="h-[660px] w-full object-cover md:h-[827px] 2xl:h-[1040px]"
      />
      <div className="2xl:leading-11 absolute top-1/2 flex h-4/6 w-11/12 -translate-y-1/2 flex-col justify-center bg-secondary px-4 text-white md:w-9/12 2xl:left-1/2 2xl:h-2/4 2xl:w-8/12 2xl:-translate-x-1/2 2xl:px-16 2xl:text-center">
        <div className="container text-[16px] md:text-[32px] 2xl:text-[40px]">
          <PortableText value={treatment.writtenTitle} />
        </div>
        <div className="container mt-4 text-[11px] leading-6 md:text-[16px] md:leading-7">
          <PortableText value={treatment.writtenContent} />
        </div>
        <div className="container mt-4 text-[10px] italic md:mt-16 md:text-[16px] 2xl:text-[24px]">
          <PortableText value={treatment.writtenBracketContent} />
        </div>
      </div>
    </div>
  );
}
