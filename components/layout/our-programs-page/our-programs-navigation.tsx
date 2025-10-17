"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const scrollToSection = (id) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

export function OurProgramsNavigation() {
  const pathname = usePathname();

  const hoverEffect =
    "after:ease-[cubic-bezier(.86,0,.07,1)] relative inline-block cursor-pointer after:absolute after:left-0 after:top-[110%] after:h-px after:w-full after:origin-bottom-right after:scale-x-0 after:bg-primary after:transition-transform after:duration-500 hover:after:origin-bottom-left hover:after:scale-x-100";

  return (
    <div className="overflow-x-auto bg-secondary">
      <nav className="container font-light text-primary">
        <ul className="scrollbar-thumb-rounded-full flex items-center gap-4 overflow-x-auto whitespace-nowrap py-8 scrollbar-thin scrollbar-track-secondary scrollbar-thumb-primary">
          <li>
            <Link
              className={`${hoverEffect} ${
                pathname?.endsWith(`/our-programs`) &&
                "after:origin-bottom-left after:scale-x-100"
              }`}
              href="/our-programs"
            >
              Our Programs
            </Link>
          </li>
          <div className="text-primary">|</div>
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
              <li
                key={program.title}
                className={hoverEffect}
                onClick={() => scrollToSection(program.href.slice(1))}
              >
                {program.title}
              </li>
            ) : (
              <li key={program.title}>
                <Link
                  href={program.href}
                  className={`${hoverEffect} ${
                    pathname?.endsWith(`/our-programs/${program.href}`) &&
                    "after:origin-bottom-left after:scale-x-100"
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
