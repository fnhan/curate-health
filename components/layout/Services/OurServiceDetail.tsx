import Image from "next/image";
import Link from "next/link";

import imageUrlBuilder from "@sanity/image-url";
import { Loading } from "components/Loading";

import { dataset, projectId } from "../../../sanity/env";

const builder = imageUrlBuilder({ projectId, dataset });

export default function OurServiceDetail({ services }) {
  return (
    <div className="grid grid-cols-2 md:container md:grid-cols-3">
      {services.map((service) => (
        <div
          key={service.title}
          className="item-center group flex flex-col justify-center"
        >
          <Link href={`/services/${service.slug}`}>
            <div className="relative overflow-hidden">
              <Image
                loading="lazy"
                width={1440}
                height={2560}
                src={builder
                  .image(service.image)
                  .width(210)
                  .height(300)
                  .quality(80)
                  .url()}
                alt={service.title}
                className="object-cover grayscale transition duration-300 group-hover:scale-105 group-hover:transform group-hover:grayscale-0"
              />
              <div className="absolute bottom-10 left-3 bg-opacity-75 px-2 py-1">
                <div className="text-xl group-hover:underline md:text-2xl">
                  {service.title}
                </div>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
