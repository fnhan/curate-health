import Image from "next/image";

import { PortableText } from "@portabletext/react";

export default function Sustainability({ sustainabilitySection }) {
  const bgImage = sustainabilitySection.bgImage?.asset?.url;
  const altText = sustainabilitySection.bgImage?.alt;
  return (
    <section>
      <Image
        width={1080}
        height={1440}
        src={bgImage}
        alt={altText}
        className="max-h-[435px] w-full object-cover md:max-h-[649px]"
      />
      <div className="relative 2xl:container 2xl:p-0">
        <div className="absolute bottom-0 left-0 my-10 flex w-[237px] flex-col gap-10 bg-white p-8 text-xs text-black md:my-0 md:w-[496px] md:p-20 md:text-base">
          <PortableText value={sustainabilitySection.sustainText} />
        </div>
      </div>
    </section>
  );
}
