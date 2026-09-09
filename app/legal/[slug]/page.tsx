import { notFound } from "next/navigation";

import { PortableText } from "next-sanity";

import Layout from "@/components/shared/layout";
import { buildPageMetadata } from "@/lib/page-metadata";
import {
  LAYOUT_QUERYResult,
  LEGAL_PAGE_BY_SLUG_QUERYResult,
} from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import { LAYOUT_QUERY, LEGAL_PAGE_BY_SLUG_QUERY } from "@/sanity/lib/queries";

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

  if (!legalPage) {
    return notFound();
  }

  const { body } = legalPage!;

  return (
    <Layout layout={layout}>
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

  return buildPageMetadata(seo);
}
