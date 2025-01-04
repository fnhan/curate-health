import React from "react";

import Layout from "@/components/shared/layout";
import { LAYOUT_QUERYResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/client";
import { LAYOUT_QUERY } from "@/sanity/lib/queries";

export default async function CafeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const layout = await sanityFetch<LAYOUT_QUERYResult>({
    query: LAYOUT_QUERY,
  });
  return <Layout layout={layout}>{children}</Layout>;
}
