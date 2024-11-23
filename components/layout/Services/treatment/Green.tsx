import { PortableText } from "@portabletext/react";

export default function Green({ treatment }) {
  if (!treatment.greenTitle && !treatment.greenContent) {
    return <div className="-mt-36"></div>;
  }

  return (
    <div className="container bg-primary">
      <div className="text-[100px] font-thin leading-[100px] text-white 2xl:text-[120px]">
        |
      </div>
      <div className="mt-4 pr-16 text-[16px] md:pr-48 md:text-[32px] 2xl:pr-96 2xl:text-[50px] 2xl:font-light">
        <PortableText value={treatment.greenTitle} />
      </div>
      <div className="mb-20 mt-4 pr-16 text-[16px] font-thin italic md:pr-48 md:text-[22px] 2xl:mb-36 2xl:pr-96 2xl:text-[30px]">
        <PortableText value={treatment.greenContent} />
      </div>
    </div>
  );
}
