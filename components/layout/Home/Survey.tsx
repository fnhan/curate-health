import Image from "next/image";

import imageUrlBuilder from "@sanity/image-url";
import { ArrowRight } from "lucide-react";

import { dataset, projectId } from "../../../sanity/env";

const builder = imageUrlBuilder({ projectId, dataset });

export default function SurveyLink({ surveyLink }) {
  const { bgImage, cta, youformId, content, bold } = surveyLink;
  return (
    <section className="relative h-[200px] bg-platinum md:h-[350px] lg:h-[594px]">
      <Image
        width={1440}
        height={594}
        alt={`${bgImage.alt}`}
        src={builder.image(bgImage).width(1440).height(594).url()}
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 mt-10 flex items-center justify-center p-4">
        <a
          data-youform-open={youformId}
          data-youform-position="center"
          className="flex h-[175px] w-[175px] cursor-pointer flex-col items-center justify-center gap-3 rounded-full border-4 border-white bg-platinum p-5 text-center text-primary transition-all duration-300 hover:bg-primary hover:text-white md:h-[275px] md:w-[275px] lg:h-[400px] lg:w-[400px]"
        >
          <p className="pt-4 text-[14px] md:text-[22px] lg:text-[36px]">
            {content}
            <span className="text-[14px] font-bold italic md:text-[22px] lg:text-[36px]">
              {bold}
            </span>
          </p>
          <div className="flex items-center">
            <p className="text-[10px] md:text-[14px] lg:text-[16px]">{cta}</p>
            <ArrowRight className="ml-1 h-3 w-3 md:ml-2 md:h-5 md:w-5 lg:h-6 lg:w-6" />
          </div>
        </a>
      </div>
    </section>
  );
}
