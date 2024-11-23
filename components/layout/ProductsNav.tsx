import Link from "next/link";

import { Loading } from "components/Loading";
import styles from "styles/CarouselNav.module.css";

export function ProductsNav({ products, currentPageTitle }) {
  return (
    <div className="sticky top-[100px] z-50 bg-secondary bg-opacity-50 backdrop-blur-3xl">
      <div
        className={`container -ml-6 overflow-x-auto whitespace-nowrap 2xl:ml-4 ${styles.customScrollbar}`}
      >
        <div className="flex">
          <div className="-mr-8">
            <div className="group p-1">
              <div>
                <div className="flex border-none bg-transparent">
                  <div
                    className={`font-Poppins p-6 text-[12px] font-light text-black 2xl:text-[14px] ${
                      currentPageTitle === "Our Services"
                        ? "text-black underline"
                        : ""
                    }`}
                  >
                    Our Products
                    <div
                      className={`${
                        currentPageTitle !== "Our Services"
                          ? "-mt-1 h-[1.35px] w-0 bg-black"
                          : ""
                      }`}
                    ></div>
                  </div>
                  <div className="mx-3 -ml-6 p-6 font-light text-black lg:inline">
                    |
                  </div>
                </div>
              </div>
            </div>
          </div>
          {products.map((product, index) => (
            <div key={index}>
              <div className="group p-1">
                <Link href={`/products/${product.slug}`}>
                  <div
                    className={`border-none bg-transparent ${
                      currentPageTitle === product.title
                        ? "text-black underline"
                        : ""
                    }`}
                  >
                    <div className="font-Poppins -ml-4 -mr-4 items-center justify-center p-6 text-[12px] font-light text-black 2xl:text-[14px]">
                      {product.title}
                      <div
                        className={`${
                          currentPageTitle !== product.title
                            ? "-mt-1 h-[1.35px] w-0 bg-black transition-all duration-500 group-hover:w-full"
                            : ""
                        }`}
                      ></div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
