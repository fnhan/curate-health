import Image from "next/image";

import { OUR_PROGRAMS_QUERYResult } from "@/sanity.types";

const CurateLifestyle = ({
  program,
}: {
  program: OUR_PROGRAMS_QUERYResult;
}) => {
  if (!program) {
    return null;
  }

  const { curateLifestyle } = program;

  return (
    <section
      className="bg-white text-primary 2xl:pl-[210px]"
      id="curate-lifestyle"
    >
      <div className="two-color-border container relative px-10 pt-52">
        <div className="flex flex-col items-center justify-end gap-8 pb-5 xl:flex-row">
          <div className="relative md:left-0 2xl:absolute 2xl:-left-[210px]">
            <div className="absolute -top-14 left-0 h-14 w-5/6 bg-our-programs-border-2"></div>
            <Image
              src={curateLifestyle?.image?.asset?.url!}
              alt={curateLifestyle?.image?.alt ?? ""}
              height={550}
              width={700}
            />
          </div>
          <div className="flex max-w-[540px] flex-col gap-16 2xl:mr-48">
            <h2 className="text-3xl capitalize lg:text-[40px]">
              Curate Lifestyle
            </h2>
            <p className="whitespace-pre-line text-base leading-[28px]">
              {curateLifestyle?.description}
            </p>
          </div>
        </div>
        <div>
          <h3 className="my-14 text-2xl lg:text-[32px]">Curate Lifestyle</h3>
          <div className="flex flex-col justify-between xl:flex-row">
            <table className="[&_th]:pr-20 [&_th]:align-top">
              <thead>
                <tr>
                  <th className="pb-10 text-left font-semibold">Structure</th>
                </tr>
              </thead>
              <tbody className="[&_td]:pb-10 [&_th]:whitespace-nowrap [&_th]:pr-5">
                <tr>
                  <th className="text-left font-normal">Length</th>
                  <td>{curateLifestyle?.structure?.length}</td>
                </tr>
                <tr>
                  <th className="text-left font-normal">Format</th>
                  <td className="whitespace-pre-line">
                    {curateLifestyle?.structure?.format}
                  </td>
                </tr>
                <tr>
                  <th className="text-left font-normal">Focus</th>
                  <td>{curateLifestyle?.structure?.focus}</td>
                </tr>
                <tr>
                  <th className="text-left font-semibold">Bonus</th>
                  <td>
                    <ul className="flex flex-col gap-2">
                      {curateLifestyle?.structure?.bonus?.map(
                        (bonusText, i) => {
                          return (
                            <li
                              key={i}
                              className="li-checkmark-dark-green pl-2"
                            >
                              {bonusText}
                            </li>
                          );
                        }
                      )}
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="max-w-[350px] xl:mr-52">
              <p className="text-base font-semibold">Outcome</p>
              <p className="mt-10">{curateLifestyle?.outcome}</p>
            </div>
          </div>
        </div>
        <p className="mt-24 text-[10px] leading-[18px]">
          *Bonuses available to be booked throughout the program, and up to one
          month following graduation **Partially covered by OHIP - referral
          required. ***May also be partially covered by extended healthcare
          insurance
        </p>
      </div>
    </section>
  );
};

export default CurateLifestyle;
