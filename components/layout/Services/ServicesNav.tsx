import Link from "next/link";

import { Loading } from "components/Loading";

import styles from "../../../styles/CarouselNav.module.css";

export function ServicesNav({ services, currentPageTitle }) {
  return (
    <div className="sticky top-[100px] z-50 bg-secondary bg-opacity-50 backdrop-blur-3xl">
      <div
        className={`container -ml-6 overflow-x-auto whitespace-nowrap 2xl:ml-4 ${styles.customScrollbar}`}
      >
        <div className="flex">
          <div className="-mr-8">
            <div className="group p-1">
              <Link href="/services">
                <div className="flex border-none bg-transparent">
                  <div
                    className={`font-Poppins p-6 text-[12px] font-light text-black 2xl:text-[14px] ${currentPageTitle === "Our Services" ? "text-black underline" : ""}`}
                  >
                    Our Services
                    <div
                      className={`${currentPageTitle !== "Our Services" ? "-mt-1 h-[0.5px] w-0 bg-black transition-all duration-500 group-hover:w-full md:h-[1.35px]" : ""}`}
                    ></div>
                  </div>
                  <div className="mx-3 -ml-6 p-6 font-light text-black 2xl:inline">
                    |
                  </div>
                </div>
              </Link>
            </div>
          </div>
          {services.map((service, index) => (
            <div key={index}>
              <div className="group p-1">
                <Link href={`/services/${service.slug}`}>
                  <div
                    className={`border-none bg-transparent ${currentPageTitle === service.title ? "text-black underline" : ""}`}
                  >
                    <div className="font-Poppins -ml-4 -mr-4 items-center justify-center p-6 text-[12px] font-light text-black 2xl:text-[14px]">
                      {service.title}
                      <div
                        className={`${currentPageTitle !== service.title ? "-mt-1 h-[0.5px] w-0 bg-black transition-all duration-500 group-hover:w-full md:h-[1.35px]" : ""}`}
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
