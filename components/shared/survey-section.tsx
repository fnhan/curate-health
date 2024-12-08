"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

import imageUrlBuilder from "@sanity/image-url";
import { ArrowRight } from "lucide-react";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { dataset, projectId } from "../../sanity/env";

const builder = imageUrlBuilder({ projectId, dataset });

export default function SurveySection({ surveySection }) {
  const pathname = usePathname();
  const { bgImage, cta, youformId, content, bold } = surveySection;

  if (pathname === "/coming-soon") {
    return null;
  }

  return (
    <>
      <section className="relative h-[400px] bg-platinum md:h-[705px]">
        <Image
          width={1440}
          height={594}
          alt={`${bgImage.alt}`}
          src={builder.image(bgImage).width(1440).height(594).url()}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <Dialog>
            <DialogTrigger className="flex size-[200px] cursor-pointer flex-col items-center justify-center gap-3 rounded-full border-4 border-white bg-platinum p-5 text-center text-primary transition-all duration-300 hover:bg-primary hover:text-white md:size-96 lg:size-[537px]">
              <p className="text-pretty pt-4 capitalize md:text-[22px] lg:text-[36px]">
                {content}{" "}
                <span className="font-bold italic md:text-[22px] lg:text-[36px]">
                  {bold}
                </span>
              </p>
              <div className="flex items-center">
                <p className="text-[10px] md:text-[14px] lg:text-[16px]">
                  {cta}
                </p>
                <ArrowRight className="ml-1 h-3 w-3 md:ml-2 md:h-5 md:w-5 lg:h-6 lg:w-6" />
              </div>
            </DialogTrigger>
            <DialogContent>
              <iframe
                src={`https://app.youform.com/forms/${youformId}`}
                loading="lazy"
                width="100%"
                height="700"
              ></iframe>
            </DialogContent>
          </Dialog>
        </div>
      </section>
    </>
  );
}
