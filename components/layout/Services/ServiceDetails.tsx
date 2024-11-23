import Image from "next/image";

import { PortableText } from "@portabletext/react";
import imageUrlBuilder from "@sanity/image-url";
import { Loading } from "components/Loading";
import { Button } from "components/ui/button";
import { ArrowRight } from "lucide-react";

import { dataset, projectId } from "../../../sanity/env";

const builder = imageUrlBuilder({ projectId, dataset });

export default function ServiceDetails({ service, treatments }) {
  if (!service) {
    return <Loading />;
  }

  return (
    <section
      className="relative bg-white text-black md:h-[560px] 2xl:h-[660px]"
      id={service.id}
    >
      <div className="flex w-full flex-col md:flex-row">
        <div className="container mr-10 mt-12 flex flex-col md:mt-32 md:w-1/2">
          <h2 className="font-Poppins whitespace-nowrap text-[24px] text-stone-800 2xl:container md:text-[35px] 2xl:text-[60px]">
            {service.title}
          </h2>
          <br />
          <div className="font-Poppins mx-auto mb-10 max-w-prose text-[12px] font-light leading-[20px] md:text-[16px] md:leading-[30px] 2xl:ml-12">
            <PortableText value={service.content} />
          </div>
        </div>
        <div className="flex md:w-1/2">
          <Image
            loading="lazy"
            width={1080}
            height={1440}
            src={builder
              .image(service.hero_image)
              .width(1080)
              .height(1440)
              .quality(80)
              .url()}
            alt={service.title}
            className="mx-auto h-[250px] w-[250px] rounded-full object-cover group-hover:-translate-y-3 md:mt-20 md:h-[350px] md:w-[350px] 2xl:h-[500px] 2xl:w-[500px]"
          />
        </div>
      </div>
      <div className="font-Poppins pb-20 text-[16px] font-light italic leading-[30px] text-stone-800 md:-mt-32 md:w-1/2 md:text-[18px] md:leading-[60px] 2xl:-mt-60 2xl:text-[24px]">
        <div className="container mt-8">
          {treatments.map((treatment) => (
            <div key={treatment._id} className="mb-2 flex items-center">
              <a
                href={`/services/${service.slug}/${treatment.slug}`}
                className="flex items-center hover:font-medium"
              >
                <span className="mr-2 2xl:container md:-mb-8 2xl:-mb-4">
                  {treatment.title}
                </span>
                <ArrowRight className="rounded-full border-none bg-transparent transition-all duration-300 hover:scale-105 hover:bg-transparent md:-mb-8 md:w-[90px]" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
