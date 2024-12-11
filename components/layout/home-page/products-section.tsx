import { PRODUCTS_SECTION_QUERYResult } from "sanity.types";

import { ProductCarousel } from "./product-carousel";

export default function ProductsSection({
  productsSection,
}: {
  productsSection: PRODUCTS_SECTION_QUERYResult;
}) {
  if (!productsSection) {
    return null;
  }

  const { sectionTitle, hoverLinkText, hoverLinkHref, products } =
    productsSection;

  return (
    <section
      id="products"
      className="flex min-h-[calc(100vh-100px)] flex-col gap-10 bg-white pb-10"
    >
      <div className="container pt-9">
        <h2 className="mb-8 mt-8 text-2xl text-black 2xl:container md:mb-24 md:mt-16 md:text-3xl xl:text-6xl">
          {sectionTitle}
        </h2>
      </div>
      <div className="container">
        <ProductCarousel products={products} />
      </div>
    </section>
  );
}
