import Image from "next/image";

import { PortableText } from "@portabletext/react";
import imageUrlBuilder from "@sanity/image-url";
import { Loading } from "components/Loading";

import { dataset, projectId } from "../../../sanity/env";

const builder = imageUrlBuilder({ projectId, dataset });

export default function Picture({ service }) {
  if (!service) {
    return <Loading />;
  }

  return (
    <div className="">
      <Image
        loading="lazy"
        width={1080}
        height={1440}
        src={builder
          .image(service.image)
          .width(1440)
          .height(760)
          .quality(80)
          .url()}
        alt={service.title}
        className="h-[200px] w-full object-cover md:h-[300px] 2xl:h-[400px]"
      />
    </div>
  );
}
