import { PortableText } from "@portabletext/react";
import HoverLink from "components/shared/hover-link";
import { CAFE_QUERY_RESULT } from "sanity.types";

import { portableTextComponents } from "@/components/shared/portable-text-components";
import { SanityImage } from "@/components/shared/sanity-image";

export default function CafeSection({
  cafeSection,
}: {
  cafeSection: CAFE_QUERY_RESULT;
}) {
  if (!cafeSection) return null;

  const { cafeImage, title, content, hoverLinkText, hoverLinkHref } =
    cafeSection;

  return (
    <section>
      <div className="relative">
        <div className="aspect-[16/12] min-h-[500px] w-full sm:aspect-[16/10] md:aspect-[16/8]">
          <SanityImage
            fill
            source={cafeImage}
            src={cafeImage?.asset?.url!}
            alt={cafeImage?.alt ?? ""}
            className="object-cover object-top"
            sizes="100vw"
          />
        </div>
        <div className="container absolute bottom-0 left-0 right-0 top-0 flex flex-col justify-between">
          <h2 className="py-14 text-2xl text-black md:py-24 md:text-3xl xl:text-6xl">
            {title!}
          </h2>
          <div className="mb-32 max-w-[200px] text-sm font-light text-black sm:max-w-[300px] sm:text-xl 2xl:max-w-[544px] 2xl:text-4xl">
            <PortableText
              value={content!}
              components={portableTextComponents}
            />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <HoverLink
            href={hoverLinkHref!}
            text={hoverLinkText!}
            textColor="text-black"
          />
        </div>
      </div>
    </section>
  );
}
