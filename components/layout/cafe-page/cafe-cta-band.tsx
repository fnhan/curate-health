import Image from "next/image";

import type { CAFE_PAGE_QUERYResult } from "@/sanity.types";

type CtaBand = NonNullable<CAFE_PAGE_QUERYResult>["ctaBandSection"];

export function CafeCtaBandSection({ data }: { data: CtaBand }) {
  if (!data) return null;

  const headline = data.headline?.trim();
  const body = data.body?.trim();
  const closingLine = data.closingLine?.trim();
  const bgUrl = data.backgroundImage?.url?.trim();
  const bgAlt = data.backgroundImage?.alt?.trim() ?? "";

  if (!headline && !body && !closingLine) return null;

  return (
    <section className="relative isolate min-h-[600px] w-full font-poppins md:min-h-[1040px]">
      {bgUrl ? (
        <Image
          src={bgUrl}
          alt={bgAlt}
          fill
          className="object-cover"
          sizes="100vw"
          quality={90}
        />
      ) : (
        <div className="absolute inset-0 bg-platinum" aria-hidden />
      )}
      <div className="relative z-10 flex min-h-[600px] items-center justify-center px-4 py-16 md:min-h-[1040px] md:px-8">
        <div className="flex h-[445px] w-full max-w-[928px] flex-col justify-center gap-8 overflow-y-auto bg-[#878E76] px-8 py-8 text-center text-primary-foreground md:gap-10 md:px-14 md:py-10 lg:max-w-[820px]">
          {headline ? (
            <h2 className="text-balance text-[28px] font-light leading-snug sm:text-[32px] md:text-[36px] lg:text-[40px]">
              {headline}
            </h2>
          ) : null}
          {body ? (
            <p className="text-pretty text-[16px] font-light leading-relaxed opacity-95">
              {body}
            </p>
          ) : null}
          {closingLine ? (
            <p className="text-[16px] font-light italic opacity-95 md:text-lg">
              {closingLine}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
