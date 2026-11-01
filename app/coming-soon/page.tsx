import Link from "next/link";

import ComingSoon from "@/components/shared/coming-soon";
import NewsletterSection from "@/components/shared/newsletter-section";
import { buildPageMetadata } from "@/lib/page-metadata";

/**
 * The gate page shown while coming soon mode is on, so noindex.
 *
 * It answered 200 with no canonical and no robots directive under the
 * homepage's title, which is the shape Search Console reports as "Duplicate
 * without user-selected canonical". It is not a page anybody should land on
 * from a search, in or out of coming soon mode.
 */
export const metadata = buildPageMetadata(null, {
  path: "/coming-soon",
  title: "Coming soon",
  description: "Curate Health, a curated health and wellness destination in Midtown Toronto.",
  noindex: true,
});

export default function LoginPage() {
  return (
    <div className="container flex flex-1 flex-col items-center justify-center">
      <ComingSoon />
      <NewsletterSection isComingSoon={true} />
      <p className="mt-4 text-center">
        If you are an admin of this site,{" "}
        <Link className="underline" href="/login">
          click here
        </Link>{" "}
        to login
      </p>
    </div>
  );
}
