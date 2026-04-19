import Image from "next/image";
import { notFound } from "next/navigation";

import { AlternatingSections } from "@/components/shared/alternating-sections";
import { sanityFetch } from "@/sanity/lib/client";
import { MISSION_AND_VALUES_QUERY } from "@/sanity/lib/queries";

type MissionAndValuesPageData = {
  heroSection?: {
    heroImage?: {
      image?: { asset?: { url?: string } } | null;
      alt?: string | null;
    } | null;
  } | null;
  additionalSections?: any[] | null;
  financialReportsSection?: {
    title?: string | null;
    description?: string | null;
    reports?:
      | Array<{
          year?: number | null;
          label?: string | null;
          file?: { url?: string | null; originalFilename?: string | null; mimeType?: string | null } | null;
        }>
      | null;
  } | null;
  feedbackSurvey?: {
    title?: string | null;
    description?: string | null;
    buttonText?: string | null;
    url?: string | null;
  } | null;
  seo?: any;
};

export default async function MissionAndValuesPage() {
  const missionAndValues = await sanityFetch<MissionAndValuesPageData>({
    query: MISSION_AND_VALUES_QUERY,
  });

  if (!missionAndValues) {
    return notFound();
  }

  const { heroSection, additionalSections, financialReportsSection, feedbackSurvey } = missionAndValues;

  const reports =
    financialReportsSection?.reports
      ?.filter((r) => Boolean(r?.year) && Boolean(r?.file?.url))
      .sort((a, b) => (b.year ?? 0) - (a.year ?? 0)) ?? [];

  return (
    <>
      <Image
        width={1920}
        height={1080}
        priority
        quality={100}
        sizes="100vw"
        src={heroSection?.heroImage?.image?.asset?.url || ""}
        alt={heroSection?.heroImage?.alt || ""}
        className="h-[400px] w-full object-cover md:h-[550px]"
      />
      <AlternatingSections sections={additionalSections!} />

      {(financialReportsSection || feedbackSurvey) && (
        <section className="bg-white py-16 text-primary md:py-24">
          <div className="container flex flex-col gap-10">
            {financialReportsSection && (
              <div className="flex flex-col gap-4">
                <h2 className="text-balance text-2xl font-light">
                  {financialReportsSection.title || "Financial reports"}
                </h2>
                {financialReportsSection.description ? (
                  <p className="max-w-[80ch] text-primary/80">{financialReportsSection.description}</p>
                ) : null}

                {reports.length > 0 ? (
                  <details className="group w-full max-w-xl border border-primary/15 bg-white p-4">
                    <summary className="cursor-pointer select-none text-base font-medium">
                      Download by year
                    </summary>
                    <div className="mt-4 flex flex-col gap-2">
                      {reports.map((r) => {
                        const year = r.year!;
                        const url = r.file!.url!;
                        const filename = r.file?.originalFilename || `financial-report-${year}.pdf`;
                        const label = r.label?.trim() || String(year);
                        return (
                          <a
                            key={`${year}-${url}`}
                            href={url}
                            download={filename}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-between gap-3 border border-primary/10 px-4 py-2 transition-colors hover:bg-secondary/40"
                          >
                            <span className="font-medium">{label}</span>
                            <span className="text-sm text-primary/70">PDF</span>
                          </a>
                        );
                      })}
                    </div>
                  </details>
                ) : (
                  <p className="text-primary/70">Reports will appear here once they’re added in Sanity.</p>
                )}
              </div>
            )}

            {feedbackSurvey && (
              <div className="flex flex-col gap-4 border-t border-primary/10 pt-10">
                <h2 className="text-balance text-2xl font-light">
                  {feedbackSurvey.title || "Customer feedback survey"}
                </h2>
                {feedbackSurvey.description ? (
                  <p className="max-w-[80ch] text-primary/80">{feedbackSurvey.description}</p>
                ) : null}

                {feedbackSurvey.url ? (
                  <div>
                    <a
                      href={feedbackSurvey.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-95"
                    >
                      {feedbackSurvey.buttonText || "Share feedback"}
                    </a>
                  </div>
                ) : (
                  <p className="text-primary/70">Add the survey link in Sanity to show the button.</p>
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}

export async function generateMetadata() {
  const missionAndValues = await sanityFetch<MissionAndValuesPageData>({
    query: MISSION_AND_VALUES_QUERY,
  });

  const { seo } = missionAndValues!;

  return {
    title: seo?.pageTitle,
    description: seo?.pageDescription,
    openGraph: {
      title: seo?.pageTitle,
      description: seo?.pageDescription,
      images: {
        url: seo?.socialMeta?.ogImage?.asset?.url!,
        alt: seo?.socialMeta?.ogImage?.asset?.alt!,
      },
    },
    twitter: {
      title: seo?.pageTitle,
      description: seo?.pageDescription,
      images: {
        url: seo?.socialMeta?.twitterImage?.asset?.url!,
        alt: seo?.socialMeta?.twitterImage?.asset?.alt!,
      },
    },
  };
}
