import Image from "next/image";
import Link from "next/link";

import { SERVICES_PAGE_QUERYResult } from "@/sanity.types";
import { SERVICES_PAGE_QUERY } from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/server-client";

export default async function ServicesPage() {
  const servicesPage = await sanityFetch<SERVICES_PAGE_QUERYResult>({
    query: SERVICES_PAGE_QUERY,
  });

  const { services } = servicesPage;

  return (
    <section className="bg-white">
      <div className="grid gap-1 bg-white lg:container sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Link
            className="relative grayscale transition-all duration-300 hover:grayscale-0 focus:grayscale-0"
            key={service.slug}
            href={`/services/${service.slug}`}
          >
            <Image
              className="h-60 w-full object-cover md:h-72 lg:h-96"
              src={service.image!}
              alt={service.title!}
              width={380}
              height={500}
            />
            <div className="absolute inset-0 flex h-full w-full items-end p-4">
              <h3 className="bg-black/50 px-2 py-1 text-center font-light text-white md:text-lg lg:text-2xl">
                {service.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
