import { SERVICES_PAGE_QUERYResult } from "@/sanity.types";
import { SERVICES_PAGE_QUERY } from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/server-client";

export default async function ServicesPage() {
  const servicesPage = await sanityFetch<SERVICES_PAGE_QUERYResult>({
    query: SERVICES_PAGE_QUERY,
  });

  return <></>;
}
