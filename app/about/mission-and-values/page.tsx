import Image from "next/image";
import { notFound } from "next/navigation";

import { AlternatingSections } from "@/components/shared/alternating-sections";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  annualReportsSection?: {
    title?: string | null;
    description?: string | null;
    reports?: Array<{
      year?: number | null;
      label?: string | null;
      file?: {
        url?: string | null;
        originalFilename?: string | null;
        mimeType?: string | null;
      } | null;
    }> | null;
  } | null;
  financialReportsSection?:
    | MissionAndValuesPageData["annualReportsSection"]
    | null;
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

  const {
    heroSection,
    additionalSections,
    annualReportsSection,
    feedbackSurvey,
  } = missionAndValues;

  const reports =
    annualReportsSection?.reports
      ?.filter((r) => Boolean(r?.year) && Boolean(r?.file?.url))
      .sort((a, b) => (b.year ?? 0) - (a.year ?? 0)) ?? [];

  const hasReports = reports.length > 0;
  const hasSurveyLink = Boolean(feedbackSurvey?.url?.trim());

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

      {(hasReports || hasSurveyLink) && (
        <section className="bg-white pb-16 text-primary md:pb-24">
          <div className="container">
            <div className="grid gap-8 md:items-start">
              {annualReportsSection && hasReports && (
                <div className="flex flex-col gap-5 border border-primary/10 bg-white p-6 md:p-8">
                  <div className="flex flex-col gap-3">
                    <h2 className="text-balance text-2xl font-light md:text-3xl">
                      {annualReportsSection.title}
                    </h2>
                    {annualReportsSection.description ? (
                      <p className="max-w-[80ch] text-primary/80">
                        {annualReportsSection.description}
                      </p>
                    ) : null}
                  </div>

                  <Accordion type="single" collapsible>
                    <AccordionItem
                      value="annual-reports"
                      className="border-b-0 bg-transparent px-0"
                    >
                      <AccordionTrigger className="text-left">
                        Download by year
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="flex flex-col gap-2">
                          {reports.map((r) => {
                            const year = r.year!;
                            const url = r.file!.url!;
                            const filename =
                              r.file?.originalFilename ||
                              `financial-report-${year}.pdf`;
                            const label = r.label?.trim() || String(year);
                            return (
                              <a
                                key={`${year}-${url}`}
                                href={url}
                                download={filename}
                                target="_blank"
                                rel="noreferrer"
                                className="group/link inline-flex items-center justify-between gap-3 border border-primary/10 bg-white px-4 py-3 transition-colors hover:bg-secondary/30"
                              >
                                <span className="font-medium">{label}</span>
                                <span className="inline-flex items-center gap-2 text-sm text-primary/70">
                                  <span className="hidden sm:inline">PDF</span>
                                  <span className="text-primary/50 transition-colors group-hover/link:text-primary/70">
                                    ↗
                                  </span>
                                </span>
                              </a>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}

              {feedbackSurvey && hasSurveyLink && (
                <div className="flex flex-col gap-5 border border-primary/10 bg-white p-6 md:p-8">
                  <div className="flex flex-col gap-3">
                    <h2 className="text-balance text-2xl font-light md:text-3xl">
                      {feedbackSurvey.title}
                    </h2>
                    {feedbackSurvey.description ? (
                      <p className="max-w-[80ch] text-primary/80">
                        {feedbackSurvey.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <a
                      href={feedbackSurvey.url!}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center border border-primary bg-white px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      {feedbackSurvey.buttonText}
                    </a>
                  </div>
                </div>
              )}
            </div>
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
