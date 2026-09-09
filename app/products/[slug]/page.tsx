import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";

import { PortableText } from "@portabletext/react";

import { ProductsNavigation } from "@/components/layout/products-page/products-navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { externalLinkProps } from "@/lib/links";
import { buildPageMetadata } from "@/lib/page-metadata";
import { productAliasTargets, productPath } from "@/lib/service-urls";
import {
  PRODUCTS_NAVIGATION_QUERYResult,
  PRODUCT_BY_SLUG_QUERYResult,
} from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import {
  PRODUCTS_NAVIGATION_QUERY,
  PRODUCT_BY_SLUG_QUERY,
} from "@/sanity/lib/queries";

/**
 * Resolves one product URL, shared by the component and by generateMetadata.
 *
 * Shared on purpose, and this is not a stylistic choice. generateMetadata runs
 * before the component, so an alias that lives only in the component is an
 * alias generateMetadata never reaches: it hits its own notFound() first and
 * the renamed URL 404s. That is exactly how two indexed treatment URLs went
 * down during the treatment slug rename, and the fix was this same shape.
 */
function fetchProduct(slug: string) {
  return sanityFetch<PRODUCT_BY_SLUG_QUERYResult>({
    query: PRODUCT_BY_SLUG_QUERY,
    params: { slug },
  });
}

async function resolve(slug: string) {
  const product = await fetchProduct(slug);

  if (product) return { kind: "product" as const, product };

  // Nothing by that slug. It may be either side of a rename, so try the
  // alternatives, and only redirect to one that actually resolves. That check
  // is what keeps a two-way alias from bouncing between two dead slugs.
  for (const target of productAliasTargets(slug)) {
    if (await fetchProduct(target)) {
      return { kind: "redirect" as const, to: productPath(target) };
    }
  }

  return { kind: "none" as const };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const products = await sanityFetch<PRODUCTS_NAVIGATION_QUERYResult>({
    query: PRODUCTS_NAVIGATION_QUERY,
  });

  const resolved = await resolve(params.slug);

  if (resolved.kind === "redirect") {
    permanentRedirect(resolved.to);
  }

  if (resolved.kind === "none") {
    notFound();
  }

  const { product } = resolved;

  const { banner, image, title, description, accordioninfo, callToAction } =
    product;

  const { ctaText, ctaLink, ctaSectionTitle, ctaSectionDescription } =
    callToAction!;

  return (
    <>
      <section>
        <Image
          width={1920}
          height={1080}
          priority
          quality={100}
          sizes="100vw"
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
              <a href={ctaLink} {...externalLinkProps(ctaLink)}>
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
  // Same resolution as the component, deliberately. This runs first, so any
  // logic it does not share is logic the component never gets to apply.
  //
  // The notFound() below also covers the CH-001 shape: destructuring a null
  // result throws a 500, and a 500 costs crawl budget across the whole domain
  // where a 404 costs nothing.
  const resolved = await resolve(params.slug);

  if (resolved.kind === "redirect") {
    permanentRedirect(resolved.to);
  }

  if (resolved.kind === "none") {
    notFound();
  }

  const { seo } = resolved.product;

  return buildPageMetadata(seo);
}
