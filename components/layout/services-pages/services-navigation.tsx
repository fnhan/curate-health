"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ALL_SERVICES_QUERYResult } from "@/sanity.types";

export function ServicesNavigation({
  services,
}: {
  services: ALL_SERVICES_QUERYResult;
}) {
  const pathname = usePathname();

  const hoverEffect =
    "after:ease-[cubic-bezier(.86,0,.07,1)] relative inline-block cursor-pointer after:absolute after:left-0 after:top-[110%] after:h-px after:w-full after:origin-bottom-right after:scale-x-0 after:bg-primary after:transition-transform after:duration-500 hover:after:origin-bottom-left hover:after:scale-x-100";

  return (
    <div className="bg-secondary">
      <nav className="container font-light text-primary">
        <ul className="scrollbar-thumb-rounded-full flex items-center gap-4 overflow-x-auto whitespace-nowrap py-8 scrollbar-thin scrollbar-track-secondary scrollbar-thumb-primary">
          <li>
            <Link
              className={`${hoverEffect} ${
                pathname?.endsWith(`/services`) &&
                "after:origin-bottom-left after:scale-x-100"
              }`}
              href="/services"
            >
              Our Services
            </Link>
          </li>
          <div className="text-primary">|</div>
          {services.filter((service) => service.slug !== "curate-lifestyle").map((service) => (
            <li key={service.slug}>
              <Link
                href={`/services/${service.slug}`}
                className={`${hoverEffect} ${
                  pathname?.endsWith(`/services/${service.slug}`) &&
                  "after:origin-bottom-left after:scale-x-100"
                }`}
              >
                {service.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
