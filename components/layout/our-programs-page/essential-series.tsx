import Image from "next/image";

import { OUR_PROGRAMS_QUERYResult } from "@/sanity.types";

import darkGreenCheckmark from "../../../public/images/dark-green-checkmark.svg";

const EssentialSeries = ({
  program,
}: {
  program: OUR_PROGRAMS_QUERYResult;
}) => {
  if (!program) {
    return null;
  }

  const { essentialSeries } = program;

  return (
    <section
      className="bg-white pt-32 text-primary 2xl:pl-[210px]"
      id="essential-series"
    >
      <div className="three-color-border container pl-10 pt-14">
        <div className="flex flex-col items-center justify-between gap-20 pb-5 xl:flex-row xl:gap-8">
          <div className="flex max-w-lg flex-col gap-16">
            <h2 className="text-3xl capitalize lg:text-[40px]">
              Essential Series
            </h2>
            <p className="whitespace-pre-line text-base leading-[28px]">
              {essentialSeries?.description}
            </p>
          </div>
          <div className="flex-1">
            <div className="relative flex justify-end">
              <div className="absolute -top-14 right-0 h-14 w-3/4 bg-our-programs-border"></div>
              <Image
                src={essentialSeries?.image?.asset?.url!}
                alt={essentialSeries?.image?.alt ?? ""}
                height={550}
                width={700}
              />
            </div>
          </div>
        </div>
        <div>
          <h3 className="my-14 text-2xl lg:text-[32px]">Essential Series</h3>
          <div className="flex flex-col gap-12 xl:flex-row">
            <div className="overflow-auto lg:overflow-visible">
              <table className="max-h-60 [&_td]:p-6">
                <thead>
                  <tr>
                    <th className="text-left font-semibold">Tier</th>
                    <th className="text-[40px] font-light">1</th>
                    <th className="text-[40px] font-light">2</th>
                    <th className="text-[40px] font-light">3</th>
                  </tr>
                </thead>
                <tbody className="[&_td]:text-center [&_th]:whitespace-nowrap [&_th]:pr-5">
                  <tr>
                    <th className="text-left font-normal">Included Sessions</th>
                    {essentialSeries?.tableContent?.includesSessions?.map(
                      (num) => {
                        return <td key={num}>{num}</td>;
                      }
                    )}
                  </tr>
                  <tr>
                    <th className="text-left font-normal">Bonus Sessions</th>
                    {essentialSeries?.tableContent?.bonusSessions?.map(
                      (num) => {
                        return <td key={num}>+ {num}</td>;
                      }
                    )}
                  </tr>
                  <tr className="border-b">
                    <th className="text-left font-normal">
                      Bonus Transferable
                    </th>
                    {essentialSeries?.tableContent?.bonusTransferable?.map(
                      (bool, i) => {
                        return (
                          <td key={`${bool}${i}`}>
                            {bool ? (
                              <img
                                src={darkGreenCheckmark.src}
                                alt=""
                                className="mx-auto"
                              />
                            ) : (
                              "X"
                            )}
                          </td>
                        );
                      }
                    )}
                  </tr>
                  <tr className="[&>td]:text-5xl [&>td]:font-light">
                    <th className="text-left font-semibold">Total Sessions</th>
                    {essentialSeries?.tableContent?.includesSessions?.map(
                      (num, i) => {
                        let bonusSessions = essentialSeries.tableContent
                          ?.bonusSessions
                          ? essentialSeries.tableContent?.bonusSessions[i]
                          : 0;
                        return (
                          <td key={num + bonusSessions}>
                            {num + bonusSessions}
                          </td>
                        );
                      }
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <ul className="mx-auto flex w-4/5 flex-col gap-8 xl:w-5/12 [&>li]:pl-12">
                {essentialSeries?.listContent?.map((item, i, items) => {
                  if (i === items.length - 1) {
                    return (
                      <li
                        className="li-exclamation-mark font-semibold text-primary"
                        key={i}
                      >
                        {item}
                      </li>
                    );
                  }
                  return (
                    <li key={i} className="li-checkmark">
                      {item.includes("†") ? (
                        <>
                          {item.slice(0, -1)}
                          <sup>{item.slice(-1)}</sup>
                        </>
                      ) : (
                        item
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-24 text-[10px] leading-[18px]">
          *Sessions purchased in a single Series must be for the same type of
          service. **Eligible services include the full range of services
          offered at Curate Health. ***Included Sessions are for the primary
          participant and may be eligible for extended healthcare insurance
          coverage. Included sessions do not expire. †Bonus Sessions may be used
          by the participant or extended as a gift to a friend or family member.
          These sessions are not eligible for extended healthcare insurance
          coverage. Bonus sessions may be applied to both initial assessments
          (for new guests of Curate Health) and regular sessions of the
          purchased service. Valid for 12 months (Tier 1), 18 months (Tier 2),
          or 24 months (Tier 3).{" "}
        </p>
      </div>
    </section>
  );
};

export default EssentialSeries;
