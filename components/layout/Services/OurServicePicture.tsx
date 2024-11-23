import Image from "next/image";

import { PortableText } from "@portabletext/react";
import imageUrlBuilder from "@sanity/image-url";
import { Loading } from "components/Loading";

import { dataset, projectId } from "../../../sanity/env";

const builder = imageUrlBuilder({ projectId, dataset });

export default function OurServicePicture({ ourServices }) {
  if (!ourServices) {
    return <Loading />;
  }

  return (
    <div className="relative">
      <Image
        loading="lazy"
        width={1080}
        height={1440}
        src={builder
          .image(ourServices.image)
          .width(1440)
          .height(760)
          .quality(80)
          .url()}
        alt="Our Services"
        className="h-[400px] w-full object-cover opacity-60 md:h-[550px]"
      />
      <div className="container absolute top-2/3 -translate-y-1/2 transform md:w-2/3">
        <h1 className="font-Poppins container text-[24px] md:text-[40px] 2xl:text-[60px]">
          {ourServices.title}
        </h1>
        <div className="font-Poppins container mt-8 text-[10px] font-light leading-[24px] md:text-[12px] 2xl:text-[14px]">
          <PortableText value={ourServices.content} />
        </div>
      </div>
    </div>
  );
}
