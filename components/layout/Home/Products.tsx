import { Loading } from "components/Loading";

import HoverLink from "./HoverLink";
import { ProductCarousel } from "./ProductCarousel";

export default function Products({ productsSection, products }) {
  const { sectionTitle, hoverLinkText, hoverLinkHref } = productsSection;

  if (!productsSection) {
    return (
      <div className="border-y py-10">
        <Loading />
      </div>
    );
  }

  return (
    <section id="products" className="flex flex-col gap-10 bg-white">
      <div className="container pt-9">
        <h2 className="font-poppins font-light text-[#283619] text-muted-foreground md:text-4xl">
          {sectionTitle}
        </h2>
      </div>
      <div className="container">
        <ProductCarousel products={products} />
      </div>
      <HoverLink
        href={hoverLinkHref}
        text={hoverLinkText}
        textColor="text-black"
      />
    </section>
  );
}
