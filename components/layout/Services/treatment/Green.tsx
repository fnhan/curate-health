import { PortableText } from '@portabletext/react';

export default function Green({treatment}) {
  if (!treatment.greenTitle && !treatment.greenContent) {
    return null;
  }

  return (
    <div className='container bg-primary'>
      <div className=" text-white font-thin text-[100px] 2xl:text-[120px] leading-[100px]">
        |
      </div>
      <div className="mt-4 pr-16 md:pr-48 2xl:pr-96 text-[16px] md:text-[32px] 2xl:text-[50px] 2xl:font-light">
        <PortableText value={treatment.greenTitle} />
      </div>
      <div className="mt-4 pr-16 md:pr-48 2xl:pr-96 italic font-thin text-[16px] md:text-[22px] 2xl:text-[30px] mb-20 2xl:mb-36">
        <PortableText value={treatment.greenContent} />
      </div>

    </div>
  );
}