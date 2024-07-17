import { PortableText } from '@portabletext/react';

export default function Frame({ treatment }) {
  if (!treatment.framesTitle) {
    return null;
  }

  return (
    <div className='bg-white'>
      <div className="container 2xl:flex 2xl:text-center flex-col text-black py-24 2xl:px-40">
        <div className="text-[16px] md:text-[32px] 2xl:text-[50px] pr-36 md:pr-80 xl:px-40">
          <PortableText value={treatment.framesTitle} />
        </div>
        {treatment.frames && treatment.frames.map((frame, index) => (
          <div key={index}>
            <div className="italic font-light mt-8 md:mt-16 text-[16px] md:text-[22px] 2xl:text-[40px] pr-36 md:pr-96 2xl:px-40">
              {frame.title}
            </div>
            <div className="mt-8 text-[11px] md:text-[14px] 2xl:text-[16px] pr-12 md:pr-96 2xl:px-40">
              <PortableText value={frame.content} />
            </div>
            <hr className="border-black mt-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
