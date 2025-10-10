import Image from "next/image";

import { OUR_PROGRAMS_QUERYResult } from "@/sanity.types";

const IntroSection = ({ program }: { program: OUR_PROGRAMS_QUERYResult }) => {
  if (!program) {
    return null;
  }

  const { title, intro, programs } = program;

  return (
    <div className="text-primary">
      <section className="bg-white">
        <div className="container flex flex-col gap-3 py-14 md:gap-6 md:py-28 2xl:gap-8">
          <div className="flex flex-col items-center gap-3 md:gap-6 2xl:gap-8">
            <h1 className="w-3/6 text-center text-2xl capitalize md:text-4xl 2xl:text-6xl">
              {title}
            </h1>
            <div className="h-16 w-px bg-primary md:h-24 2xl:h-32" />
          </div>
          <div className="mx-auto max-w-[90ch] space-y-4 text-pretty text-center">
            <h2 className="mx-auto w-7/12 text-xl capitalize md:text-3xl">
              {intro?.subtitle}
            </h2>
            <p className="font-light">{intro?.introParagraph}</p>
          </div>
        </div>
        <div className="container grid justify-center gap-8 py-32 lg:grid-cols-[repeat(3,_min(100%,_350px))]">
          {programs?.map(({ programName, description, image }, i) => {
            const color = [
              "border-our-programs-border",
              "border-our-programs-border-2",
              "border-our-programs-border-3",
            ][i];
            return (
              <div
                className="rounded-xs flex min-h-[550px] flex-col border shadow-md"
                key={programName}
              >
                <div className="relative flex-1">
                  <Image
                    src={image?.asset?.url!}
                    alt={image?.alt ?? ""}
                    fill
                    className={`border-b-[12px] ${color}`}
                  />
                </div>
                <div className="flex min-h-56 flex-col gap-7 p-7">
                  <p className="text-xl font-medium">{programName}</p>
                  <p className="text-xs leading-[22px]">{description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default IntroSection;
