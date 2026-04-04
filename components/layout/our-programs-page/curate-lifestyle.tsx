import Image from "next/image";
import Link from "next/link";

import { OUR_PROGRAMS_QUERYResult } from "@/sanity.types";

import arrow from "../../../public/images/cta-arrow.svg";

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
      className="section-grey-border bg-white text-primary 2xl:pl-[210px]"
      id="curate-lifestyle"
    >
      <div className="two-color-border container relative px-10 pt-52">
        <div className="flex flex-col justify-end gap-8 pb-5 lg:items-center xl:flex-row 2xl:justify-start 2xl:pl-[488px]">
          <div className="relative shrink-0 md:left-0 2xl:absolute 2xl:-left-[210px]">
            <div className="absolute -top-14 left-0 h-14 w-5/6 bg-our-programs-border-2"></div>
            <Image
              src={curateLifestyle?.image?.asset?.url!}
              alt={curateLifestyle?.image?.alt ?? ""}
              height={550}
              width={700}
            />
          </div>
          <div className="flex min-w-0 max-w-[540px] flex-col gap-16 max-xl:mx-auto">
            <h2 className="text-3xl capitalize lg:text-[40px]">
              Curate Lifestyle
            </h2>
            <p className="whitespace-pre-line text-base leading-[28px]">
              {curateLifestyle?.description}
            </p>
          </div>
        </div>
        <div>
          <h3 className="my-14 text-2xl max-xl:text-center lg:text-[32px]">
            Curate Lifestyle
          </h3>
          <div className="flex flex-col xl:flex-row xl:gap-56">
            <div>
              <table className="max-xl:mx-auto [&_th]:pr-20 [&_th]:align-top">
                <thead>
                  <tr>
                    <th className="pb-10 text-left font-semibold">Structure</th>
                  </tr>
                </thead>
                <tbody className="[&_td]:pb-10 [&_td]:font-light [&_th]:whitespace-nowrap [&_th]:pr-5 [&_th]:text-left [&_th]:font-light">
                  <tr>
                    <th>Length</th>
                    <td>{curateLifestyle?.structure?.length}</td>
                  </tr>
                  <tr>
                    <th>Format</th>
                    <td className="whitespace-pre-line">
                      {curateLifestyle?.structure?.format}
                    </td>
                  </tr>
                  <tr>
                    <th>Focus</th>
                    <td>{curateLifestyle?.structure?.focus}</td>
                  </tr>
                  <tr>
                    <th>Bonus</th>
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
                  <tr>
                    <th>Entry</th>
                    <td className="!pb-[2px]">{curateLifestyle?.structure?.entry}</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-[72px] text-[10px] leading-[18px] max-xl:text-center">
                *Bonuses available to be booked throughout the program, and up
                to one month following graduation <br />
                **Partially covered by OHIP - referral required. ***May also be
                partially covered by extended healthcare insurance
              </p>
            </div>
            <div className="flex flex-col items-center justify-between max-xl:gap-y-20 xl:max-w-[350px]">
              <div>
                <p className="text-base font-semibold max-xl:mt-10">Outcome</p>
                <p className="mt-10">{curateLifestyle?.outcome}</p>
              </div>
              <div className="flex flex-col gap-3 text-center font-semibold">
                <a
                  href={curateLifestyle?.referral_form_pdf?.asset?.url ?? ""}
                  className="border-2 border-[#878E76] p-6 text-[#6B6B6B] transition-colors duration-300 hover:bg-[#878E76] hover:text-white"
                >
                  Referral Form [PDF Download]
                </a>
                <Link
                  href="/services/curate-lifestyle"
                  className="flex justify-center gap-x-2 border-2 border-transparent bg-[#878E76] p-6 text-white shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] transition-colors duration-300 hover:border-[#878E76] hover:bg-white hover:text-[#6B6B6B] lg:justify-between"
                >
                  {curateLifestyle?.call_to_action}
                  <img src={arrow.src} alt="" width={25} height={20} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CurateLifestyle;
