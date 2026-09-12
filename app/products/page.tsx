import Image from "next/image";
import Link from "next/link";

import { ProductsNavigation } from "@/components/layout/products-page/products-navigation";
import { buildPageMetadata } from "@/lib/page-metadata";
import { productPath } from "@/lib/service-urls";
import { JsonLdScript, buildProductsIndexJsonLd } from "@/lib/structured-data";
import {
  PRODUCTS_NAVIGATION_QUERYResult,
  PRODUCTS_QUERYResult,
} from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import {
  PRODUCTS_NAVIGATION_QUERY,
  PRODUCTS_QUERY,
} from "@/sanity/lib/queries";

/**
 * The products index. CH-010.
 *
 * All five product pages were orphaned: unreachable by internal link from the
 * homepage inside three hops, which is roughly where a crawler stops caring.
 * They were not hidden by accident either. The Products entry in the navigation
 * and in the footer both pointed at /#products, an anchor to a carousel on the
 * homepage, so nothing on the site ever linked to a product page except that
 * carousel and the sibling nav on the product pages themselves.
 *
 * This page is the missing hub. The two navigation links now point here, which
 * is the change that actually un-orphans them; the page alone would not.
 */
export default async function ProductsPage() {
  const products = await sanityFetch<PRODUCTS_QUERYResult>({
    query: PRODUCTS_QUERY,
  });

  // The sibling nav takes its own narrower projection, the same one the product
  // pages use, so the two render an identical list.
  const productsNav = await sanityFetch<PRODUCTS_NAVIGATION_QUERYResult>({
    query: PRODUCTS_NAVIGATION_QUERY,
  });

  return (
    <>
      <JsonLdScript
        data={buildProductsIndexJsonLd(products)}
        id="products-json-ld"
      />

      <section className="bg-white pt-32 md:pt-40">
        <div className="container flex flex-col gap-6">
          <h1 className="text-3xl font-light text-primary md:text-5xl">
            Products
          </h1>
          <p className="max-w-[65ch] font-light leading-7 text-primary">
            Braces, orthotics and clinical supplies fitted at the practice in
            Midtown Toronto. Each one is assessed and sized by a practitioner
            rather than sold off a shelf.
          </p>
        </div>
      </section>

      <ProductsNavigation products={productsNav} />

      <section className="bg-white">
        <div className="grid gap-1 bg-white pb-28 lg:container sm:grid-cols-2 md:pb-36 lg:grid-cols-3 lg:pb-[200px]">
          {products.map((product) => (
            <Link
              className="group relative grayscale transition-all duration-300 hover:grayscale-0 focus:grayscale-0"
              key={product.slug}
              href={productPath(product.slug)}
            >
              <Image
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="h-72 w-full object-cover md:h-96 lg:h-[512px]"
                src={product.image!}
                // The stored alt describes the photograph, which is what alt is
                // for. Falling back to the title rather than to an empty string
                // means a product whose alt was never written still announces
                // itself, instead of reading as a decorative image. CH-028.
                alt={product.altText || product.title || ""}
                width={380}
                height={500}
                quality={100}
              />
              <div className="absolute inset-0 flex h-full w-full items-end">
                <div className="relative w-full">
                  <div className="absolute inset-0 bg-gradient-to-t from-muted-foreground from-10% to-transparent opacity-100 transition-opacity duration-300 group-hover:opacity-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 from-10% to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <h2 className="relative p-4 text-left text-white md:text-lg lg:text-2xl">
                    {product.title}
                  </h2>
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
  /**
   * No seo object, because there is no productsPage document to hold one.
   *
   * Every other page reads its title and description from Sanity. This one has
   * nowhere to read them from, so they are passed as fallbacks and are the only
   * copy on the site that an editor cannot change without a deploy. Worth a
   * productsPage document eventually; not worth blocking the hub on it.
   */
  return buildPageMetadata(null, {
    path: "/products",
    title: "Products",
    description:
      "Custom foot orthotics, knee braces, compression stockings, TENS machines and professional grade supplements, fitted at Curate Health in Midtown Toronto.",
  });
}
