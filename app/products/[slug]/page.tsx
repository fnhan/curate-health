import Image from "next/image";
import { notFound } from "next/navigation";

import { PortableText } from "@portabletext/react";

import { ProductsNavigation } from "@/components/layout/products-page/products-navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  PRODUCTS_NAVIGATION_QUERYResult,
  PRODUCT_BY_SLUG_QUERYResult,
} from "@/sanity.types";
import {
  PRODUCTS_NAVIGATION_QUERY,
  PRODUCT_BY_SLUG_QUERY,
} from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/server-client";

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const products = await sanityFetch<PRODUCTS_NAVIGATION_QUERYResult>({
    query: PRODUCTS_NAVIGATION_QUERY,
  });

  const product = await sanityFetch<PRODUCT_BY_SLUG_QUERYResult>({
    query: PRODUCT_BY_SLUG_QUERY,
    params: { slug: params.slug },
  });

  if (!product) {
    notFound();
  }

  const { banner, image, title, description, accordioninfo, callToAction } =
    product;

  const { ctaText, ctaLink, ctaSectionTitle, ctaSectionDescription } =
    callToAction!;

  return (
    <>
      <section>
        <Image
          width={1080}
          height={1440}
          src={banner?.asset?.url || ""}
          alt={banner?.alt || ""}
          className="h-[400px] w-full object-cover md:h-[550px]"
        />
      </section>
      <ProductsNavigation products={products} />
      <section className="bg-white py-20 text-primary md:py-32">
        <div className="container">
          <div className="flex flex-col-reverse items-center gap-10 md:grid md:grid-cols-2 md:items-start">
            <div className="space-y-10">
              <div className="space-y-2">
                <h1 className="text-center text-xl font-light italic md:text-left md:text-3xl 2xl:text-4xl">
                  {title}
                </h1>
                <p className="mx-auto max-w-[80ch] text-pretty text-center md:text-left">
                  {description}
                </p>
              </div>
              <div className="mx-auto">
                {accordioninfo?.map((item, index) => (
                  <Accordion type="single" collapsible key={index}>
                    <AccordionItem value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {item.title}
                      </AccordionTrigger>
                      <AccordionContent className="prose w-full font-light">
                        <PortableText value={item.description!} />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ))}
              </div>
            </div>
            <Image
              width={1080}
              height={1440}
              src={image?.asset?.url || ""}
              alt={image?.alt || ""}
              className="size-80 object-contain md:size-96 md:place-self-center md:justify-self-end"
            />
          </div>
        </div>
      </section>
      <section className="bg-white pb-20 text-primary md:pb-32">
        <div className="container">
          <div className="mx-auto flex max-w-[80ch] flex-col items-center gap-6 text-center">
            <div className="space-y-4">
              <h2 className="text-xl">{ctaSectionTitle}</h2>
              <p className="text-pretty">{ctaSectionDescription}</p>
            </div>
            <Button
              asChild
              className="rounded-none border border-primary bg-primary text-white hover:bg-transparent hover:text-primary"
            >
              <a target="_blank" href={ctaLink}>
                {ctaText}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const productPage = await sanityFetch<PRODUCT_BY_SLUG_QUERYResult>({
    query: PRODUCT_BY_SLUG_QUERY,
    params: { slug: params.slug },
  });

  const { seo } = productPage!;

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
