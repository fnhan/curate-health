import Image from "next/image";

import { OUR_PROGRAMS_QUERYResult } from "@/sanity.types";

const MasterHealthBlueprint = ({
  program,
}: {
  program: OUR_PROGRAMS_QUERYResult;
}) => {
  if (!program) {
    return null;
  }

  const { masterHealthBlueprint } = program;

  return (
    <section
      className="bg-white text-primary 2xl:pl-[210px]"
      id="master-health-blueprint"
    >
      <div className="single-color-border container px-10 pt-52">
        <div className="relative flex flex-col items-center justify-between gap-20 pb-5 xl:flex-row xl:gap-16">
          <div className="flex max-w-[450px] flex-col gap-16">
            <h2 className="text-3xl capitalize leading-[52px] lg:text-[40px]">
              Master Health Blueprint
            </h2>
            <p className="whitespace-pre-line text-base leading-[28px]">
              {masterHealthBlueprint?.description}
            </p>
          </div>
          <div className="relative">
            <div className="absolute -top-14 right-0 h-14 w-3/4 bg-our-programs-border-3"></div>
            <Image
              src={masterHealthBlueprint?.image?.asset?.url!}
              alt={masterHealthBlueprint?.image?.alt ?? ""}
              height={550}
              width={700}
              className="relative right-0"
            />
          </div>
        </div>
        <div>
          <h3 className="my-14 text-2xl lg:text-[32px]">
            Master Health Blueprint
          </h3>
          <div className="flex flex-col justify-between xl:flex-row">
            <table className="[&_th]:pr-20 [&_th]:align-top">
              <thead>
                <tr>
                  <th className="pb-10 text-left font-semibold">Structure</th>
                </tr>
              </thead>
              <tbody className="[&_td]:pb-10 [&_th]:whitespace-nowrap [&_th]:pr-5 [&_th]:text-left [&_th]:font-light">
                <tr>
                  <th>Kick-Off</th>
                  <td>{masterHealthBlueprint?.structure?.kickOff}</td>
                </tr>
                <tr>
                  <th>Team</th>
                  <td>{masterHealthBlueprint?.structure?.team}</td>
                </tr>
                <tr>
                  <th>Plan</th>
                  <td>{masterHealthBlueprint?.structure?.plan}</td>
                </tr>
                <tr>
                  <th>Includes</th>
                  <td>
                    <ul className="flex flex-col gap-2">
                      {masterHealthBlueprint?.structure?.programIncludes?.map(
                        (item, i) => {
                          return (
                            <li
                              key={i}
                              className="li-checkmark-dark-green pl-2"
                            >
                              {item}
                            </li>
                          );
                        }
                      )}
                    </ul>
                  </td>
                </tr>
                <tr>
                  <th>Privileges</th>
                  <td>
                    <ul className="flex flex-col gap-2">
                      {masterHealthBlueprint?.structure?.privileges?.map(
                        (item, i) => {
                          return (
                            <li
                              key={i}
                              className="li-checkmark-dark-green pl-2"
                            >
                              {item}
                            </li>
                          );
                        }
                      )}
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="flex flex-1 xl:justify-center">
              <div className="max-w-[350px]">
                <p className="text-base font-semibold">Outcome</p>
                <p className="mt-10">{masterHealthBlueprint?.outcome}</p>
              </div>
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

export default MasterHealthBlueprint;
