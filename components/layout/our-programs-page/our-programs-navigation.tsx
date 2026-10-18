"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { HOVER_UNDERLINE_INLINE, UNDERLINE_DRAWN } from "@/lib/hover-underline";

const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

export function OurProgramsNavigation() {
  const pathname = usePathname();

  const hoverEffect = HOVER_UNDERLINE_INLINE;

  return (
    <div className="overflow-x-auto bg-secondary">
      <nav className="container font-light text-primary">
        <ul className="scrollbar-thumb-rounded-full flex items-center gap-4 overflow-x-auto whitespace-nowrap py-8 scrollbar-thin scrollbar-track-secondary scrollbar-thumb-primary">
          <li>
            <Link
              className={`${hoverEffect} ${
                pathname?.endsWith(`/our-programs`) && UNDERLINE_DRAWN
              }`}
              href="/our-programs"
            >
              Our Programs
            </Link>
          </li>
          <li aria-hidden="true" className="text-primary">
            |
          </li>
          {[
            {
              title: "Essential Series",
              href: "#essential-series",
            },
            {
              title: "Curate Lifestyle",
              href: "#curate-lifestyle",
            },
            {
              title: "Master Health Blueprint",
              href: "#master-health-blueprint",
            },
          ].map((program) =>
            program.href.includes("#") ? (
              <li key={program.title}>
                <button
                  type="button"
                  className={hoverEffect}
                  onClick={() => scrollToSection(program.href.slice(1))}
                >
                  {program.title}
                </button>
              </li>
            ) : (
              <li key={program.title}>
                <Link
                  href={program.href}
                  className={`${hoverEffect} ${
                    pathname?.endsWith(`/our-programs/${program.href}`) &&
                    UNDERLINE_DRAWN
                  }`}
                >
                  {program.title}
                </Link>
              </li>
            )
          )}
        </ul>
      </nav>
    </div>
  );
}
