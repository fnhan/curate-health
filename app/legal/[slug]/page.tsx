import { notFound } from "next/navigation";

import { PortableText } from "next-sanity";

import Layout from "@/components/shared/layout";
import { SectionNavigation } from "@/components/shared/section-navigation";
import { buildPageMetadata } from "@/lib/page-metadata";
import {
  LAYOUT_QUERYResult,
  LEGAL_PAGES_NAV_QUERYResult,
  LEGAL_PAGE_BY_SLUG_QUERYResult,
} from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import {
  LAYOUT_QUERY,
  LEGAL_PAGES_NAV_QUERY,
  LEGAL_PAGE_BY_SLUG_QUERY,
} from "@/sanity/lib/queries";

export default async function LegalPage({
  params,
}: {
  params: { slug: string };
}) {
  const layout = await sanityFetch<LAYOUT_QUERYResult>({
    query: LAYOUT_QUERY,
  });

  const legalPage = await sanityFetch<LEGAL_PAGE_BY_SLUG_QUERYResult>({
    query: LEGAL_PAGE_BY_SLUG_QUERY,
    params: { slug: params.slug },
  });

  const legalPages = await sanityFetch<LEGAL_PAGES_NAV_QUERYResult>({
    query: LEGAL_PAGES_NAV_QUERY,
  });

  if (!legalPage) {
    return notFound();
  }

  const { body, title } = legalPage!;

  return (
    <Layout layout={layout}>
      {/*
        The section menu the rest of the site uses, in place of the breadcrumb
        trail these pages carried until 2026-09-20. The label is plain text
        rather than a link: there is no /legal index and none is planned, so
        linking it would point at a 404.
      */}
      <SectionNavigation
        ariaLabel="Legal"
        label="Legal"
        items={legalPages
          .filter((page) => page.slug)
          .map((page) => ({
            title: page.title ?? "",
            href: `/legal/${page.slug}`,
          }))}
      />
      <div className="bg-white">
        <div className="container py-20">
          <div className="container prose">
            <PortableText value={body!} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const legalPage = await sanityFetch<LEGAL_PAGE_BY_SLUG_QUERYResult>({
    query: LEGAL_PAGE_BY_SLUG_QUERY,
    params: { slug: params.slug },
  });

  if (!legalPage) {
    return null;
  }

  const { seo } = legalPage!;

  return buildPageMetadata(seo, { path: `/legal/${params.slug}` });
}
