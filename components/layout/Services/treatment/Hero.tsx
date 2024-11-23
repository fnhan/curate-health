import { PortableText } from "@portabletext/react";

export default function Hero({ treatment }) {
  return (
    <div className="bg-white">
      <div className="font-Poppins container flex-col py-14 text-black md:py-24 2xl:px-40">
        <div className="text-2xl md:text-[50px] 2xl:flex 2xl:justify-center 2xl:text-[74px]">
          {treatment.title}
        </div>
        <div className="text-[100px] font-thin text-secondary 2xl:flex 2xl:justify-center">
          |
        </div>
        <div className="py-8 pr-40 text-base font-light md:pr-80 md:text-[32px] md:leading-[40px] 2xl:flex 2xl:justify-center 2xl:px-40 2xl:text-center 2xl:text-[40px] 2xl:leading-[50px]">
          <PortableText value={treatment.heroSubtitle} />
        </div>
        <div className="text-[11px] font-light md:text-[14px] 2xl:flex 2xl:justify-center 2xl:px-12 2xl:text-center 2xl:text-[16px]">
          <PortableText value={treatment.heroContent} />
        </div>
      </div>
    </div>
  );
}
