import { PortableText } from '@portabletext/react';

export default function Hero({treatment}) {
  return (
    <div className="bg-white">
      <div className="container flex-col text-black font-Poppins py-14 md:py-24 2xl:px-40 ">
        <div className="2xl:flex 2xl:justify-center text-2xl md:text-[50px] 2xl:text-[74px]">
          {treatment.title}
        </div>
        <div className="2xl:flex 2xl:justify-center text-secondary font-thin text-[100px]">
          |
        </div>
        <div className="2xl:flex 2xl:justify-center pr-40 md:pr-80 2xl:text-center md:leading-[40px] 2xl:leading-[50px] 2xl:px-40  py-8 text-base font-light md:text-[32px] 2xl:text-[40px]">
          <PortableText value={treatment.heroSubtitle} />
        </div>
        <div className="2xl:flex 2xl:justify-center 2xl:text-center 2xl:px-12 font-light text-[11px] md:text-[14px] 2xl:text-[16px]">
          <PortableText value={treatment.heroContent} />
        </div>
      </div>
    </div>

  );
}