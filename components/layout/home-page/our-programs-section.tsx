import Image from "next/image";
import Link from "next/link";

import HoverLink from "components/shared/hover-link";

type Program = {
  name: string;
  href: string;
  barColor: string;
  isLink: boolean;
};

const programs: Program[] = [
  {
    name: "Essential Series",
    href: "/our-programs#essential-series",
    barColor: "#888D76",
    isLink: false,
  },
  {
    name: "Curate Lifestyle",
    href: "/our-programs#curate-lifestyle",
    barColor: "#AFBD8C",
    isLink: true,
  },
  {
    name: "Master Health Blueprint",
    href: "/our-programs#master-health-blueprint",
    barColor: "#DBDDD8",
    isLink: true,
  },
];

function ArrowIcon({ color = "#283619" }: { color?: string }) {
  return (
    <svg
      width="24"
      height="17"
      viewBox="0 0 24 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1="3.53"
        y1="8.5"
        x2="20.37"
        y2="8.5"
        stroke={color}
        strokeWidth="1"
      />
      <rect
        x="14.54"
        y="4.49"
        width="8.41"
        height="8.41"
        stroke={color}
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}

export default function OurProgramsSection() {
  return (
    <section className="relative">
      {/* Background Image */}
      <div className="relative aspect-[1442/1084] min-h-[500px] w-full md:min-h-[700px] xl:min-h-[900px]">
        <Image
          fill
          src="/images/our-programs-bg.jpg"
          alt="Our Programs background"
          className="object-cover origin-bottom-left"
          style={{ objectPosition: "-500px 100%", transform: "scale(2)" }}
          sizes="100vw"
        />

        {/* Content overlay — right half */}
        <div className="absolute inset-0 flex items-center">
          <div className="container flex h-full flex-col justify-center">
            <div className="ml-auto w-full max-w-[600px]">
              {/* Section heading */}
              <h2 className="mb-10 font-light text-[#283619] text-3xl md:text-5xl xl:text-[60px] xl:leading-[66px]">
                Our Programs
              </h2>

              {/* Program list */}
              <div className="flex flex-col gap-4 md:gap-6">
                {programs.map((program) => {
                  const inner = (
                    <div className="flex items-center gap-4 md:gap-6">
                      {/* Vertical coloured bar */}
                      <div
                        className="h-14 w-[15px] shrink-0 rounded-sm"
                        style={{ backgroundColor: program.barColor }}
                      />
                      {/* Program name */}
                      <span className="font-light text-[#283619] text-xl md:text-3xl xl:text-[40px] xl:leading-[52px]">
                        {program.name}
                      </span>
                      {/* Arrow */}
                      <div className="ml-2 flex items-center">
                        <ArrowIcon />
                      </div>
                    </div>
                  );

                  return program.isLink ? (
                    <Link
                      key={program.name}
                      href={program.href}
                      className="group flex w-fit items-center transition-opacity hover:opacity-70"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div key={program.name} className="flex w-fit items-center">
                      {inner}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar — "About Our Programs" */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <HoverLink
          href="/our-programs"
          text="About Our Programs"
          textColor="text-white"
        />
      </div>
    </section>
  );
}
