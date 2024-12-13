import Image from "next/image";
import Link from "next/link";

import ServicesHeroSection from "@/components/layout/services-pages/services-hero-section";
import { ServicesNavigation } from "@/components/layout/services-pages/services-navigation";
import {
  ALL_SERVICES_QUERYResult,
  SERVICES_PAGE_QUERYResult,
} from "@/sanity.types";
import { ALL_SERVICES_QUERY, SERVICES_PAGE_QUERY } from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/server-client";

export default async function ServicesPage() {
  const services = await sanityFetch<ALL_SERVICES_QUERYResult>({
    query: ALL_SERVICES_QUERY,
  });
  const servicesHeroSection = await sanityFetch<SERVICES_PAGE_QUERYResult>({
    query: SERVICES_PAGE_QUERY,
  });

  return (
    <>
      <ServicesHeroSection servicesHeroSection={servicesHeroSection} />
      <ServicesNavigation services={services} />
      <section className="bg-white">
        <div className="grid gap-1 bg-white lg:container sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              className="group relative grayscale transition-all duration-300 hover:grayscale-0 focus:grayscale-0"
              key={service.slug}
              href={`/services/${service.slug}`}
            >
              <Image
                className="h-60 w-full object-cover md:h-72 lg:h-96"
                src={service.hero_image!}
                alt={service.hero_alt!}
                width={380}
                height={500}
              />
              <div className="absolute inset-0 flex h-full w-full items-end">
                <div className="relative w-full">
                  {/* Default gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-muted-foreground from-10% to-transparent opacity-100 transition-opacity duration-300 group-hover:opacity-0" />
                  {/* Hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 from-10% to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <h3 className="relative p-4 text-left text-white md:text-lg lg:text-2xl">
                    {service.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

export async function generateMetadata() {
  const servicesPage = await sanityFetch<SERVICES_PAGE_QUERYResult>({
    query: SERVICES_PAGE_QUERY,
  });

  const { seo } = servicesPage!;

  return {
    title: seo?.pageTitle,
    description: seo?.pageDescription,
    openGraph: {
      title: seo?.pageTitle,
      description: seo?.pageDescription,
      images: {
        url: seo?.socialMeta?.ogImage?.asset?.url!,
        alt: seo?.socialMeta?.ogImage?.asset?.alt!,
      },
    },
    twitter: {
      title: seo?.pageTitle,
      description: seo?.pageDescription,
      images: {
        url: seo?.socialMeta?.twitterImage?.asset?.url!,
        alt: seo?.socialMeta?.twitterImage?.asset?.alt!,
      },
    },
  };
}
