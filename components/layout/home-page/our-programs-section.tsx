import Image from "next/image";
import Link from "next/link";

import HoverLink from "components/shared/hover-link";
import { MoveRightIcon } from "lucide-react";

/**
 * Every field here is nullable, because every field in Sanity is optional and
 * the query does no coalescing.
 *
 * This type used to declare url, name, href, barColor and isLink as non-null,
 * which did not match what OUR_PROGRAMS_SECTION_QUERY returns. Nothing caught
 * it because sanity.types.ts is stale; regenerating it surfaces the mismatch
 * as a type error on app/page.tsx.
 *
 * The consequence was not theoretical. `href` was passed straight into
 * next/link, and Next throws when href is undefined, so a program row saved
 * with Is Link ticked and the link left empty would take the homepage down.
 * The guard below is what actually fixes that; widening the type is what stops
 * it being reintroduced.
 */
type OurProgramsSectionData = {
  sectionTitle: string | null;
  bgImage: {
    asset: { _id: string; url: string | null } | null;
    alt: string | null;
  } | null;
  programs:
    | {
        name: string | null;
        href: string | null;
        barColor: string | null;
        isLink: boolean | null;
      }[]
    | null;
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
              <h2 className="mb-10 text-3xl font-light text-[#283619] md:text-5xl xl:text-[60px] xl:leading-[66px]">
                {sectionTitle}
              </h2>

              {/* Program list */}
              <div className="flex flex-col gap-4 md:gap-6">
                {programs?.map((program, index) => {
                  const inner = (
                    <div className="flex items-center gap-4 md:gap-6">
                      {/* Vertical coloured bar */}
                      <div
                        className="h-14 w-[15px] shrink-0 rounded-sm"
                        style={{
                          backgroundColor: program.barColor ?? undefined,
                        }}
                      />
                      {/* Program name */}
                      <span className="text-xl font-light text-[#283619] md:text-3xl xl:text-[40px] xl:leading-[52px]">
                        {program.name}
                      </span>
                      <MoveRightIcon
                        strokeWidth={1.5}
                        size={24}
                        color="#283619"
                      />
                    </div>
                  );

                  // Is Link ticked with the link left empty renders as plain
                  // text rather than as a link to nowhere. next/link throws on
                  // an undefined href, which would take the whole page down.
                  const key = program.name ?? `program-${index}`;

                  return program.isLink && program.href ? (
                    <Link
                      key={key}
                      href={program.href}
                      className="group flex w-fit items-center transition-opacity hover:opacity-70"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div key={key} className="flex w-fit items-center">
                      {inner}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar, hover link. Same trap as the program rows: HoverLink
          hands href to next/link, which throws on undefined. The non-null
          assertions here claimed both were always set, and neither is
          required in Sanity. */}
      {hoverLinkHref && hoverLinkText ? (
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <HoverLink
            href={hoverLinkHref}
            text={hoverLinkText}
            textColor="text-white"
          />
        </div>
      ) : null}
    </section>
  );
}
