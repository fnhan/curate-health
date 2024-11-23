import Image from "next/image";

import { PortableText } from "@portabletext/react";
import imageUrlBuilder from "@sanity/image-url";

import { dataset, projectId } from "../../../../sanity/env";

export default function Content({ treatment }) {
  const builder = imageUrlBuilder({ projectId, dataset });

  const renderLeft = () => (
    <div className="flex flex-col text-black 2xl:mt-24 2xl:flex-row">
      <div className="mt-20 justify-start 2xl:w-1/2">
        <div className="absolute h-[460px] w-9/12 bg-primary pr-60 text-[16px] opacity-75 2xl:container md:h-[500px] md:text-[32px] 2xl:w-2/5"></div>
        <Image
          loading="lazy"
          width={1080}
          height={1440}
          src={builder
            .image(treatment.leftImage)
            .width(1440)
            .height(760)
            .quality(80)
            .url()}
          alt="left image"
          className="relative mt-12 h-[460px] w-11/12 object-cover md:h-[500px] 2xl:mt-16 2xl:w-full"
        />
      </div>
      <div className="container mb-40 mt-12 2xl:mb-96 2xl:mr-20 2xl:mt-28 2xl:w-1/2">
        <div className="pr-60 text-[16px] md:text-[32px] 2xl:mb-12 2xl:mt-6">
          <PortableText value={treatment.rightSubtitle} />
        </div>
        <div className="mt-4 text-[11px] leading-5 md:text-[14px] md:leading-6">
          <PortableText value={treatment.rightContent} />
        </div>
      </div>
    </div>
  );

  const renderRight = () => (
    <div className="flex flex-col text-black 2xl:flex-row-reverse">
      <div className="relative mt-20 justify-start 2xl:mt-24 2xl:w-1/2">
        <div className="2xl: absolute h-[460px] w-9/12 bg-primary pr-60 text-[16px] opacity-75 2xl:container md:h-[500px] md:text-[32px] 2xl:right-0 2xl:mt-6 2xl:w-10/12"></div>
        <Image
          loading="lazy"
          width={1080}
          height={1440}
          src={builder
            .image(treatment.rightImage)
            .width(1440)
            .height(760)
            .quality(80)
            .url()}
          alt="right image"
          className="relative mt-12 h-[460px] w-11/12 object-cover md:h-[500px] 2xl:mt-20 2xl:w-full"
        />
      </div>
      <div className="container mb-20 mt-12 2xl:mb-40 2xl:mt-36 2xl:w-1/2">
        <div className="pr-60 text-[16px] 2xl:container md:text-[32px] 2xl:mb-12 2xl:mt-6">
          <PortableText value={treatment.leftSubtitle} />
        </div>
        <div className="mt-4 text-[11px] leading-5 2xl:container md:text-[14px] md:leading-6">
          <PortableText value={treatment.leftContent} />
        </div>
      </div>
    </div>
  );

  if (!treatment.leftImage && !treatment.rightImage) {
    return null;
  }

  if (!treatment.leftImage) {
    return <div className="bg-white">{renderRight()}</div>;
  }

  if (!treatment.rightImage) {
    return <div className="bg-white">{renderLeft()}</div>;
  }

  return (
    <div className="bg-white">
      {renderRight()}
      {renderLeft()}
    </div>
  );
}
