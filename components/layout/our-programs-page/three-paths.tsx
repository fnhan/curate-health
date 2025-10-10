import Image from "next/image";

import { cn } from "@/lib/utils";
import { OUR_PROGRAMS_QUERYResult } from "@/sanity.types";

const Heading = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <h1 className={cn("text-xl font-light md:text-4xl", className)}>
      {children}
    </h1>
  );
};

const LargeText = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <p
      className={cn(
        "text-lg font-[275] md:text-2xl 2xl:text-4xl 2xl:leading-[1.5em]",
        className
      )}
    >
      {children}
    </p>
  );
};

const ThreePaths = ({ program }: { program: OUR_PROGRAMS_QUERYResult }) => {
  if (!program) {
    return null;
  }

  const { programs, threePaths } = program;
  const borderColor = [
    "border-our-programs-border",
    "border-our-programs-border-2",
    "border-our-programs-border-3",
  ];

  return (
    <section className="bg-white">
      <div className="my-28 space-y-12 bg-platinum py-16 text-primary md:py-32">
        <div className="gap-y container flex flex-col items-center justify-center gap-y-10">
          <Heading className="max-w-2xl text-center">
            Three Paths. One Shared Goal: Empowered, Long-Term Health
          </Heading>
          <div className="h-24 w-[2px] rounded bg-primary"></div>
          <LargeText className="max-w-3xl text-center italic">
            Which Program Is Right for You?
          </LargeText>
          <p className="max-w-[700px] text-center font-light leading-7">
            From self-directed care to fully curated support, our three programs
            reflect different levels of structure, guidance, and commitment.
            Whether you’re looking for flexible access to services, focused
            guidance to reverse chronic conditions, or a concierge-style
            transformative experience, each path is rooted in clinical expertise
            and built to support where you are, and elevate you to where you
            want to be. The more curated the program, the more seamlessly
            integrated the care — helping you progress step by step toward
            long-term health and vitality.
          </p>
        </div>
      </div>
      <div className="container flex justify-center text-primary">
        <table className="border-collapse border-spacing-0">
          <thead>
            <tr>
              <th></th>
              {programs?.map(({ programName, image }, i) => {
                return (
                  <th key={programName} className="p-0">
                    <div
                      className={`relative h-[275px] w-[325px] overflow-hidden border-b-[12px] ${borderColor[i]}`}
                    >
                      <Image
                        src={image?.asset?.url!}
                        alt={image?.alt ?? ""}
                        height={0}
                        width={350}
                      />
                    </div>
                    <p className="pt-6 text-xl font-medium">{programName}</p>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="[&_td]:max-w-[325px] [&_td]:p-10 [&_td]:tracking-[0.045em] [&_td]:text-primary [&_th]:whitespace-nowrap [&_th]:pr-20 [&_th]:text-left [&_th]:font-semibold [&_th]:text-primary">
            <tr className="[&>td]:text-center">
              <th>Best For</th>
              {threePaths?.tableContent?.bestFor?.map((desc, i) => {
                const words = desc.split(" ");
                const firstWord = words[0];
                return (
                  <td key={i} className={`border-b-[5px] ${borderColor[i]}`}>
                    <span className="font-semibold italic">
                      {firstWord + " "}
                    </span>
                    {words.slice(1).join(" ")}
                  </td>
                );
              })}
            </tr>
            <tr className="[&>td]:text-center [&>td]:align-top">
              <th>Approach</th>
              {threePaths?.tableContent?.approach?.map((desc, i) => {
                return (
                  <td key={i} className={`border-b-[5px] ${borderColor[i]}`}>
                    {desc}
                  </td>
                );
              })}
            </tr>
            <tr className="[&>td]:text-center [&>td]:align-top">
              <th>Focus</th>
              {threePaths?.tableContent?.focus?.map((desc, i) => {
                return (
                  <td key={i} className={`border-b-[5px] ${borderColor[i]}`}>
                    {desc}
                  </td>
                );
              })}
            </tr>
            <tr className="[&_li]:pl-2">
              <th>Extras</th>
              <td className={`border-b-[5px] ${borderColor[0]}`}>
                <ul>
                  {threePaths?.tableContent?.extras?.essentialSeries?.map(
                    (item, i) => {
                      return (
                        <li key={i} className="li-checkmark-dark-green">
                          {item}
                        </li>
                      );
                    }
                  )}
                </ul>
              </td>
              <td className={`border-b-[5px] ${borderColor[1]}`}>
                <ul>
                  {threePaths?.tableContent?.extras?.curateLifestyle?.map(
                    (item, i) => {
                      return (
                        <li key={i} className="li-checkmark-light-green mb-2">
                          {item}
                        </li>
                      );
                    }
                  )}
                </ul>
              </td>
              <td className={`border-b-[5px] ${borderColor[2]}`}>
                <ul>
                  {threePaths?.tableContent?.extras?.masterHealthBlueprint?.map(
                    (item, i) => {
                      return (
                        <li key={i} className="li-checkmark mb-2">
                          {item}
                        </li>
                      );
                    }
                  )}
                </ul>
              </td>
            </tr>
            <tr className="[&>td]:text-center">
              <th>Pricing</th>
              <td>{threePaths?.tableContent?.pricing?.essentialSeries}</td>
              <td>
                {threePaths?.tableContent?.pricing?.curateLifestyle?.map(
                  (item, i, arr) => {
                    if (i === arr.length - 1) {
                      return (
                        <p className="text-xs" key={i}>
                          {item}
                        </p>
                      );
                    }
                    return item;
                  }
                )}
              </td>
              <td>
                {threePaths?.tableContent?.pricing?.masterHealthBlueprint}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ThreePaths;
