import Image from "next/image";
import Link from "next/link";

import HoverLink from "components/shared/hover-link";
import { MoveRightIcon } from "lucide-react";

type OurProgramsSectionData = {
  sectionTitle: string | null;
  bgImage: {
    asset: { _id: string; url: string } | null;
    alt: string | null;
  } | null;
  programs: {
    name: string;
    href: string;
    barColor: string;
    isLink: boolean;
  }[] | null;
  hoverLinkText: string | null;
  hoverLinkHref: string | null;
} | null;


export default function OurProgramsSection({
  ourProgramsSection,
}: {
  ourProgramsSection: OurProgramsSectionData;
}) {
  if (!ourProgramsSection) return null;

  const { sectionTitle, bgImage, programs, hoverLinkText, hoverLinkHref } =
    ourProgramsSection;

  return (
    <section className="relative">
      {/* Background Image */}
      <div className="relative aspect-[16/12] min-h-[500px] w-full sm:aspect-[16/10] md:aspect-[16/8]">
        {bgImage?.asset?.url && (
          <Image
            fill
            src={bgImage.asset.url}
            alt={bgImage.alt ?? "Our Programs background"}
            className="object-cover object-[center_75%]"
            sizes="100vw"
          />
        )}

        {/* Content overlay — right half */}
        <div className="absolute inset-0 flex items-center">
          <div className="container flex h-full flex-col justify-center">
            <div className="ml-auto w-full max-w-[600px]">
              {/* Section heading */}
              <h2 className="mb-10 font-light text-[#283619] text-3xl md:text-5xl xl:text-[60px] xl:leading-[66px]">
                {sectionTitle}
              </h2>

              {/* Program list */}
              <div className="flex flex-col gap-4 md:gap-6">
                {programs?.map((program) => {
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
                      <MoveRightIcon strokeWidth={1.5} size={24} color="#283619" />
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

      {/* Bottom bar — hover link */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <HoverLink
          href={hoverLinkHref!}
          text={hoverLinkText!}
          textColor="text-white"
        />
      </div>
    </section>
  );
}
