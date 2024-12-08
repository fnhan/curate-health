import Image from "next/image";
import { notFound } from "next/navigation";

import { AlternatingSections } from "@/components/shared/alternating-sections";
import { MISSION_AND_VALUES_QUERYResult } from "@/sanity.types";
import { MISSION_AND_VALUES_QUERY } from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/server-client";

export default async function MissionAndValuesPage() {
  const missionAndValues = await sanityFetch<MISSION_AND_VALUES_QUERYResult>({
    query: MISSION_AND_VALUES_QUERY,
  });

  if (!missionAndValues) {
    return notFound();
  }

  const { heroSection, additionalSections } = missionAndValues;

  return (
    <>
      <Image
        width={1440}
        height={1080}
        src={heroSection?.heroImage?.image?.asset?.url || ""}
        alt={heroSection?.heroImage?.alt || ""}
        className="h-[400px] w-full object-cover md:h-[550px]"
      />
      <AlternatingSections sections={additionalSections!} />
    </>
  );
}
