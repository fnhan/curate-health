import { PortableText } from "@portabletext/react";

export default function Frame({ treatment }) {
  if (!treatment.framesTitle) {
    return null;
  }

  return (
    <div className="bg-white">
      <div className="container flex-col py-24 text-black 2xl:flex 2xl:px-40 2xl:text-center">
        <div className="pr-36 text-[16px] md:pr-80 md:text-[32px] xl:px-40 2xl:text-[50px]">
          <PortableText value={treatment.framesTitle} />
        </div>
        {treatment.frames &&
          treatment.frames.map((frame, index) => (
            <div key={index}>
              <div className="mt-8 pr-36 text-[16px] font-light italic md:mt-16 md:pr-96 md:text-[22px] 2xl:px-40 2xl:text-[40px]">
                {frame.title}
              </div>
              <div className="mt-8 pr-12 text-[11px] md:pr-96 md:text-[14px] 2xl:px-40 2xl:text-[16px]">
                <PortableText value={frame.content} />
              </div>
              <hr className="mt-16 border-black" />
            </div>
          ))}
      </div>
    </div>
  );
}
