import { SectionNavigation } from "@/components/shared/section-navigation";
import { PRODUCTS_NAVIGATION_QUERY_RESULT } from "@/sanity.types";

/**
 * The products second menu, the same component the services pages use. See
 * components/shared/section-navigation.tsx.
 */
export function ProductsNavigation({
  products,
}: {
  products: PRODUCTS_NAVIGATION_QUERY_RESULT;
}) {
  return (
    <SectionNavigation
      ariaLabel="Products"
      label="Our Products"
      labelHref="/products"
      items={products
        .filter((product) => product.slug)
        .map((product) => ({
          title: product.title ?? "",
          href: `/products/${product.slug}`,
        }))}
    />
  );
}
