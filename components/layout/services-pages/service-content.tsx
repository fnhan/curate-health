import Image from "next/image";
import Link from "next/link";

import { PortableText } from "@portabletext/react";
import { ArrowRightIcon } from "lucide-react";

import { SERVICE_BY_SLUG_QUERYResult } from "@/sanity.types";

interface Treatment {
  _id: string;
  title: string;
  slug: string;
}

export default function ServiceContent({
  service,
}: {
  service: SERVICE_BY_SLUG_QUERYResult;
}) {
  if (!service) {
    return null;
  }

  const { title, content, content_image, content_alt, slug } = service;
  const treatments = service.treatments as Treatment[];

  return (
    <section className="bg-white py-16 text-primary md:py-24">
      <div className="container flex flex-col gap-12 md:grid md:grid-cols-2 md:items-center">
        <div className="flex flex-col gap-8">
          <div className="space-y-4 md:space-y-6 2xl:space-y-8">
            <h1 className="text-xl md:text-4xl 2xl:text-6xl">{title}</h1>
            <div className="max-w-[80ch] text-pretty font-light">
              <PortableText value={content!} />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {treatments.map((treatment) => (
              <Link
                className="flex w-fit items-center gap-2 italic hover:underline"
                key={treatment._id}
                href={`/services/${slug}/${treatment.slug}`}
              >
                {treatment.title}
                <ArrowRightIcon size={16} />
              </Link>
            ))}
          </div>
        </div>
        <div className="flex justify-center md:justify-end">
          <Image
            className="size-[256px] rounded-full object-cover md:size-[320px] 2xl:size-[545px]"
            width={545}
            height={545}
            src={content_image!}
            alt={content_alt!}
          />
        </div>
      </div>
    </section>
  );
}
